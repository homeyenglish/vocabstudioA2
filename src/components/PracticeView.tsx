import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Volume2,
  XCircle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { LEARNING_MODULES } from '../data/modules';
import { AccentType, PracticeMode, UserProgress, VocabWord } from '../types/vocab';
import {
  buildSpellingHint,
  checkSpellingAnswer,
  filterVocabulary,
  generateContextQuestions,
  generateMatchBoard,
  generateSentencePuzzles,
  PracticeOutcomeInput,
} from '../utils/learningEngine';
import { isSpeechSupported, speakEnglish } from '../utils/speech';

interface PracticeViewProps {
  vocabulary: VocabWord[];
  progress: UserProgress;
  selectedModuleId: string;
  accent: AccentType;
  onChangeModule: (moduleId: string) => void;
  onCompleteSession: (outcome: PracticeOutcomeInput) => void;
  onOpenFlashcardsForModule: (moduleId: string) => void;
}

const PRACTICE_MODES: { id: PracticeMode; label: string; subtitle: string }[] = [
  {
    id: 'context-quiz',
    label: 'Kuis Konteks SMK',
    subtitle: 'Lengkapi kalimat dunia kerja dan ujian A2 Key',
  },
  {
    id: 'spelling',
    label: 'Dengar & Eja',
    subtitle: 'Latih ejaan produktif (menerima Br Eng & Am Eng)',
  },
  {
    id: 'match',
    label: 'Pasangkan Cepat',
    subtitle: 'Cocokkan 6 pasangan kosakata Inggris–Indonesia',
  },
  {
    id: 'sentence-builder',
    label: 'Susun Kalimat',
    subtitle: 'Rangkai potongan kata menjadi kalimat profesional',
  },
];

interface SessionSummary {
  mode: PracticeMode;
  correctWords: VocabWord[];
  wrongWords: VocabWord[];
  elapsedSeconds?: number;
}

