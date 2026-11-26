import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Search, Volume2 } from 'lucide-react';
import {
  APPENDIX_1_WORD_SETS,
  BRITISH_AMERICAN_PAIRS,
  CAMBRIDGE_ABBREVIATIONS,
  LEARNING_MODULES,
} from '../data/modules';
import { AccentType, MasteryStatus, UserProgress, VocabWord } from '../types/vocab';
import { filterVocabulary, getWordStatus } from '../utils/learningEngine';
import { speakEnglish } from '../utils/speech';

interface DictionaryViewProps {
  vocabulary: VocabWord[];
  progress: UserProgress;
  accent: AccentType;
  onToggleMastered: (wordId: string, currentStatus: MasteryStatus) => void;
}

type DictTab = 'glossary' | 'wordsets' | 'br-am';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function DictionaryView({
  vocabulary,
  progress,
  accent,
  onToggleMastered,
}: DictionaryViewProps) {
  const [activeTab, setActiveTab] = useState<DictTab>('glossary');
  const [query, setQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState('all');
  const [only2025, setOnly2025] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = filterVocabulary(vocabulary, progress, {
      query,
      moduleId: selectedModule,
      letter: selectedLetter,
      only2025,
    });
    return [...list].sort((a, b) => a.word.localeCompare(b.word));
  }, [vocabulary, progress, query, selectedModule, selectedLetter, only2025]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Kamus Interaktif A–Z & Lampiran Resmi
          </h1>
          <p className="text-sm text-slate-600">
            Cari kosakata Inggris–Indonesia, pelajari Appendix 1 Word Sets, dan pahami perbedaan British vs American English.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Bagian kamus"
          className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start lg:self-auto"
        >
          {(
            [
              { id: 'glossary', label: 'Kamus Kosakata' },
              { id: 'wordsets', label: 'Appendix 1: Word Sets' },
              { id: 'br-am', label: 'British vs American' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SEARCHABLE A-Z GLOSSARY */}
      {activeTab === 'glossary' && (
        <div className="space-y-5">
          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <label htmlFor="dict-search" className="sr-only">
                Cari kosakata Inggris atau arti Indonesia
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="dict-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kata Inggris atau arti Indonesia (mis. mechanic, bengkel)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-700"
              />
            </div>

            <div className="md:col-span-4">
              <label htmlFor="dict-module" className="sr-only">
                Filter berdasarkan modul
              </label>
              <select
                id="dict-module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="all">Semua Modul ({vocabulary.length} kata)</option>
                {LEARNING_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.number}. {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3">
              <button
                type="button"
                onClick={() => setOnly2025((v) => !v)}
                aria-pressed={only2025}
                className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  only2025
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tambahan 2025
              </button>
              <span className="font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                {filtered.length} hasil
              </span>
            </div>
          </div>

          {/* A-Z Quick Letter Filter */}
          <div
            role="group"
            aria-label="Filter huruf awal"
            className="flex flex-wrap items-center gap-1"
          >
            <button
              type="button"
              onClick={() => setSelectedLetter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedLetter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua
            </button>
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                className={`w-7 h-7 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  selectedLetter === letter
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Results Table / List */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <p className="text-base font-semibold text-slate-900">
                Kosakata tidak ditemukan
              </p>
              <p className="text-sm text-slate-600">
                Coba kata kunci lain atau bersihkan filter huruf/modul Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedModule('all');
                  setSelectedLetter('all');
                  setOnly2025(false);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div
              data-testid="dictionary-list"
              className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden"
            >
              {filtered.map((item) => {
                const status = getWordStatus(progress, item.id);
                const isMastered = status === 'mastered';
                const expanded = expandedId === item.id;

                return (
                  <div key={item.id} className="p-4 sm:px-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                          <span className="font-display text-base font-bold text-slate-900">
                            {item.word}
                          </span>
                          <span className="text-xs text-slate-500">({item.pos})</span>
                          <span className="font-mono text-xs text-slate-400">
                            {item.phonetic}
                          </span>
                          {item.is2025Addition && (
                            <span className="text-xs font-medium text-emerald-700">
                              · Baru 2025
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700">
                          {item.meaningId}{' '}
                          <span className="text-xs text-slate-400">
                            · {item.cambridgeTopic}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakEnglish(item.word, accent)}
                          aria-label={`Dengar pengucapan ${item.word}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleMastered(item.id, status)}
                          aria-pressed={isMastered}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                            isMastered
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isMastered ? 'Dikuasai' : 'Tandai Kuasai'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                          aria-expanded={expanded}
                          aria-label={`Detail contoh untuk ${item.word}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {expanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-700">Contoh Cambridge A2 Key</p>
                          <p className="text-slate-900">“{item.exampleEn}”</p>
                          <p className="text-slate-500">{item.exampleId}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-blue-800">Konteks Dunia Kerja SMK</p>
                          <p className="text-slate-900">“{item.smkContextEn}”</p>
                          <p className="text-slate-500">{item.smkContextId}</p>
                        </div>
                        {(item.brAmNote || item.usageTip) && (
                          <div className="md:col-span-2 text-slate-600 bg-slate-50 p-3 rounded-lg">
                            {item.brAmNote && <p>{item.brAmNote}</p>}
                            {item.usageTip && <p>{item.usageTip}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPENDIX 1 WORD SETS & ABBREVIATIONS */}
      {activeTab === 'wordsets' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Cardinal Numbers (Angka Pokok 1–1.000)
              </h2>
              <p className="text-xs text-slate-500">
                Wajib dikuasai untuk menyebutkan jumlah stok, harga, ukuran bengkel, dan nomor ruangan.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-sm text-slate-800 font-mono">
                {APPENDIX_1_WORD_SETS.cardinalNumbers.map((num) => (
                  <div key={num} className="py-1.5 border-b border-slate-100">
                    {num}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Ordinal Numbers (Angka Bertingkat 1st–31st)
              </h2>
              <p className="text-xs text-slate-500">
                Digunakan untuk tanggal kalender, lantai gedung, dan urutan langkah kerja.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-sm text-slate-800 font-mono">
                {APPENDIX_1_WORD_SETS.ordinalNumbers.map((num) => (
                  <div key={num} className="py-1.5 border-b border-slate-100">
                    {num}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Hari, Bulan & Musim (Days, Months, Seasons)
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm pt-1">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500">Days of the Week</p>
                  {APPENDIX_1_WORD_SETS.daysOfWeek.map((d) => (
                    <div key={d.en} className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-medium text-slate-900">{d.en}</span>
                      <span className="text-slate-500">{d.id}</span>
                    </div>
                  ))}
                  <p className="text-xs font-semibold text-slate-500 pt-3">Seasons</p>
                  {APPENDIX_1_WORD_SETS.seasons.map((s) => (
                    <div key={s.en} className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-medium text-slate-900">{s.en}</span>
                      <span className="text-slate-500">{s.id}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500">Months of the Year</p>
                  {APPENDIX_1_WORD_SETS.monthsOfYear.map((m) => (
                    <div key={m.en} className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-medium text-slate-900">{m.en}</span>
                      <span className="text-slate-500">{m.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Negara, Kebangsaan & Benua
              </h2>
              <p className="text-xs text-slate-500">
                Sangat penting untuk jurusan Perhotelan, Pariwisata, dan layanan tamu internasional.
              </p>
              <div className="space-y-1.5 text-sm pt-1">
                {APPENDIX_1_WORD_SETS.countriesNationalities.map((c) => (
                  <div
                    key={c.country}
                    className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100"
                  >
                    <span className="font-medium text-slate-900">{c.country}</span>
                    <span className="text-blue-700 font-medium">{c.nationality}</span>
                    <span className="text-slate-500 text-right">{c.id}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 text-xs text-slate-600">
                <strong className="text-slate-900">Benua (Continents):</strong>{' '}
                {APPENDIX_1_WORD_SETS.continents.map((c) => `${c.en} (${c.id})`).join(' · ')}
              </div>
            </section>
          </div>

          {/* Cambridge Abbreviations Reference (Page 3 of PDF) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Panduan Singkatan Kelas Kata Cambridge (Halaman 3 PDF)
              </h2>
              <p className="text-xs text-slate-500">
                Pahami kode tata bahasa di samping setiap kosakata pada daftar resmi.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2 pr-4 font-semibold">Kode</th>
                    <th className="py-2 pr-4 font-semibold">Istilah Inggris</th>
                    <th className="py-2 pr-4 font-semibold">Arti Indonesia</th>
                    <th className="py-2 font-semibold">Contoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CAMBRIDGE_ABBREVIATIONS.map((abbr) => (
                    <tr key={abbr.code}>
                      <td className="py-2 pr-4 font-mono font-semibold text-blue-700">
                        {abbr.code}
                      </td>
                      <td className="py-2 pr-4 text-slate-900">{abbr.english}</td>
                      <td className="py-2 pr-4 text-slate-600">{abbr.indonesian}</td>
                      <td className="py-2 text-slate-500">{abbr.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: BRITISH VS AMERICAN ENGLISH */}
      {activeTab === 'br-am' && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Perbandingan Kosakata British English & American English
            </h2>
            <p className="text-sm text-slate-600">
              Ujian Cambridge A2 Key menerima kedua ragam ejaan. Kenali padanannya agar Anda mudah memahami manual mesin (sering US) maupun buku teks (sering UK).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2.5 pr-4 font-semibold">British English (UK)</th>
                  <th className="py-2.5 pr-4 font-semibold">American English (US)</th>
                  <th className="py-2.5 pr-4 font-semibold">Arti Indonesia</th>
                  <th className="py-2.5 font-semibold">Contoh Penggunaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BRITISH_AMERICAN_PAIRS.map((pair) => (
                  <tr key={pair.british} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      <button
                        type="button"
                        onClick={() => speakEnglish(pair.british, 'en-GB')}
                        className="inline-flex items-center gap-1.5 hover:text-blue-700 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        {pair.british}
                      </button>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-blue-800">
                      <button
                        type="button"
                        onClick={() => speakEnglish(pair.american, 'en-US')}
                        className="inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        {pair.american}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{pair.meaningId}</td>
                    <td className="py-3 text-xs text-slate-600">{pair.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
