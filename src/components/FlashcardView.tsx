import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { LEARNING_MODULES } from '../data/modules';
import { AccentType, MasteryStatus, UserProgress, VocabWord } from '../types/vocab';
import { filterVocabulary, getWordStatus } from '../utils/learningEngine';
import { isSpeechSupported, speakEnglish } from '../utils/speech';

interface FlashcardViewProps {
  vocabulary: VocabWord[];
  progress: UserProgress;
  selectedModuleId: string;
  only2025: boolean;
  accent: AccentType;
  onChangeModule: (moduleId: string) => void;
  onChangeOnly2025: (val: boolean) => void;
  onChangeAccent: (accent: AccentType) => void;
  onRateWord: (wordId: string, status: MasteryStatus) => void;
  onStartPracticeForModule: (moduleId: string) => void;
}

const STATUS_LABELS: Record<MasteryStatus, { text: string; tone: string }> = {
  new: { text: 'Belum Dipelajari', tone: 'text-slate-500' },
  learning: { text: 'Perlu Diulang', tone: 'text-rose-700' },
  review: { text: 'Masih Ragu', tone: 'text-amber-700' },
  mastered: { text: 'Dikuasai', tone: 'text-emerald-700' },
};

export function FlashcardView({
  vocabulary,
  progress,
  selectedModuleId,
  only2025,
  accent,
  onChangeModule,
  onChangeOnly2025,
  onChangeAccent,
  onRateWord,
  onStartPracticeForModule,
}: FlashcardViewProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmastered' | 'learning'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const deck = useMemo(() => {
    return filterVocabulary(vocabulary, progress, {
      moduleId: selectedModuleId,
      only2025,
      status: statusFilter,
    });
  }, [vocabulary, progress, selectedModuleId, only2025, statusFilter]);

  // Keep index valid whenever filters change
  useEffect(() => {
    setCurrentIndex((prev) => (deck.length === 0 ? 0 : Math.min(prev, deck.length - 1)));
    setIsFlipped(false);
  }, [selectedModuleId, only2025, statusFilter, deck.length]);

  const currentWord = deck[currentIndex] ?? null;
  const speechAvailable = isSpeechSupported();

  const handlePlayAudio = (text: string) => {
    setIsSpeaking(true);
    speakEnglish(text, accent, () => setIsSpeaking(false));
  };

  const handleNext = () => {
    if (deck.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    if (deck.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleRate = (status: MasteryStatus) => {
    if (!currentWord) return;
    onRateWord(currentWord.id, status);
    setIsFlipped(false);
    if (deck.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }
  };

  // Keyboard shortcuts: Space to flip, ArrowLeft/Right to navigate, 1/2/3 to rate, A to speak
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (!currentWord) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlePlayAudio(currentWord.word);
      } else if (e.key === '1') {
        handleRate('learning');
      } else if (e.key === '2') {
        handleRate('review');
      } else if (e.key === '3') {
        handleRate('mastered');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const deckMasteredCount = useMemo(() => {
    return deck.filter((w) => getWordStatus(progress, w.id) === 'mastered').length;
  }, [deck, progress]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header & Single-Row Toolbar */}
      <div className="space-y-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Kartu Belajar Interaktif (Flashcard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Balik kartu untuk melihat arti, contoh Cambridge A2, dan konteks dunia kerja SMK.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="fc-module-select" className="text-xs font-medium text-slate-600">
                Modul
              </label>
              <select
                id="fc-module-select"
                value={selectedModuleId}
                onChange={(e) => {
                  onChangeModule(e.target.value);
                  setCurrentIndex(0);
                }}
                className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-700"
              >
                <option value="all">Semua Modul ({vocabulary.length} kata)</option>
                {LEARNING_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.number}. {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div
              role="group"
              aria-label="Filter status penguasaan"
              className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg"
            >
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'unmastered', label: 'Belum Dikuasai' },
                  { id: 'learning', label: 'Perlu Diulang' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.id);
                    setCurrentIndex(0);
                  }}
                  aria-pressed={statusFilter === opt.id}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === opt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onChangeOnly2025(!only2025);
                setCurrentIndex(0);
              }}
              aria-pressed={only2025}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                only2025
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Hanya Tambahan 2025
            </button>

            {/* UK / US Accent Toggle */}
            <div
              role="group"
              aria-label="Pilih aksen audio"
              className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg"
            >
              <button
                type="button"
                onClick={() => onChangeAccent('en-GB')}
                aria-pressed={accent === 'en-GB'}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  accent === 'en-GB'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                UK Audio
              </button>
              <button
                type="button"
                onClick={() => onChangeAccent('en-US')}
                aria-pressed={accent === 'en-US'}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  accent === 'en-US'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                US Audio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Zone Educational Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone (Primary Interactive Stage: 8 cols / ~66%) */}
        <div className="lg:col-span-8 space-y-5">
          {!currentWord ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Tidak ada kata pada filter ini
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Semua kata pada filter yang dipilih sudah Anda kuasai, atau coba reset filter untuk meninjau ulang seluruh dek.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  onChangeOnly2025(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Tampilkan Semua Kata
              </button>
            </div>
          ) : (
            <>
              {/* Card Metadata Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    Kartu {currentIndex + 1} / {deck.length}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{currentWord.cambridgeTopic}</span>
                  {currentWord.is2025Addition && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-emerald-700">
                        Tambahan Baru 2025
                      </span>
                    </>
                  )}
                </div>

                <span
                  className={`font-medium ${
                    STATUS_LABELS[getWordStatus(progress, currentWord.id)].tone
                  }`}
                >
                  Status: {STATUS_LABELS[getWordStatus(progress, currentWord.id)].text}
                </span>
              </div>

              {/* Interactive Card Surface */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 min-h-[360px] flex flex-col justify-between gap-8">
                {!isFlipped ? (
                  /* FRONT FACE */
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-6">
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                      <span>{currentWord.pos}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{currentWord.phonetic}</span>
                    </div>

                    <h2
                      data-testid="flashcard-word"
                      className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900"
                    >
                      {currentWord.word}
                    </h2>

                    {currentWord.brAmNote && (
                      <p className="text-xs text-slate-500">{currentWord.brAmNote}</p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(currentWord.word)}
                        disabled={!speechAvailable}
                        aria-label={`Putar pengucapan untuk ${currentWord.word}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-blue-700' : ''}`} />
                        {isSpeaking ? 'Memutar...' : 'Dengarkan Audio'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsFlipped(true)}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Balik Kartu (Lihat Arti)
                      </button>
                    </div>
                  </div>
                ) : (
                  /* BACK FACE */
                  <div data-testid="flashcard-back" className="space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-900">{currentWord.word}</span>
                          <span aria-hidden="true">·</span>
                          <span>{currentWord.pos}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{currentWord.phonetic}</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-blue-800">
                          {currentWord.meaningId}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(currentWord.word)}
                          aria-label={`Putar pengucapan untuk ${currentWord.word}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Audio Kata
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFlipped(false)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Lihat Depan
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Official Cambridge Context */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-700">
                            Contoh Cambridge A2 Key
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(currentWord.exampleEn)}
                            aria-label="Putar kalimat contoh Cambridge"
                            className="text-xs text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            Dengar
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-relaxed">
                          “{currentWord.exampleEn}”
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {currentWord.exampleId}
                        </p>
                      </div>

                      {/* SMK Vocational Context */}
                      <div className="bg-blue-50/50 border border-blue-200/80 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-blue-900">
                            Konteks Dunia Kerja SMK
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(currentWord.smkContextEn)}
                            aria-label="Putar kalimat konteks SMK"
                            className="text-xs text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            Dengar
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-relaxed">
                          “{currentWord.smkContextEn}”
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {currentWord.smkContextId}
                        </p>
                      </div>
                    </div>

                    {(currentWord.usageTip || currentWord.brAmNote) && (
                      <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 space-y-1">
                        {currentWord.brAmNote && (
                          <p>
                            <strong className="text-slate-800">Variasi Ejaan:</strong>{' '}
                            {currentWord.brAmNote}
                          </p>
                        )}
                        {currentWord.usageTip && (
                          <p>
                            <strong className="text-slate-800">Catatan Penting:</strong>{' '}
                            {currentWord.usageTip}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Assessment & Navigation Controls */}
                <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={deck.length <= 1}
                      aria-label="Kartu sebelumnya"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={deck.length <= 1}
                      aria-label="Kartu berikutnya"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                    >
                      Berikutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3-Tier Mastery Rating */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRate('learning')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Belum Hafal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate('review')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Masih Ragu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate('mastered')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah Kuasai
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Pintasan papan ketik: <span className="font-mono">Spasi</span> balik kartu ·{' '}
                <span className="font-mono">← / →</span> pindah kartu ·{' '}
                <span className="font-mono">A</span> dengar audio ·{' '}
                <span className="font-mono">1 / 2 / 3</span> nilai penguasaan.
              </p>
            </>
          )}
        </div>

        {/* Right Zone (Deck Progress & Word Queue Sidebar: 4 cols / ~33%) */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Daftar Kata Dek Ini
              </h2>
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                {deckMasteredCount} dari {deck.length} dikuasai
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartPracticeForModule(selectedModuleId)}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Uji Modul Ini
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 pr-1">
            {deck.map((item, idx) => {
              const status = getWordStatus(progress, item.id);
              const active = idx === currentIndex;
              const hideMeaning = active && !isFlipped;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                  className={`w-full text-left py-2.5 px-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    active ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.word}{' '}
                      <span className="text-xs font-normal text-slate-400">({item.pos})</span>
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {hideMeaning ? 'Balik kartu untuk melihat arti' : item.meaningId}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap shrink-0 ${STATUS_LABELS[status].tone}`}
                  >
                    {status === 'mastered'
                      ? 'Dikuasai'
                      : status === 'review'
                      ? 'Ragu'
                      : status === 'learning'
                      ? 'Ulang'
                      : 'Baru'}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
