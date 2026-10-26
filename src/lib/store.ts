import {
  UserProfile,
  StudyDocument,
  Topic,
  QuizQuestion,
  QuizAttempt,
  RevisionPlan,
  DocumentChunk,
} from './types';
import {
  DEMO_USER,
  DEMO_DOCUMENTS,
  DEMO_TOPICS,
  DEMO_QUESTIONS,
  DEMO_REVISION_PLAN,
} from './demo-data';
import { chunkDocument } from './rag/chunker';
import { SimpleVectorStore } from './rag/vector-store';

const STORAGE_KEYS = {
  USER: 'gapfinder_user',
  DOCS: 'gapfinder_docs',
  TOPICS: 'gapfinder_topics',
  QUESTIONS: 'gapfinder_questions',
  ATTEMPTS: 'gapfinder_attempts',
  PLAN: 'gapfinder_plan',
  API_KEY: 'gapfinder_gemini_key',
};

export class AppStore {
  private static instance: AppStore;
  private vectorStore: SimpleVectorStore;

  private constructor() {
    this.vectorStore = new SimpleVectorStore();
    if (typeof window !== 'undefined') {
      this.initStore();
    }
  }

  public static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public initStore() {
    if (!this.isClient()) return;

    // Initialize with demo data if empty
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCS)) {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(DEMO_DOCUMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(DEMO_TOPICS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEMO_QUESTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLAN)) {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(DEMO_REVISION_PLAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([]));
    }

    // Index all documents in vector store
    this.reindexAllChunks();
  }

  public resetToDemo() {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(DEMO_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(DEMO_TOPICS));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEMO_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(DEMO_REVISION_PLAN));
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([]));
    this.reindexAllChunks();
  }

  public reindexAllChunks(): SimpleVectorStore {
    const docs = this.getDocuments();
    const allChunks: DocumentChunk[] = [];
    for (const doc of docs) {
      const chunks = chunkDocument(doc);
      allChunks.push(...chunks);
    }
    this.vectorStore.clear();
    this.vectorStore.addChunks(allChunks);
    return this.vectorStore;
  }

  public getVectorStore(): SimpleVectorStore {
    if (this.vectorStore.getAllChunks().length === 0) {
      this.reindexAllChunks();
    }
    return this.vectorStore;
  }

  // --- API Key Management ---
  public getApiKey(): string {
    if (!this.isClient()) return '';
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  }

  public setApiKey(key: string) {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  }

  // --- User & Streak ---
  public getUser(): UserProfile {
    if (!this.isClient()) return DEMO_USER;
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : DEMO_USER;
  }

  public updateUser(user: UserProfile) {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  public recordDailyActivity(): { streakIncreased: boolean; xpAwarded: number } {
    if (!this.isClient()) return { streakIncreased: false, xpAwarded: 0 };
    const user = this.getUser();
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActiveDate ? user.lastActiveDate.split('T')[0] : '';

    let streakIncreased = false;
    let xpAwarded = 25; // Base XP for studying today

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActive === yesterdayStr) {
        user.streakDays += 1;
        streakIncreased = true;
      } else if (lastActive === '') {
        user.streakDays = 1;
        streakIncreased = true;
      } else {
        // Streak reset if gap is more than 1 day
        user.streakDays = 1;
      }

      user.lastActiveDate = new Date().toISOString();
      user.xp += xpAwarded;
      user.level = Math.floor(user.xp / 150) + 1;
      this.updateUser(user);
    }

    return { streakIncreased, xpAwarded };
  }

  public addXp(amount: number) {
    if (!this.isClient()) return;
    const user = this.getUser();
    user.xp += amount;
    user.level = Math.floor(user.xp / 150) + 1;
    this.updateUser(user);
  }

  // --- Documents ---
  public getDocuments(): StudyDocument[] {
    if (!this.isClient()) return DEMO_DOCUMENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    return raw ? JSON.parse(raw) : DEMO_DOCUMENTS;
  }

  public addDocument(doc: StudyDocument) {
    if (!this.isClient()) return;
    const docs = this.getDocuments();
    docs.push(doc);
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
    this.reindexAllChunks();
    this.addXp(50);
  }

  public deleteDocument(id: string) {
    if (!this.isClient()) return;
    const docs = this.getDocuments().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
    this.reindexAllChunks();
  }

  // --- Topics ---
  public getTopics(): Topic[] {
    if (!this.isClient()) return DEMO_TOPICS;
    const raw = localStorage.getItem(STORAGE_KEYS.TOPICS);
    return raw ? JSON.parse(raw) : DEMO_TOPICS;
  }

  public updateTopicMastery(topicId: string, newScore: number) {
    if (!this.isClient()) return;
    const topics = this.getTopics();
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      topic.masteryScore = Math.max(0, Math.min(100, newScore));
      topic.status = topic.masteryScore < 50 ? 'weak' : topic.masteryScore < 75 ? 'medium' : 'strong';
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    }
  }

  // --- Questions & Quizzes ---
  public getQuestions(): QuizQuestion[] {
    if (!this.isClient()) return DEMO_QUESTIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return raw ? JSON.parse(raw) : DEMO_QUESTIONS;
  }

  public addQuestions(newQuestions: QuizQuestion[]) {
    if (!this.isClient()) return;
    const questions = this.getQuestions();
    questions.push(...newQuestions);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  public recordQuizAttempt(attempt: QuizAttempt) {
    if (!this.isClient()) return;
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    const attempts: QuizAttempt[] = raw ? JSON.parse(raw) : [];
    attempts.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));

    // Award XP
    this.addXp(attempt.percentage > 70 ? 100 : 60);

    // Update topic scores dynamically
    const questions = this.getQuestions();
    const topicResults: Record<string, { correct: number; total: number }> = {};

    for (const ans of attempt.answers) {
      const q = questions.find((item) => item.id === ans.questionId);
      if (q) {
        if (!topicResults[q.topicId]) {
          topicResults[q.topicId] = { correct: 0, total: 0 };
        }
        topicResults[q.topicId].total += 1;
        if (ans.isCorrect) {
          topicResults[q.topicId].correct += 1;
        }
      }
    }

    const topics = this.getTopics();
    for (const [topicId, stats] of Object.entries(topicResults)) {
      const topic = topics.find((t) => t.id === topicId);
      if (topic) {
        const attemptScore = Math.round((stats.correct / stats.total) * 100);
        // Blended score
        topic.masteryScore = Math.round((topic.masteryScore + attemptScore) / 2);
        topic.status = topic.masteryScore < 50 ? 'weak' : topic.masteryScore < 75 ? 'medium' : 'strong';
      }
    }
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  }

  public getQuizAttempts(): QuizAttempt[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  }

  // --- Revision Plan ---
  public getRevisionPlan(): RevisionPlan {
    if (!this.isClient()) return DEMO_REVISION_PLAN;
    const raw = localStorage.getItem(STORAGE_KEYS.PLAN);
    return raw ? JSON.parse(raw) : DEMO_REVISION_PLAN;
  }

  public updateRevisionPlan(plan: RevisionPlan) {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
  }

  public toggleTaskCompletion(dayNumber: number, taskId: string): boolean {
    if (!this.isClient()) return false;
    const plan = this.getRevisionPlan();
    const day = plan.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return false;

    const task = day.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.completed = !task.completed;
    day.completed = day.tasks.every((t) => t.completed);

    if (task.completed) {
      this.addXp(30);
    }

    this.updateRevisionPlan(plan);
    return task.completed;
  }
}
