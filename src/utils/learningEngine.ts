import {
  LearningModule,
  MasteryStatus,
  PracticeMode,
  SmkMajor,
  UserProgress,
  VocabWord,
} from '../types/vocab';

export const STORAGE_KEY = 'vokakey_smk_progress_v1';
export const DEFAULT_DAILY_TARGET = 15;

export function getTodayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialProgress(today: string = getTodayIsoDate()): UserProgress {
  return {
    words: {},
    dailyCount: 0,
    dailyDate: today,
    dailyTarget: DEFAULT_DAILY_TARGET,
    totalCorrect: 0,
    totalAttempted: 0,
    history: [],
  };
}

export function loadProgress(today: string = getTodayIsoDate()): UserProgress {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createInitialProgress(today);
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress(today);
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    const isSameDay = parsed.dailyDate === today;
    return {
      words: parsed.words && typeof parsed.words === 'object' ? parsed.words : {},
      dailyCount: isSameDay && typeof parsed.dailyCount === 'number' ? parsed.dailyCount : 0,
      dailyDate: today,
      dailyTarget: typeof parsed.dailyTarget === 'number' ? parsed.dailyTarget : DEFAULT_DAILY_TARGET,
      totalCorrect: typeof parsed.totalCorrect === 'number' ? parsed.totalCorrect : 0,
      totalAttempted: typeof parsed.totalAttempted === 'number' ? parsed.totalAttempted : 0,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 30) : [],
    };
  } catch {
    return createInitialProgress(today);
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch {
    // Ignore quota or private-browsing storage restrictions
  }
}

export function getWordStatus(progress: UserProgress, wordId: string): MasteryStatus {
  return progress.words[wordId]?.status ?? 'new';
}

export function updateWordMastery(
  progress: UserProgress,
  wordId: string,
  newStatus: MasteryStatus,
  today: string = getTodayIsoDate()
): UserProgress {
  const existing = progress.words[wordId];
  const sameDay = progress.dailyDate === today;
  const baseDaily = sameDay ? progress.dailyCount : 0;

  const isPositive = newStatus === 'mastered' || newStatus === 'review';
  const nextEntry = {
    status: newStatus,
    correctCount: (existing?.correctCount ?? 0) + (isPositive ? 1 : 0),
    wrongCount: (existing?.wrongCount ?? 0) + (newStatus === 'learning' ? 1 : 0),
    lastStudiedAt: today,
  };

  return {
    ...progress,
    dailyDate: today,
    dailyCount: baseDaily + 1,
    words: {
      ...progress.words,
      [wordId]: nextEntry,
    },
  };
}

export interface PracticeOutcomeInput {
  mode: PracticeMode;
  moduleId: string;
  correctWordIds: string[];
  wrongWordIds: string[];
}

export function recordPracticeOutcome(
  progress: UserProgress,
  outcome: PracticeOutcomeInput,
  today: string = getTodayIsoDate()
): UserProgress {
  const sameDay = progress.dailyDate === today;
  let nextWords = { ...progress.words };

  for (const id of outcome.correctWordIds) {
    const prev = nextWords[id];
    const nextCorrect = (prev?.correctCount ?? 0) + 1;
    const nextStatus: MasteryStatus =
      prev?.status === 'mastered' || nextCorrect >= 2 ? 'mastered' : 'review';
    nextWords[id] = {
      status: nextStatus,
      correctCount: nextCorrect,
      wrongCount: prev?.wrongCount ?? 0,
      lastStudiedAt: today,
    };
  }

  for (const id of outcome.wrongWordIds) {
    const prev = nextWords[id];
    nextWords[id] = {
      status: 'learning',
      correctCount: prev?.correctCount ?? 0,
      wrongCount: (prev?.wrongCount ?? 0) + 1,
      lastStudiedAt: today,
    };
  }

  const score = outcome.correctWordIds.length;
  const total = score + outcome.wrongWordIds.length;

  return {
    ...progress,
    dailyDate: today,
    dailyCount: (sameDay ? progress.dailyCount : 0) + total,
    totalCorrect: progress.totalCorrect + score,
    totalAttempted: progress.totalAttempted + total,
    words: nextWords,
    history: [
      {
        mode: outcome.mode,
        moduleId: outcome.moduleId,
        score,
        total,
        completedAt: new Date().toISOString(),
      },
      ...progress.history,
    ].slice(0, 30),
  };
}

export interface OverallStats {
  totalWords: number;
  masteredCount: number;
  reviewCount: number;
  learningCount: number;
  newCount: number;
  masteryPercent: number;
  accuracyPercent: number;
  total2025Words: number;
  mastered2025Words: number;
}

