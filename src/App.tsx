import { useEffect, useState } from 'react';
import { VOCABULARY } from './data/vocabulary';
import {
  AccentType,
  ActiveView,
  MasteryStatus,
  SmkMajor,
  UserProgress,
} from './types/vocab';
import {
  createInitialProgress,
  loadProgress,
  PracticeOutcomeInput,
  recordPracticeOutcome,
  saveProgress,
  updateWordMastery,
} from './utils/learningEngine';
import { Header } from './components/Header';
import { ModulesView } from './components/ModulesView';
import { FlashcardView } from './components/FlashcardView';
import { PracticeView } from './components/PracticeView';
import { DictionaryView } from './components/DictionaryView';
import { ReferenceView } from './components/ReferenceView';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('modules');
  const [selectedMajor, setSelectedMajor] = useState<SmkMajor>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('work-jobs');
  const [only2025Flashcards, setOnly2025Flashcards] = useState<boolean>(false);
  const [accent, setAccent] = useState<AccentType>('en-GB');
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleOpenFlashcards = (moduleId: string, only2025: boolean = false) => {
    setSelectedModuleId(moduleId);
    setOnly2025Flashcards(only2025);
    setActiveView('flashcards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPractice = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setActiveView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuickPractice = () => {
    setActiveView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRateWord = (wordId: string, status: MasteryStatus) => {
    setProgress((prev) => updateWordMastery(prev, wordId, status));
  };

  const handleToggleMastered = (wordId: string, currentStatus: MasteryStatus) => {
    const nextStatus: MasteryStatus = currentStatus === 'mastered' ? 'learning' : 'mastered';
    setProgress((prev) => updateWordMastery(prev, wordId, nextStatus));
  };

  const handleCompletePractice = (outcome: PracticeOutcomeInput) => {
    setProgress((prev) => recordPracticeOutcome(prev, outcome));
  };

  const handleResetProgress = () => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    saveProgress(fresh);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartQuickPractice={handleStartQuickPractice}
      />

      <main className="flex-1">
        {activeView === 'modules' && (
          <ModulesView
            vocabulary={VOCABULARY}
            progress={progress}
            selectedMajor={selectedMajor}
            onSelectMajor={setSelectedMajor}
            onOpenFlashcards={handleOpenFlashcards}
            onOpenPractice={handleOpenPractice}
          />
        )}

        {activeView === 'flashcards' && (
          <FlashcardView
            vocabulary={VOCABULARY}
            progress={progress}
            selectedModuleId={selectedModuleId}
            only2025={only2025Flashcards}
            accent={accent}
            onChangeModule={setSelectedModuleId}
            onChangeOnly2025={setOnly2025Flashcards}
            onChangeAccent={setAccent}
            onRateWord={handleRateWord}
            onStartPracticeForModule={handleOpenPractice}
          />
        )}

        {activeView === 'practice' && (
          <PracticeView
            vocabulary={VOCABULARY}
            progress={progress}
            selectedModuleId={selectedModuleId}
            accent={accent}
            onChangeModule={setSelectedModuleId}
            onCompleteSession={handleCompletePractice}
            onOpenFlashcardsForModule={(modId) => handleOpenFlashcards(modId, false)}
          />
        )}

        {activeView === 'dictionary' && (
          <DictionaryView
            vocabulary={VOCABULARY}
            progress={progress}
            accent={accent}
            onToggleMastered={handleToggleMastered}
          />
        )}

        {activeView === 'reference' && (
          <ReferenceView progress={progress} onResetProgress={handleResetProgress} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            VokaKey SMK · Sumber kosakata: Cambridge English A2 Key &amp; A2 Key for Schools Vocabulary List (Agustus 2025)
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveView('dictionary')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Kamus A–Z
            </button>
            <button
              type="button"
              onClick={() => setActiveView('reference')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Dokumen PDF Resmi
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
