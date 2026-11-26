import { ArrowRight, BookOpen, CheckCircle2, Layers } from 'lucide-react';
import { LEARNING_MODULES, SMK_MAJOR_OPTIONS } from '../data/modules';
import { SmkMajor, UserProgress, VocabWord } from '../types/vocab';
import {
  computeModuleStats,
  computeOverallStats,
  filterModulesByMajor,
} from '../utils/learningEngine';

interface ModulesViewProps {
  vocabulary: VocabWord[];
  progress: UserProgress;
  selectedMajor: SmkMajor;
  onSelectMajor: (major: SmkMajor) => void;
  onOpenFlashcards: (moduleId: string, only2025?: boolean) => void;
  onOpenPractice: (moduleId: string) => void;
}

export function ModulesView({
  vocabulary,
  progress,
  selectedMajor,
  onSelectMajor,
  onOpenFlashcards,
  onOpenPractice,
}: ModulesViewProps) {
  const overall = computeOverallStats(vocabulary, progress);
  const visibleModules = filterModulesByMajor(LEARNING_MODULES, selectedMajor);
  const dailyPercent = Math.min(
    100,
    Math.round((progress.dailyCount / Math.max(1, progress.dailyTarget)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Compact Editorial Hero */}
      <section className="space-y-5">
        <div className="max-w-3xl space-y-2">
          <p className="text-sm font-medium text-blue-700">
            Bahan Ajar Bahasa Inggris SMK · Cambridge English A2 Key (Edisi Agustus 2025)
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance leading-tight">
            Kuasai Kosakata A2 Key untuk Praktik Bengkel, PKL, dan Ujian SMK
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Pelajari seluruh topik resmi daftar kosakata Cambridge A2 Key lengkap dengan arti bahasa Indonesia, audio UK/US, contoh dunia kerja, dan empat mode latihan interaktif.
          </p>
        </div>

        {/* Full-Width 4-Column Mastery KPI Strip */}
        <div
          data-testid="mastery-kpi-strip"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-slate-500">Kosakata Dikuasai</p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                {overall.masteredCount}
                <span className="text-sm font-normal text-slate-400">
                  {' '}
                  / {overall.totalWords}
                </span>
              </p>
              <span className="font-mono text-xs font-medium text-emerald-700 tabular-nums">
                {overall.masteryPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${overall.masteryPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-slate-500">Aktivitas Belajar Hari Ini</p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                {progress.dailyCount}
                <span className="text-sm font-normal text-slate-400">
                  {' '}
                  / {progress.dailyTarget} target
                </span>
              </p>
              <span className="font-mono text-xs font-medium text-blue-700 tabular-nums">
                {dailyPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 transition-all duration-300"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-slate-500">Akurasi Latihan</p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                {progress.totalAttempted > 0 ? `${overall.accuracyPercent}%` : '—'}
              </p>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {progress.totalCorrect}/{progress.totalAttempted} soal
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {progress.totalAttempted > 0
                ? 'Terhitung dari seluruh sesi latihan'
                : 'Belum ada sesi latihan terselesaikan'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-slate-500">Kosakata Baru Edisi 2025</p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                {overall.mastered2025Words}
                <span className="text-sm font-normal text-slate-400">
                  {' '}
                  / {overall.total2025Words} kata
                </span>
              </p>
              <button
                type="button"
                onClick={() => onOpenFlashcards('all', true)}
                className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Pelajari →
              </button>
            </div>
            <p className="text-xs text-slate-500 truncate">
              Tambahan hijau pada PDF Agustus 2025
            </p>
          </div>
        </div>
      </section>

      {/* Filter Jurusan SMK & Module Grid */}
      <section className="space-y-5">
        <div className="space-y-3 border-b border-slate-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Peta Modul Kosakata SMK
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Menampilkan{' '}
              <span className="font-mono font-medium text-slate-800 tabular-nums">
                {visibleModules.length}
              </span>{' '}
              dari 12 modul terstruktur
            </p>
          </div>

          <div className="overflow-x-auto pb-1">
            <div
              role="group"
              aria-label="Filter jurusan SMK"
              className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg min-w-max"
            >
              {SMK_MAJOR_OPTIONS.map((opt) => {
                const active = selectedMajor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectMajor(opt.id)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          data-testid="modules-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {visibleModules.map((mod) => {
            const stats = computeModuleStats(mod.id, vocabulary, progress);
            const isCompleted = stats.total > 0 && stats.mastered === stats.total;

            return (
              <article
                key={mod.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  {/* Quiet 1-line unboxed metadata */}
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="truncate">{mod.smkRelevanceLabel}</span>
                    <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
                      {stats.total} kata
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                      {mod.number}. {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Topik Cambridge: {mod.cambridgeTopics.join(' · ')}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-100">
                  {/* Mastery Progress Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Selesai Dikuasai</span>
                          </>
                        ) : (
                          <span>
                            Dikuasai:{' '}
                            <strong className="font-mono tabular-nums">
                              {stats.mastered}/{stats.total}
                            </strong>
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {stats.percent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-600' : 'bg-blue-700'
                        }`}
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Clear Primary & Secondary Actions */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenFlashcards(mod.id, false)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Flashcard
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPractice(mod.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Latihan
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
