import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentChunk, QuizQuestion, Topic, RevisionPlan } from '../types';
import { SearchResult } from './vector-store';

export interface GroundedAnswerResult {
  answer: string;
  citations: {
    docName: string;
    section: string;
    snippet: string;
  }[];
  modelUsed: string;
}

export class GeminiRAGService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string = '';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    if (key) {
      this.setApiKey(key);
    }
  }

  public setApiKey(key: string) {
    this.apiKey = key;
    this.genAI = new GoogleGenerativeAI(key);
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 10;
  }

  /**
   * Explain-This-Topic RAG Assistant
   * Strictly grounded in retrieved chunks
   */
  public async explainWithRAG(
    query: string,
    searchResults: SearchResult[]
  ): Promise<GroundedAnswerResult> {
    const citations = searchResults.map((r) => ({
      docName: r.chunk.docName,
      section: r.chunk.sectionTitle,
      snippet: r.highlightSnippet,
    }));

    if (searchResults.length === 0) {
      return {
        answer: "I couldn't find any relevant sections in your uploaded syllabus, textbook, or lecture notes. Please verify that your query matches topics in your uploaded documents.",
        citations: [],
        modelUsed: 'GapFinder Grounding Filter',
      };
    }

    const contextText = searchResults
      .map(
        (r, idx) =>
          `[Source ${idx + 1}]: ${r.chunk.docName} | Section: ${r.chunk.sectionTitle} (Page ~${r.chunk.pageNumber || 1})\n${r.chunk.content}`
      )
      .join('\n\n---\n\n');

    if (this.genAI && this.hasApiKey()) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are GapFinder AI, a precision academic diagnostic assistant.
Your task is to explain the user's question STRICTLY based on the retrieved study materials provided below.

RULES:
1. Ground your entire answer in the provided study materials. Do not bring in unverified external knowledge.
2. Explicitly cite your statements using bracketed citations, e.g. [Source 1] or [Source 2].
3. Explain the concepts clearly, identifying any common pitfalls or misconceptions students make.
4. Keep the tone encouraging, educational, and structured with headings or bullet points where appropriate.

USER QUERY:
${query}

RETRIEVED STUDY MATERIALS:
${contextText}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return {
          answer: responseText,
          citations,
          modelUsed: 'Gemini 1.5 Flash (Grounded RAG)',
        };
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local heuristic response:', err);
      }
    }

    // High quality local fallback response using the retrieved chunks
    const primaryChunk = searchResults[0].chunk;
    const secondaryChunk = searchResults[1]?.chunk;

    let fallbackAnswer = `### Grounded Explanation for: "${query}"\n\n`;
    fallbackAnswer += `Based directly on **${primaryChunk.docName}** (*${primaryChunk.sectionTitle}*):\n\n`;
    fallbackAnswer += `${primaryChunk.content}\n\n`;

    if (secondaryChunk) {
      fallbackAnswer += `#### Additional Context from ${secondaryChunk.docName} (${secondaryChunk.sectionTitle}):\n`;
      fallbackAnswer += `${secondaryChunk.content}\n\n`;
    }

    fallbackAnswer += `> **Key Takeaway for Exam Revision:** Review the exact conditions outlined above. This concept has appeared in past exam materials. Focus on understanding the step-by-step logic rather than memorizing.`;

    return {
      answer: fallbackAnswer,
      citations,
      modelUsed: 'GapFinder Semantic Engine (Local Fallback)',
    };
  }

  /**
   * Question Generation from Retrieved Material
   */
  public async generateQuestionsForTopic(
    topic: Topic,
    searchResults: SearchResult[],
    count: number = 3
  ): Promise<QuizQuestion[]> {
    if (searchResults.length === 0) return [];

    const contextText = searchResults
      .map((r, i) => `[Source ${i + 1}: ${r.chunk.docName} - ${r.chunk.sectionTitle}]:\n${r.chunk.content}`)
      .join('\n\n');

    if (this.genAI && this.hasApiKey()) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are a diagnostic assessment designer.
Generate ${count} rigorous diagnostic multiple-choice questions for the topic: "${topic.title}".
All questions MUST be grounded in the following study text. Do NOT test facts not present in this text.

Format your output as a valid JSON array of objects:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswerIndex": number (0 to 3),
    "explanation": "string explaining why the correct answer is right and why others are wrong with exact citation",
    "difficulty": "Easy" | "Medium" | "Hard",
    "citation": {
      "docName": "string",
      "section": "string",
      "snippet": "string excerpt from provided text"
    }
  }
]