export function computeOverallStats(
  vocabulary: VocabWord[],
  progress: UserProgress
): OverallStats {
  let masteredCount = 0;
  let reviewCount = 0;
  let learningCount = 0;
  let total2025Words = 0;
  let mastered2025Words = 0;

  for (const w of vocabulary) {
    const st = getWordStatus(progress, w.id);
    if (st === 'mastered') masteredCount += 1;
    else if (st === 'review') reviewCount += 1;
    else if (st === 'learning') learningCount += 1;

    if (w.is2025Addition) {
      total2025Words += 1;
      if (st === 'mastered') mastered2025Words += 1;
    }
  }

  const totalWords = vocabulary.length;
  const newCount = Math.max(0, totalWords - masteredCount - reviewCount - learningCount);
  const masteryPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
  const accuracyPercent =
    progress.totalAttempted > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
      : 0;

  return {
    totalWords,
    masteredCount,
    reviewCount,
    learningCount,
    newCount,
    masteryPercent,
    accuracyPercent,
    total2025Words,
    mastered2025Words,
  };
}

export interface ModuleStats {
  total: number;
  mastered: number;
  inProgress: number;
  percent: number;
}

export function computeModuleStats(
  moduleId: string,
  vocabulary: VocabWord[],
  progress: UserProgress
): ModuleStats {
  const words = vocabulary.filter((w) => w.moduleId === moduleId);
  let mastered = 0;
  let inProgress = 0;

  for (const w of words) {
    const st = getWordStatus(progress, w.id);
    if (st === 'mastered') mastered += 1;
    else if (st === 'learning' || st === 'review') inProgress += 1;
  }

  const total = words.length;
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return { total, mastered, inProgress, percent };
}

export function filterModulesByMajor(
  modules: LearningModule[],
  major: SmkMajor
): LearningModule[] {
  if (major === 'all') return modules;
  return modules.filter((m) => m.majors.includes(major));
}

export interface VocabFilterOptions {
  query?: string;
  moduleId?: string;
  letter?: string;
  status?: MasteryStatus | 'all' | 'unmastered';
  only2025?: boolean;
  onlyBrAm?: boolean;
}

