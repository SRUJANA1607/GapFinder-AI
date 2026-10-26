export type DocumentCategory = 'syllabus' | 'textbook' | 'notes' | 'past_paper';

export interface StudyDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadedAt: string;
  fileSize: string;
  pageCount?: number;
  content: string;
  chunksCount: number;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docName: string;
  category: DocumentCategory;
  sectionTitle: string;
  pageNumber?: number;
  content: string;
  embedding?: number[];
}

export interface Topic {
  id: string;
  title: string;
  unit: string;
  description: string;
  subtopics: string[];
  examFrequency: 'High' | 'Medium' | 'Low';
  pastPaperQuestionsCount: number;
  masteryScore: number; // 0 - 100
  status: 'weak' | 'medium' | 'strong' | 'untested';
  diagnosisReason?: string;
  citationSources: {
    docName: string;
    section: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  citation: {
    docName: string;
    section: string;
    snippet: string;
  };
}

export interface QuizAttempt {
  id: string;
  date: string;
  topicIds: string[];
  totalQuestions: number;
  score: number;
  percentage: number;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    confidence: 'high' | 'medium' | 'guess';
    timeSpentSeconds: number;
  }[];
}

export interface GapDiagnosis {
  overallReadinessScore: number; // 0 - 100
  weakTopics: Topic[];
  mediumTopics: Topic[];
  strongTopics: Topic[];
  summary: string;
  criticalGapsNotice: string;
  totalTestedTopics: number;
}

export interface RevisionDayPlan {
  dayNumber: number;
  dateStr: string;
  focusTitle: string;
  estimatedMinutes: number;
  completed: boolean;
  tasks: {
    id: string;
    topicId: string;
    topicTitle: string;
    actionType: 'Review Notes' | 'Solve Past Paper Questions' | 'Re-test Quiz' | 'Deep Dive Flashcards';
    sourceReference: string;
    durationMinutes: number;
    completed: boolean;
    priority: 'Urgent' | 'High' | 'Medium';
  }[];
}

export interface RevisionPlan {
  id: string;
  createdAt: string;
  targetExamDate: string;
  daysRemaining: number;
  dailyHoursAvailable: number;
  totalStudyHours: number;
  days: RevisionDayPlan[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  citations?: {
    docName: string;
    section: string;
    snippet: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'judge' | 'teacher';
  phone?: string;
  bio?: string;
  institution?: string;
  degree?: string;
  department?: string;
  yearSemester?: string;
  rollNumber?: string;
  academicInterests?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  createdAt?: string;
  streakDays: number;
  lastActiveDate: string;
  xp: number;
  level: number;
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }[];
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  overallScore: number;
  quizzesTaken: number;
  weakTopicsCount: number;
  weakestTopic: string;
  streakDays: number;
  lastActive: string;
  status: 'Needs Support' | 'On Track' | 'Excelling';
}

export interface ClassTopicInsight {
  topicId: string;
  title: string;
  unit: string;
  classAverageScore: number;
  studentsWeakCount: number;
  studentsMediumCount: number;
  studentsStrongCount: number;
  commonMisconception: string;
  examFrequency: 'High' | 'Medium' | 'Low';
  recommendedIntervention: string;
}

export interface ClassOverviewData {
  className: string;
  courseCode: string;
  semester: string;
  totalStudents: number;
  averageScore: number;
  diagnosticAttemptsCount: number;
  criticalGapsCount: number;
  topClassWeaknesses: ClassTopicInsight[];
  students: StudentRecord[];
}