STUDY TEXT:
${contextText}`;

        const response = await model.generateContent(prompt);
        const parsed = JSON.parse(response.response.text());

        return parsed.map((item: any, idx: number) => ({
          id: `q_gen_${topic.id}_${Date.now()}_${idx}`,
          topicId: topic.id,
          topicTitle: topic.title,
          question: item.question,
          options: item.options,
          correctAnswerIndex: item.correctAnswerIndex,
          explanation: item.explanation,
          difficulty: item.difficulty || 'Medium',
          citation: item.citation || {
            docName: searchResults[0].chunk.docName,
            section: searchResults[0].chunk.sectionTitle,
            snippet: searchResults[0].highlightSnippet,
          },
        }));
      } catch (err) {
        console.warn('Gemini question generation error, using fallback:', err);
      }
    }

    // Heuristic question generation from chunks
    const chunk = searchResults[0].chunk;
    return [
      {
        id: `q_loc_${topic.id}_1`,
        topicId: topic.id,
        topicTitle: topic.title,
        question: `According to your study material on ${topic.title} (${chunk.sectionTitle}), which core principle is highlighted?`,
        options: [
          `The mechanism defined in ${chunk.sectionTitle} enforces strict ordering and correctness invariants.`,
          `It is completely unconcerned with system states or preconditions.`,
          `It only applies to single-core hardware architectures from before 1990.`,
          `It does not require any memory synchronization or data structures.`,
        ],
        correctAnswerIndex: 0,
        explanation: `In ${chunk.docName} (${chunk.sectionTitle}), the material demonstrates the invariant verification and algorithmic steps required for ${topic.title}.`,
        difficulty: 'Medium',
        citation: {
          docName: chunk.docName,
          section: chunk.sectionTitle,
          snippet: chunk.content.substring(0, 180) + '...',
        },
      },
    ];
  }

  /**
   * Diagnostic Gap Analysis
   */
  public analyzeGaps(topics: Topic[]): {
    overallReadinessScore: number;
    weakTopics: Topic[];
    mediumTopics: Topic[];
    strongTopics: Topic[];
    summary: string;
    criticalGapsNotice: string;
  } {
    const weakTopics = topics.filter((t) => t.status === 'weak' || t.masteryScore < 50);
    const mediumTopics = topics.filter((t) => t.status === 'medium' || (t.masteryScore >= 50 && t.masteryScore < 75));
    const strongTopics = topics.filter((t) => t.status === 'strong' || t.masteryScore >= 75);

    const testedCount = weakTopics.length + mediumTopics.length + strongTopics.length;
    let totalScore = 0;
    topics.forEach((t) => {
      totalScore += t.masteryScore;
    });

    const overallReadinessScore = testedCount > 0 ? Math.round(totalScore / topics.length) : 50;

    // High yield weak topics represent critical risk
    const criticalWeak = weakTopics.filter((t) => t.examFrequency === 'High');
    let criticalGapsNotice = '';

    if (criticalWeak.length > 0) {
      criticalGapsNotice = `Urgent: You have ${criticalWeak.length} High-Yield topic(s) categorized as WEAK: "${criticalWeak.map((t) => t.title).join('", "')}". These appear consistently on past exam papers and should be prioritized immediately.`;
    } else if (weakTopics.length > 0) {
      criticalGapsNotice = `Attention: ${weakTopics.length} topic(s) need revision before the exam.`;
    } else {
      criticalGapsNotice = 'Excellent progress! Your conceptual grasp across all assessed units is solid.';
    }

    const summary = `Diagnosed ${topics.length} topics across your syllabus. Found ${weakTopics.length} weak, ${mediumTopics.length} medium, and ${strongTopics.length} strong areas. Current exam readiness stands at ${overallReadinessScore}%.`;

    return {
      overallReadinessScore,
      weakTopics,
      mediumTopics,
      strongTopics,
      summary,
      criticalGapsNotice,
    };
  }
}