export function filterVocabulary(
  vocabulary: VocabWord[],
  progress: UserProgress,
  options: VocabFilterOptions
): VocabWord[] {
  const q = (options.query ?? '').trim().toLowerCase();
  const letter = (options.letter ?? 'all').toLowerCase();

  return vocabulary.filter((item) => {
    if (options.moduleId && options.moduleId !== 'all' && item.moduleId !== options.moduleId) {
      return false;
    }
    if (options.only2025 && !item.is2025Addition) {
      return false;
    }
    if (options.onlyBrAm && !item.brAmNote) {
      return false;
    }
    if (letter !== 'all' && !item.word.toLowerCase().startsWith(letter)) {
      return false;
    }
    if (options.status && options.status !== 'all') {
      const st = getWordStatus(progress, item.id);
      if (options.status === 'unmastered') {
        if (st === 'mastered') return false;
      } else if (st !== options.status) {
        return false;
      }
    }
    if (q) {
      const haystack = [
        item.word,
        item.meaningId,
        item.cambridgeTopic,
        item.pos,
        ...(item.altSpellings ?? []),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function normalizeSpelling(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ');
}

export function checkSpellingAnswer(userInput: string, word: VocabWord): boolean {
  const cleaned = normalizeSpelling(userInput);
  if (!cleaned) return false;
  const accepted = [word.word, ...(word.altSpellings ?? [])].map(normalizeSpelling);
  return accepted.includes(cleaned);
}

// Deterministic seeded PRNG (Mulberry32) for testable, reproducible quizzes
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const rand = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(rand * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export interface ContextQuizQuestion {
  id: string;
  word: VocabWord;
  promptType: 'cloze' | 'meaning';
  sentenceWithBlank?: string;
  promptTranslation: string;
  options: { id: string; label: string; meaningId: string }[];
  correctOptionId: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createClozeSentence(sentence: string, targetWord: string): string | null {
  const pattern = new RegExp(`\\b${escapeRegExp(targetWord)}(s|es|ed|ing)?\\b`, 'i');
  if (!pattern.test(sentence)) return null;
  return sentence.replace(pattern, '_____');
}

export function generateContextQuestions(
  pool: VocabWord[],
  allVocabulary: VocabWord[],
  count: number = 8,
  seed: number = Date.now()
): ContextQuizQuestion[] {
  const source = pool.length > 0 ? pool : allVocabulary;
  const selected = seededShuffle(source, seed).slice(0, Math.min(count, source.length));

  return selected.map((word, idx) => {
    const clozeSmk = createClozeSentence(word.smkContextEn, word.word);
    const clozeCam = clozeSmk ?? createClozeSentence(word.exampleEn, word.word);

    // Prefer distractors from same module first, then full vocabulary
    const sameModule = allVocabulary.filter(
      (w) => w.id !== word.id && w.moduleId === word.moduleId
    );
    const others = allVocabulary.filter(
      (w) => w.id !== word.id && w.moduleId !== word.moduleId
    );

    const distractorPool = [
      ...seededShuffle(sameModule, seed + idx * 17 + 1),
      ...seededShuffle(others, seed + idx * 31 + 3),
    ];

    const chosenDistractors: VocabWord[] = [];
    const seenLabels = new Set<string>([word.word.toLowerCase()]);

    for (const candidate of distractorPool) {
      if (chosenDistractors.length >= 3) break;
      const lower = candidate.word.toLowerCase();
      if (!seenLabels.has(lower)) {
        seenLabels.add(lower);
        chosenDistractors.push(candidate);
      }
    }

    const optionItems = seededShuffle([word, ...chosenDistractors], seed + idx * 43 + 7).map(
      (w) => ({
        id: w.id,
        label: w.word,
        meaningId: w.meaningId,
      })
    );

    if (clozeSmk) {
      return {
        id: `q-${word.id}-${idx}`,
        word,
        promptType: 'cloze',
        sentenceWithBlank: clozeSmk,
        promptTranslation: word.smkContextId,
        options: optionItems,
        correctOptionId: word.id,
      };
    }

    if (clozeCam) {
      return {
        id: `q-${word.id}-${idx}`,
        word,
        promptType: 'cloze',
        sentenceWithBlank: clozeCam,
        promptTranslation: word.exampleId,
        options: optionItems,
        correctOptionId: word.id,
      };
    }

    return {
      id: `q-${word.id}-${idx}`,
      word,
      promptType: 'meaning',
      promptTranslation: word.meaningId,
      options: optionItems,
      correctOptionId: word.id,
    };
  });
}

export interface MatchTile {
  tileId: string;
  wordId: string;
  text: string;
  side: 'en' | 'id';
  pos?: string;
}

export interface MatchBoard {
  leftTiles: MatchTile[];
  rightTiles: MatchTile[];
  words: VocabWord[];
}

export function generateMatchBoard(
  pool: VocabWord[],
  allVocabulary: VocabWord[],
  pairCount: number = 6,
  seed: number = Date.now()
): MatchBoard {
  const source = pool.length >= pairCount ? pool : allVocabulary;
  const words = seededShuffle(source, seed).slice(0, Math.min(pairCount, source.length));

  const leftTiles: MatchTile[] = seededShuffle(
    words.map((w) => ({
      tileId: `en-${w.id}`,
      wordId: w.id,
      text: w.word,
      side: 'en' as const,
      pos: w.pos,
    })),
    seed + 11
  );

  const rightTiles: MatchTile[] = seededShuffle(
    words.map((w) => ({
      tileId: `id-${w.id}`,
      wordId: w.id,
      text: w.meaningId,
      side: 'id' as const,
    })),
    seed + 29
  );

  return { leftTiles, rightTiles, words };
}

export interface SentencePuzzle {
  id: string;
  word: VocabWord;
  tokens: string[];
  shuffledTokens: { tokenId: string; text: string }[];
  translationId: string;
}

export function generateSentencePuzzles(
  pool: VocabWord[],
  allVocabulary: VocabWord[],
  count: number = 5,
  seed: number = Date.now()
): SentencePuzzle[] {
  const source = pool.length > 0 ? pool : allVocabulary;
  const candidates = source.filter((w) => {
    const len = w.smkContextEn.split(/\s+/).length;
    return len >= 5 && len <= 12;
  });
  const usable = candidates.length >= count ? candidates : source;
  const chosen = seededShuffle(usable, seed).slice(0, Math.min(count, usable.length));

  return chosen.map((word, idx) => {
    const sentence =
      word.smkContextEn.split(/\s+/).length <= 12 ? word.smkContextEn : word.exampleEn;
    const translationId =
      word.smkContextEn.split(/\s+/).length <= 12 ? word.smkContextId : word.exampleId;
    const tokens = sentence.trim().split(/\s+/);
    const tagged = tokens.map((text, tIdx) => ({
      tokenId: `${word.id}-t-${tIdx}`,
      text,
    }));

    let shuffled = seededShuffle(tagged, seed + idx * 53 + 19);
    // Guarantee the shuffled order differs from the answer when length > 1
    if (tokens.length > 1 && shuffled.every((item, i) => item.text === tokens[i])) {
      shuffled = [...shuffled.slice(1), shuffled[0]];
    }

    return {
      id: `sp-${word.id}-${idx}`,
      word,
      tokens,
      shuffledTokens: shuffled,
      translationId,
    };
  });
}

export function buildSpellingHint(word: string, revealCount: number): string {
  const chars = word.split('');
  let revealed = 0;
  return chars
    .map((ch, idx) => {
      if (ch === ' ' || ch === '-' || ch === "'") return ch;
      if (idx === 0 || revealed < revealCount) {
        revealed += 1;
        return ch;
      }
      return '_';
    })
    .join(' ');
}
