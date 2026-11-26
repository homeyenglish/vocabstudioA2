import test from 'node:test';
import assert from 'node:assert/strict';
import { VOCABULARY } from '../data/vocabulary';
import { LEARNING_MODULES } from '../data/modules';
import {
  buildSpellingHint,
  checkSpellingAnswer,
  computeModuleStats,
  computeOverallStats,
  createInitialProgress,
  filterModulesByMajor,
  filterVocabulary,
  generateContextQuestions,
  generateMatchBoard,
  generateSentencePuzzles,
  recordPracticeOutcome,
  updateWordMastery,
} from './learningEngine';

test('dataset integrity: all words have unique IDs, valid module references, and Indonesian meanings', () => {
  const moduleIds = new Set(LEARNING_MODULES.map((m) => m.id));
  const seenIds = new Set<string>();

  assert.ok(VOCABULARY.length >= 200, `Expected at least 200 words, got ${VOCABULARY.length}`);

  for (const item of VOCABULARY) {
    assert.ok(!seenIds.has(item.id), `Duplicate word id: ${item.id}`);
    seenIds.add(item.id);
    assert.ok(moduleIds.has(item.moduleId), `Unknown moduleId ${item.moduleId} on ${item.word}`);
    assert.ok(item.word.trim().length > 0, 'Word must be non-empty');
    assert.ok(item.meaningId.trim().length > 0, `Missing Indonesian meaning for ${item.word}`);
    assert.ok(item.smkContextEn.trim().length > 0, `Missing SMK context for ${item.word}`);
  }

  // Every module should contain at least 15 words
  for (const mod of LEARNING_MODULES) {
    const count = VOCABULARY.filter((w) => w.moduleId === mod.id).length;
    assert.ok(count >= 15, `Module ${mod.id} should have >= 15 words, got ${count}`);
  }

  // Verify official August 2025 green additions are represented
  const additions2025 = VOCABULARY.filter((w) => w.is2025Addition);
  assert.ok(
    additions2025.length >= 30,
    `Expected >= 30 August 2025 additions, got ${additions2025.length}`
  );
});

test('mastery updates and daily counter reset accurately across days', () => {
  let progress = createInitialProgress('2026-11-26');
  const firstWord = VOCABULARY[0];

  progress = updateWordMastery(progress, firstWord.id, 'learning', '2026-11-26');
  assert.equal(progress.words[firstWord.id].status, 'learning');
  assert.equal(progress.dailyCount, 1);

  progress = updateWordMastery(progress, firstWord.id, 'mastered', '2026-11-26');
  assert.equal(progress.words[firstWord.id].status, 'mastered');
  assert.equal(progress.dailyCount, 2);

  // Next calendar day resets daily count to 1 while retaining mastery
  progress = updateWordMastery(progress, VOCABULARY[1].id, 'mastered', '2026-11-27');
  assert.equal(progress.dailyDate, '2026-11-27');
  assert.equal(progress.dailyCount, 1);

  const overall = computeOverallStats(VOCABULARY, progress);
  assert.equal(overall.masteredCount, 2);
  assert.equal(overall.newCount, VOCABULARY.length - 2);
});

test('recordPracticeOutcome updates accuracy, history, and word status', () => {
  let progress = createInitialProgress('2026-11-26');
  const w1 = VOCABULARY[0];
  const w2 = VOCABULARY[1];

  progress = recordPracticeOutcome(
    progress,
    {
      mode: 'context-quiz',
      moduleId: w1.moduleId,
      correctWordIds: [w1.id],
      wrongWordIds: [w2.id],
    },
    '2026-11-26'
  );

  assert.equal(progress.totalCorrect, 1);
  assert.equal(progress.totalAttempted, 2);
  assert.equal(progress.words[w1.id].status, 'review');
  assert.equal(progress.words[w2.id].status, 'learning');
  assert.equal(progress.history.length, 1);

  // Second correct answer promotes w1 to mastered
  progress = recordPracticeOutcome(
    progress,
    {
      mode: 'spelling',
      moduleId: w1.moduleId,
      correctWordIds: [w1.id],
      wrongWordIds: [],
    },
    '2026-11-26'
  );
  assert.equal(progress.words[w1.id].status, 'mastered');
  assert.equal(computeOverallStats(VOCABULARY, progress).accuracyPercent, 67);
});

test('spelling check accepts British and American variants case-insensitively', () => {
  const tyre = VOCABULARY.find((w) => w.id === 'w-tyre');
  const shoppingCentre = VOCABULARY.find((w) => w.id === 'w-shopping-centre');
  assert.ok(tyre);
  assert.ok(shoppingCentre);

  assert.equal(checkSpellingAnswer('tyre', tyre), true);
  assert.equal(checkSpellingAnswer('  TIRE ', tyre), true);
  assert.equal(checkSpellingAnswer('wheel', tyre), false);

  assert.equal(checkSpellingAnswer('shopping centre', shoppingCentre), true);
  assert.equal(checkSpellingAnswer('Shopping Center', shoppingCentre), true);
});

test('filtering works for SMK major, query, 2025 additions, and Br/Am notes', () => {
  const progress = createInitialProgress('2026-11-26');
  const tkjModules = filterModulesByMajor(LEARNING_MODULES, 'tkj-rpl');
  assert.ok(tkjModules.some((m) => m.id === 'tech-communication'));
  assert.ok(tkjModules.length < LEARNING_MODULES.length);

  const mechanicHits = filterVocabulary(VOCABULARY, progress, { query: 'montir' });
  assert.ok(mechanicHits.some((w) => w.word === 'mechanic'));

  const only2025 = filterVocabulary(VOCABULARY, progress, { only2025: true });
  assert.ok(only2025.every((w) => w.is2025Addition === true));
  assert.ok(only2025.some((w) => w.word === 'accommodation'));

  const onlyBrAm = filterVocabulary(VOCABULARY, progress, { onlyBrAm: true });
  assert.ok(onlyBrAm.length >= 8);
  assert.ok(onlyBrAm.every((w) => Boolean(w.brAmNote)));
});

test('practice generators produce valid, unique options and non-trivial shuffles', () => {
  const workPool = VOCABULARY.filter((w) => w.moduleId === 'work-jobs');

  const questions = generateContextQuestions(workPool, VOCABULARY, 8, 42);
  assert.equal(questions.length, 8);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    const ids = new Set(q.options.map((o) => o.id));
    assert.equal(ids.size, 4, 'Options must have 4 unique choices');
    assert.ok(ids.has(q.correctOptionId), 'Correct option must be included');
  }

  const board = generateMatchBoard(workPool, VOCABULARY, 6, 99);
  assert.equal(board.leftTiles.length, 6);
  assert.equal(board.rightTiles.length, 6);
  assert.deepEqual(
    new Set(board.leftTiles.map((t) => t.wordId)),
    new Set(board.rightTiles.map((t) => t.wordId))
  );

  const puzzles = generateSentencePuzzles(workPool, VOCABULARY, 5, 77);
  assert.equal(puzzles.length, 5);
  for (const p of puzzles) {
    assert.equal(p.shuffledTokens.length, p.tokens.length);
    assert.ok(
      !p.shuffledTokens.every((t, i) => t.text === p.tokens[i]),
      'Shuffled tokens should not already be in exact answer order'
    );
  }

  const modStats = computeModuleStats('work-jobs', VOCABULARY, createInitialProgress('2026-11-26'));
  assert.equal(modStats.total, workPool.length);
  assert.equal(modStats.mastered, 0);

  const hint = buildSpellingHint('mechanic', 2);
  assert.ok(hint.startsWith('m e _'));
});
