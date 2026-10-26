import { NextRequest, NextResponse } from 'next/server';
import { GeminiRAGService } from '@/lib/rag/gemini';
import { SimpleVectorStore } from '@/lib/rag/vector-store';
import { chunkDocument } from '@/lib/rag/chunker';
import { DEMO_DOCUMENTS, DEMO_TOPICS, DEMO_QUESTIONS } from '@/lib/demo-data';
import { Topic } from '@/lib/types';

let serverVectorStore: SimpleVectorStore | null = null;

function getServerVectorStore(): SimpleVectorStore {
  if (!serverVectorStore) {
    serverVectorStore = new SimpleVectorStore();
    for (const doc of DEMO_DOCUMENTS) {
      const chunks = chunkDocument(doc);
      serverVectorStore.addChunks(chunks);
    }
  }
  return serverVectorStore;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, count = 3, apiKey } = body;

    const vectorStore = getServerVectorStore();
    const topic = DEMO_TOPICS.find((t) => t.id === topicId) || {
      id: topicId || 'topic_custom',
      title: topicId || 'Operating Systems Concepts',
      unit: 'General',
      description: 'Course study material',
      subtopics: [],
      examFrequency: 'High',
      pastPaperQuestionsCount: 2,
      masteryScore: 50,
      status: 'untested',
      citationSources: [],
    } as Topic;

    // Search for chunks matching the topic
    const searchResults = vectorStore.search(`${topic.title} ${topic.description} ${topic.subtopics.join(' ')}`, 3);

    const clientApiKey = apiKey || req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;
    const ragService = new GeminiRAGService(clientApiKey || undefined);

    // If matching preloaded questions exist and no Gemini key is given, use high-fidelity questions
    const matchingPreloaded = DEMO_QUESTIONS.filter((q) => q.topicId === topicId);
    if (!clientApiKey && matchingPreloaded.length > 0) {
      return NextResponse.json({
        success: true,
        questions: matchingPreloaded,
        source: 'Pre-indexed Grounded Material',
      });
    }

    const generated = await ragService.generateQuestionsForTopic(topic, searchResults, count);

    return NextResponse.json({
      success: true,
      questions: generated.length > 0 ? generated : matchingPreloaded,
      source: clientApiKey ? 'Gemini 1.5 Flash Grounded Generation' : 'Grounded Semantic Template',
    });
  } catch (error: any) {
    console.error('Quiz Generation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
}
