export type SmkMajor =
  | 'all'
  | 'tkj-rpl'
  | 'teknik-otomotif'
  | 'perhotelan-kuliner'
  | 'bisnis-perkantoran'
  | 'kesehatan-k3'
  | 'umum-ujian';

export type MasteryStatus = 'new' | 'learning' | 'review' | 'mastered';

export type ActiveView = 'modules' | 'flashcards' | 'practice' | 'dictionary' | 'reference';

export type PracticeMode = 'context-quiz' | 'spelling' | 'match' | 'sentence-builder';

export type AccentType = 'en-GB' | 'en-US';

export interface VocabWord {
  id: string;
  word: string;
  pos: string; // e.g., 'n', 'v', 'adj', 'adv', 'phr v', 'n & v', 'prep phr'
  phonetic: string;
  meaningId: string;
  moduleId: string;
  cambridgeTopic: string;
  exampleEn: string;
  exampleId: string;
  smkContextEn: string;
  smkContextId: string;
  brAmNote?: string;
  altSpellings?: string[];
  is2025Addition?: boolean;
  usageTip?: string;
}

export interface LearningModule {
  id: string;
  number: string;
  title: string;
  cambridgeTopics: string[];
  description: string;
  majors: Exclude<SmkMajor, 'all'>[];
  smkRelevanceLabel: string;
}

export interface WordProgressEntry {
  status: MasteryStatus;
  correctCount: number;
  wrongCount: number;
  lastStudiedAt: string;
}

export interface PracticeHistoryEntry {
  mode: PracticeMode;
  moduleId: string;
  score: number;
  total: number;
  completedAt: string;
}

export interface UserProgress {
  words: Record<string, WordProgressEntry>;
  dailyCount: number;
  dailyDate: string; // YYYY-MM-DD
  dailyTarget: number;
  totalCorrect: number;
  totalAttempted: number;
  history: PracticeHistoryEntry[];
}