export function PracticeView({
  vocabulary,
  progress,
  selectedModuleId,
  accent,
  onChangeModule,
  onCompleteSession,
  onOpenFlashcardsForModule,
}: PracticeViewProps) {
  const [mode, setMode] = useState<PracticeMode>('context-quiz');
  const [onlyUnmastered, setOnlyUnmastered] = useState(false);
  const [seed, setSeed] = useState<number>(() => Date.now());
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const pool = useMemo(() => {
    const filtered = filterVocabulary(vocabulary, progress, {
      moduleId: selectedModuleId,
      status: onlyUnmastered ? 'unmastered' : 'all',
    });
    return filtered.length >= 4 ? filtered : filterVocabulary(vocabulary, progress, { moduleId: selectedModuleId });
  }, [vocabulary, progress, selectedModuleId, onlyUnmastered]);

  // --- Mode 1: Context Quiz State ---
  const contextQuestions = useMemo(
    () => generateContextQuestions(pool, vocabulary, 8, seed),
    [pool, vocabulary, seed]
  );
  const [cqIndex, setCqIndex] = useState(0);
  const [cqSelectedId, setCqSelectedId] = useState<string | null>(null);
  const [cqCorrect, setCqCorrect] = useState<VocabWord[]>([]);
  const [cqWrong, setCqWrong] = useState<VocabWord[]>([]);

  // --- Mode 2: Spelling State ---
  const spellingItems = useMemo(
    () => generateContextQuestions(pool, vocabulary, 6, seed + 101).map((q) => q.word),
    [pool, vocabulary, seed]
  );
  const [spIndex, setSpIndex] = useState(0);
  const [spInput, setSpInput] = useState('');
  const [spHintCount, setSpHintCount] = useState(1);
  const [spChecked, setSpChecked] = useState<'correct' | 'wrong' | null>(null);
  const [spCorrect, setSpCorrect] = useState<VocabWord[]>([]);
  const [spWrong, setSpWrong] = useState<VocabWord[]>([]);

  // --- Mode 3: Match State ---
  const matchBoard = useMemo(
    () => generateMatchBoard(pool, vocabulary, 6, seed + 202),
    [pool, vocabulary, seed]
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedWordIds, setMatchedWordIds] = useState<string[]>([]);
  const [matchErrorPair, setMatchErrorPair] = useState<{ left: string; right: string } | null>(null);
  const [matchWrongIds, setMatchWrongIds] = useState<Set<string>>(new Set());
  const [matchSeconds, setMatchSeconds] = useState(0);

  // --- Mode 4: Sentence Builder State ---
  const sentencePuzzles = useMemo(
    () => generateSentencePuzzles(pool, vocabulary, 5, seed + 303),
    [pool, vocabulary, seed]
  );
  const [sbIndex, setSbIndex] = useState(0);
  const [sbPicked, setSbPicked] = useState<{ tokenId: string; text: string }[]>([]);
  const [sbChecked, setSbChecked] = useState<'correct' | 'wrong' | null>(null);
  const [sbCorrect, setSbCorrect] = useState<VocabWord[]>([]);
  const [sbWrong, setSbWrong] = useState<VocabWord[]>([]);

  const resetSession = (nextSeed: number = Date.now()) => {
    setSeed(nextSeed);
    setSummary(null);
    setCqIndex(0);
    setCqSelectedId(null);
    setCqCorrect([]);
    setCqWrong([]);

    setSpIndex(0);
    setSpInput('');
    setSpHintCount(1);
    setSpChecked(null);
    setSpCorrect([]);
    setSpWrong([]);

    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedWordIds([]);
    setMatchErrorPair(null);
    setMatchWrongIds(new Set());
    setMatchSeconds(0);

    setSbIndex(0);
    setSbPicked([]);
    setSbChecked(null);
    setSbCorrect([]);
    setSbWrong([]);
  };

  useEffect(() => {
    resetSession(Date.now());
  }, [mode, selectedModuleId, onlyUnmastered]);

  // Timer for Match Mode
  useEffect(() => {
    if (mode !== 'match' || summary) return;
    const id = window.setInterval(() => {
      setMatchSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [mode, summary, seed]);

  const finishSession = (
    finishedMode: PracticeMode,
    correctWords: VocabWord[],
    wrongWords: VocabWord[],
    elapsedSeconds?: number
  ) => {
    setSummary({
      mode: finishedMode,
      correctWords,
      wrongWords,
      elapsedSeconds,
    });
    onCompleteSession({
      mode: finishedMode,
      moduleId: selectedModuleId,
      correctWordIds: correctWords.map((w) => w.id),
      wrongWordIds: wrongWords.map((w) => w.id),
    });
  };

  // --- Handlers: Context Quiz ---
  const currentCq = contextQuestions[cqIndex];
  const handleSelectCqOption = (optionId: string) => {
    if (!currentCq || cqSelectedId !== null) return;
    setCqSelectedId(optionId);
    const isRight = optionId === currentCq.correctOptionId;
    if (isRight) {
      setCqCorrect((prev) => [...prev, currentCq.word]);
    } else {
      setCqWrong((prev) => [...prev, currentCq.word]);
    }
  };

  const handleNextCq = () => {
    if (!currentCq) return;
    if (cqIndex + 1 >= contextQuestions.length) {
      finishSession('context-quiz', cqCorrect, cqWrong);
    } else {
      setCqIndex((prev) => prev + 1);
      setCqSelectedId(null);
    }
  };

  // --- Handlers: Spelling ---
  const currentSp = spellingItems[spIndex];
  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSp || spChecked !== null) return;
    if (!spInput.trim()) return;
    const isRight = checkSpellingAnswer(spInput, currentSp);
    setSpChecked(isRight ? 'correct' : 'wrong');
    if (isRight) {
      setSpCorrect((prev) => [...prev, currentSp]);
    } else {
      setSpWrong((prev) => [...prev, currentSp]);
    }
  };

  const handleNextSpelling = () => {
    if (spIndex + 1 >= spellingItems.length) {
      finishSession('spelling', spCorrect, spWrong);
    } else {
      setSpIndex((prev) => prev + 1);
      setSpInput('');
      setSpHintCount(1);
      setSpChecked(null);
    }
  };

  // --- Handlers: Match ---
  const evaluateMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      const nextMatched = [...matchedWordIds, leftId];
      setMatchedWordIds(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchErrorPair(null);

      if (nextMatched.length === matchBoard.words.length) {
        const correctList = matchBoard.words.filter((w) => !matchWrongIds.has(w.id));
        const wrongList = matchBoard.words.filter((w) => matchWrongIds.has(w.id));
        finishSession('match', correctList, wrongList, matchSeconds);
      }
    } else {
      setMatchErrorPair({ left: leftId, right: rightId });
      setMatchWrongIds((prev) => new Set([...prev, leftId, rightId]));
      window.setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatchErrorPair(null);
      }, 550);
    }
  };

  const handleClickLeftTile = (wordId: string) => {
    if (matchedWordIds.includes(wordId) || matchErrorPair) return;
    if (selectedRight) {
      setSelectedLeft(wordId);
      evaluateMatch(wordId, selectedRight);
    } else {
      setSelectedLeft(wordId === selectedLeft ? null : wordId);
    }
  };

  const handleClickRightTile = (wordId: string) => {
    if (matchedWordIds.includes(wordId) || matchErrorPair) return;
    if (selectedLeft) {
      setSelectedRight(wordId);
      evaluateMatch(selectedLeft, wordId);
    } else {
      setSelectedRight(wordId === selectedRight ? null : wordId);
    }
  };

  // --- Handlers: Sentence Builder ---
  const currentSb = sentencePuzzles[sbIndex];
  const handlePickToken = (token: { tokenId: string; text: string }) => {
    if (sbChecked !== null) return;
    if (sbPicked.some((t) => t.tokenId === token.tokenId)) return;
    setSbPicked((prev) => [...prev, token]);
  };

  const handleRemovePickedToken = (tokenId: string) => {
    if (sbChecked !== null) return;
    setSbPicked((prev) => prev.filter((t) => t.tokenId !== tokenId));
  };

  const handleCheckSentence = () => {
    if (!currentSb || sbChecked !== null || sbPicked.length === 0) return;
    const built = sbPicked.map((t) => t.text).join(' ');
    const target = currentSb.tokens.join(' ');
    const isRight = built === target;
    setSbChecked(isRight ? 'correct' : 'wrong');
    if (isRight) {
      setSbCorrect((prev) => [...prev, currentSb.word]);
    } else {
      setSbWrong((prev) => [...prev, currentSb.word]);
    }
  };

  const handleNextSentence = () => {
    if (sbIndex + 1 >= sentencePuzzles.length) {
      finishSession('sentence-builder', sbCorrect, sbWrong);
    } else {
      setSbIndex((prev) => prev + 1);
      setSbPicked([]);
      setSbChecked(null);
    }
  };

  const speechAvailable = isSpeechSupported();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1 min-w-0">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Arena Latihan Kosakata
          </h1>
          <p className="text-sm text-slate-600">
            Uji pemahaman reseptif dan produktif Anda melalui empat mode latihan interaktif.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <label htmlFor="practice-module-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Materi
            </label>
            <select
              id="practice-module-select"
              value={selectedModuleId}
              onChange={(e) => onChangeModule(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 max-w-[240px]"
            >
              <option value="all">Semua Modul (Acak)</option>
              {LEARNING_MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.number}. {m.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setOnlyUnmastered((v) => !v)}
            aria-pressed={onlyUnmastered}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              onlyUnmastered
                ? 'bg-blue-50 border-blue-600 text-blue-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Prioritas Belum Dikuasai
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div
        role="tablist"
        aria-label="Pilih mode latihan"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {PRACTICE_MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m.id)}
              className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                active
                  ? 'bg-blue-50/70 border-blue-700 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className={`text-sm font-semibold ${active ? 'text-blue-800' : 'text-slate-900'}`}>
                {m.label}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{m.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* RESULTS SUMMARY SCREEN */}
      {summary ? (
        <section
          data-testid="practice-summary"
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-emerald-700">Latihan Selesai</p>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Ringkasan Hasil Latihan
              </h2>
            </div>

            <div className="flex items-baseline gap-4 font-mono tabular-nums">
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">
                  {Math.round(
                    (summary.correctWords.length /
                      Math.max(1, summary.correctWords.length + summary.wrongWords.length)) *
                      100
                  )}
                  %
                </p>
                <p className="text-xs text-slate-500">
                  {summary.correctWords.length} benar dari{' '}
                  {summary.correctWords.length + summary.wrongWords.length} soal
                  {typeof summary.elapsedSeconds === 'number'
                    ? ` · ${summary.elapsedSeconds} dtk`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {summary.wrongWords.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Kosakata yang Perlu Diulang ({summary.wrongWords.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary.wrongWords.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {w.word}{' '}
                        <span className="text-xs font-normal text-slate-500">({w.pos})</span>
                      </p>
                      <p className="text-xs text-slate-600">{w.meaningId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakEnglish(w.word, accent)}
                      aria-label={`Dengar pengucapan ${w.word}`}
                      className="p-2 text-slate-600 hover:text-blue-700 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                Luar biasa! Anda menjawab seluruh soal pada sesi ini tanpa kesalahan.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => resetSession(Date.now())}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Latihan Lagi
            </button>
            <button
              type="button"
              onClick={() => onOpenFlashcardsForModule(selectedModuleId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Tinjau di Flashcard
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* MODE 1: CONTEXT QUIZ */}
          {mode === 'context-quiz' && currentCq && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono font-medium text-slate-900 tabular-nums">
                  Soal {cqIndex + 1} / {contextQuestions.length}
                </span>
                <span className="font-mono tabular-nums">
                  Skor sementara: {cqCorrect.length} benar
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-blue-700">
                  {currentCq.promptType === 'cloze'
                    ? 'Pilih kosakata yang tepat untuk melengkapi kalimat berikut:'
                    : 'Pilih kosakata bahasa Inggris yang sesuai dengan arti berikut:'}
                </p>

                {currentCq.promptType === 'cloze' ? (
                  <div className="space-y-2">
                    <h2
                      data-testid="quiz-prompt"
                      className="font-display text-xl sm:text-2xl font-semibold text-slate-900 leading-snug"
                    >
                      “{currentCq.sentenceWithBlank}”
                    </h2>
                    <p className="text-sm text-slate-600">
                      Petunjuk arti: {currentCq.promptTranslation}
                    </p>
                  </div>
                ) : (
                  <h2
                    data-testid="quiz-prompt"
                    className="font-display text-2xl sm:text-3xl font-bold text-slate-900"
                  >
                    {currentCq.promptTranslation}{' '}
                    <span className="text-base font-normal text-slate-500">
                      ({currentCq.word.pos})
                    </span>
                  </h2>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCq.options.map((opt) => {
                  const isSelected = cqSelectedId === opt.id;
                  const isCorrect = opt.id === currentCq.correctOptionId;
                  const revealed = cqSelectedId !== null;

                  let styleClass =
                    'bg-white border-slate-200 text-slate-900 hover:border-blue-500 hover:bg-blue-50/40';
                  if (revealed) {
                    if (isCorrect) {
                      styleClass = 'bg-emerald-50 border-emerald-600 text-emerald-950';
                    } else if (isSelected) {
                      styleClass = 'bg-rose-50 border-rose-600 text-rose-950';
                    } else {
                      styleClass = 'bg-slate-50 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={revealed}
                      onClick={() => handleSelectCqOption(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-colors flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${styleClass}`}
                    >
                      <div>
                        <p className="text-base font-semibold">{opt.label}</p>
                        {revealed && (
                          <p className="text-xs text-slate-600 mt-0.5">{opt.meaningId}</p>
                        )}
                      </div>
                      {revealed && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      )}
                      {revealed && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {cqSelectedId !== null && (
                <div
                  data-testid="quiz-feedback"
                  className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    cqSelectedId === currentCq.correctOptionId
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {cqSelectedId === currentCq.correctOptionId
                        ? 'Benar! Jawaban Anda tepat.'
                        : `Kurang tepat. Jawaban yang benar adalah “${currentCq.word.word}”.`}
                    </p>
                    <p className="text-xs text-slate-700">
                      <strong>{currentCq.word.word}</strong> ({currentCq.word.pos}) ={' '}
                      {currentCq.word.meaningId}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextCq}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {cqIndex + 1 >= contextQuestions.length ? 'Lihat Hasil' : 'Soal Berikutnya'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* MODE 2: LISTENING & SPELLING */}
          {mode === 'spelling' && currentSp && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono font-medium text-slate-900 tabular-nums">
                  Kata {spIndex + 1} / {spellingItems.length}
                </span>
                <span className="font-mono tabular-nums">
                  Benar: {spCorrect.length}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Arti Bahasa Indonesia · {currentSp.pos} · {currentSp.cambridgeTopic}
                    </p>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                      {currentSp.meaningId}
                    </h2>
                  </div>

                  <button
                    type="button"
                    disabled={!speechAvailable}
                    onClick={() => speakEnglish(currentSp.word, accent)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Dengar Pengucapan
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Petunjuk Ejaan</p>
                    <p className="font-mono text-lg font-semibold tracking-wider text-slate-900">
                      {buildSpellingHint(currentSp.word, spHintCount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={spChecked !== null || spHintCount >= currentSp.word.length - 1}
                    onClick={() => setSpHintCount((c) => c + 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Buka 1 Huruf
                  </button>
                </div>

                <form onSubmit={handleCheckSpelling} className="space-y-3">
                  <label
                    htmlFor="spelling-input"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Ketik kosakata bahasa Inggris yang tepat:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="spelling-input"
                      type="text"
                      value={spInput}
                      disabled={spChecked !== null}
                      onChange={(e) => setSpInput(e.target.value)}
                      placeholder="Ketik jawaban Anda di sini..."
                      autoComplete="off"
                      className="flex-1 px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-700 disabled:bg-slate-50"
                    />
                    {spChecked === null ? (
                      <button
                        type="submit"
                        disabled={!spInput.trim()}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Periksa Ejaan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextSpelling}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {spIndex + 1 >= spellingItems.length ? 'Lihat Hasil' : 'Lanjut'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>

                {spChecked && (
                  <div
                    data-testid="spelling-feedback"
                    className={`p-4 rounded-lg border space-y-1 ${
                      spChecked === 'correct'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {spChecked === 'correct'
                        ? `Benar! Ejaan “${currentSp.word}” tepat.`
                        : `Belum tepat. Ejaan yang benar adalah “${currentSp.word}”.`}
                    </p>
                    <p className="text-xs text-slate-700">
                      Contoh SMK: “{currentSp.smkContextEn}”
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* MODE 3: MATCH PAIRS */}
          {mode === 'match' && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Klik satu kosakata Inggris di kiri lalu pasangkan dengan artinya di kanan.
                </span>
                <div className="flex items-center gap-4 font-mono tabular-nums text-slate-900">
                  <span>
                    Cocok: {matchedWordIds.length}/{matchBoard.words.length}
                  </span>
                  <span>Waktu: {matchSeconds} dtk</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English column */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-500">Kosakata Inggris</p>
                  {matchBoard.leftTiles.map((tile) => {
                    const isMatched = matchedWordIds.includes(tile.wordId);
                    const isSelected = selectedLeft === tile.wordId;
                    const isError = matchErrorPair?.left === tile.wordId;
                    return (
                      <button
                        key={tile.tileId}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleClickLeftTile(tile.wordId)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${
                          isMatched
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 opacity-70'
                            : isError
                            ? 'bg-rose-50 border-rose-500 text-rose-900'
                            : isSelected
                            ? 'bg-blue-50 border-blue-700 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-900 hover:border-blue-400'
                        }`}
                      >
                        <span className="font-semibold text-sm">{tile.text}</span>
                        <span className="text-xs text-slate-400">{tile.pos}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Indonesian column */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-500">Arti Bahasa Indonesia</p>
                  {matchBoard.rightTiles.map((tile) => {
                    const isMatched = matchedWordIds.includes(tile.wordId);
                    const isSelected = selectedRight === tile.wordId;
                    const isError = matchErrorPair?.right === tile.wordId;
                    return (
                      <button
                        key={tile.tileId}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleClickRightTile(tile.wordId)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${
                          isMatched
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 opacity-70'
                            : isError
                            ? 'bg-rose-50 border-rose-500 text-rose-900'
                            : isSelected
                            ? 'bg-blue-50 border-blue-700 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400'
                        }`}
                      >
                        <span className="text-sm">{tile.text}</span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* MODE 4: SENTENCE BUILDER */}
          {mode === 'sentence-builder' && currentSb && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono font-medium text-slate-900 tabular-nums">
                  Kalimat {sbIndex + 1} / {sentencePuzzles.length}
                </span>
                <span>
                  Kata target: <strong className="text-blue-700">{currentSb.word.word}</strong>
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500">
                  Susun kata-kata di bawah ini agar sesuai dengan arti:
                </p>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-slate-900">
                  “{currentSb.translationId}”
                </h2>
              </div>

              {/* Drop / Answer Strip */}
              <div
                aria-label="Susunan kalimat Anda"
                className="min-h-[76px] p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2"
              >
                {sbPicked.length === 0 ? (
                  <span className="text-sm text-slate-400">
                    Klik potongan kata di bawah secara berurutan...
                  </span>
                ) : (
                  sbPicked.map((token) => (
                    <button
                      key={token.tokenId}
                      type="button"
                      disabled={sbChecked !== null}
                      onClick={() => handleRemovePickedToken(token.tokenId)}
                      className="px-3 py-1.5 text-sm font-medium bg-white border border-blue-300 text-blue-900 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer disabled:cursor-default"
                    >
                      {token.text}
                    </button>
                  ))
                )}
              </div>

              {/* Word Bank */}
              <div className="flex flex-wrap items-center gap-2">
                {currentSb.shuffledTokens.map((token) => {
                  const used = sbPicked.some((t) => t.tokenId === token.tokenId);
                  return (
                    <button
                      key={token.tokenId}
                      type="button"
                      disabled={used || sbChecked !== null}
                      onClick={() => handlePickToken(token)}
                      className={`px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                        used
                          ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-default'
                          : 'bg-white border-slate-300 text-slate-800 hover:border-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {token.text}
                    </button>
                  );
                })}
              </div>

              {sbChecked && (
                <div
                  className={`p-4 rounded-lg border space-y-1 ${
                    sbChecked === 'correct'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {sbChecked === 'correct'
                      ? 'Benar! Susunan kalimat Anda sudah tepat.'
                      : 'Belum tepat. Perhatikan urutan kalimat yang benar:'}
                  </p>
                  <p className="text-sm text-slate-800 font-medium">
                    “{currentSb.tokens.join(' ')}”
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={sbChecked !== null || sbPicked.length === 0}
                  onClick={() => setSbPicked([])}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                >
                  Bersihkan Susunan
                </button>

                {sbChecked === null ? (
                  <button
                    type="button"
                    disabled={sbPicked.length !== currentSb.tokens.length}
                    onClick={handleCheckSentence}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Periksa Kalimat
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextSentence}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {sbIndex + 1 >= sentencePuzzles.length ? 'Lihat Hasil' : 'Kalimat Berikutnya'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
