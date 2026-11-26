import { useState } from 'react';
import { Download, FileText, RotateCcw } from 'lucide-react';
import { UserProgress } from '../types/vocab';

interface ReferenceViewProps {
  progress: UserProgress;
  onResetProgress: () => void;
}

const PDF_URL = '/assets/aistudio/a2-key-2020-vocabulary-list_2abe174d.pdf';

export function ReferenceView({ progress, onResetProgress }: ReferenceViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Dokumen Resmi & Panduan Guru/Siswa SMK
          </h1>
          <p className="text-sm text-slate-600">
            Akses langsung PDF resmi Cambridge English A2 Key / A2 Key for Schools Vocabulary List (August 2025).
          </p>
        </div>

        <a
          href={PDF_URL}
          download="Cambridge-A2-Key-Vocabulary-List-2025.pdf"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          Unduh PDF Resmi (32 Halaman)
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Study Guide & SMK Learning Strategy */}
        <div className="lg:col-span-5 space-y-5">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Strategi Menguasai A2 Key di Kelas SMK
            </h2>
            <ol className="space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>
                <strong className="text-slate-900">Bedakan Reseptif & Produktif:</strong>{' '}
                Siswa perlu memahami arti saat membaca manual (reseptif) sekaligus mampu mengeja dengan benar pada formulir dan email kerja (produktif).
              </li>
              <li>
                <strong className="text-slate-900">Pelajari Konteks Jurusan Terlebih Dahulu:</strong>{' '}
                Gunakan filter jurusan di halaman Modul agar siswa langsung menguasai istilah yang dipakai saat praktik bengkel atau PKL.
              </li>
              <li>
                <strong className="text-slate-900">Biasakan Phrasal Verbs & Ejaan UK/US:</strong>{' '}
                Kata kerja frasa seperti <em>fill in</em>, <em>break down</em>, dan <em>turn off</em> sangat sering keluar di soal A2 Key maupun instruksi K3.
              </li>
              <li>
                <strong className="text-slate-900">Target Harian 15 Kata:</strong>{' '}
                Pelajari 10–15 kartu Flashcard per hari, lalu tutup sesi dengan 1 ronde Kuis Konteks atau Dengar & Eja.
              </li>
            </ol>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Pengelolaan Progres Belajar
              </h2>
              <p className="text-xs text-slate-600">
                Progres belajar Anda tersimpan otomatis di peramban perangkat ini ({Object.keys(progress.words).length} kata tercatat, {progress.history.length} sesi latihan).
              </p>
            </div>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Semua Progres Belajar
              </button>
            ) : (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 space-y-3">
                <p className="text-xs font-medium text-rose-900">
                  Yakin ingin menghapus seluruh catatan penguasaan kata dan riwayat latihan? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded-lg cursor-pointer"
                  >
                    Ya, Hapus Progres
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Embedded PDF Viewer with resilient fallback */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800 min-w-0">
              <FileText className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="truncate">
                Cambridge English — A2 Key Vocabulary List (August 2025)
              </span>
            </div>
            <span className="font-mono text-xs text-slate-500 whitespace-nowrap shrink-0">
              PDF · 32 hlm
            </span>
          </div>
          <div className="h-[640px] w-full bg-slate-100">
            <object
              data={PDF_URL}
              type="application/pdf"
              aria-label="Cambridge English A2 Key Vocabulary List August 2025"
              className="w-full h-full"
            >
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
                <FileText className="w-10 h-10 text-blue-700" />
                <div className="space-y-1 max-w-md">
                  <p className="font-display text-base font-semibold text-slate-900">
                    Pratinjau PDF Tidak Didukung di Peramban Ini
                  </p>
                  <p className="text-sm text-slate-600">
                    Unduh atau buka langsung dokumen resmi Cambridge English A2 Key Vocabulary List (August 2025, 32 halaman) melalui tombol di bawah ini.
                  </p>
                </div>
                <a
                  href={PDF_URL}
                  download="Cambridge-A2-Key-Vocabulary-List-2025.pdf"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Unduh PDF Resmi
                </a>
              </div>
            </object>
          </div>
        </section>
      </div>
    </div>
  );
}
