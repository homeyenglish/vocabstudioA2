import { VocabWord } from '../types/vocab';
import { VOCAB_PART_1 } from './vocabPart1';
import { VOCAB_PART_2 } from './vocabPart2';
import { VOCAB_PART_3 } from './vocabPart3';

export const VOCABULARY: VocabWord[] = [
  ...VOCAB_PART_1,
  ...VOCAB_PART_2,
  ...VOCAB_PART_3,
];

export const VOCABULARY_BY_ID: Record<string, VocabWord> = Object.fromEntries(
  VOCABULARY.map((item) => [item.id, item])
);
