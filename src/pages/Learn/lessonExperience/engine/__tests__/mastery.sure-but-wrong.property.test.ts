/**
 * Property-based tests for "sure but wrong" detection in the mastery engine.
 *
 * Property 12: "Sure but wrong" detection — for any Post_Flight answer that is
 * incorrect with confidence='high', the resulting MasteryRecord.sureButWrong
 * SHALL be true; for every other answer it SHALL be false. At the concept level
 * this aggregates disjunctively: a concept is sureButWrong when ANY of its
 * answers is incorrect with confidence='high'.
 *
 * Validates: Requirements 10.5
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { evaluate } from '../mastery';
import type { PostAnswer } from '../mastery';
import type { ConfidenceRating } from '../types';

// Generator for a confidence rating.
const confidenceArb: fc.Arbitrary<ConfidenceRating> = fc.constantFrom(
  'low',
  'medium',
  'high',
);

// Generator for a single PostAnswer.
const postAnswerArb: fc.Arbitrary<PostAnswer> = fc.record({
  correct: fc.boolean(),
  confidence: confidenceArb,
});

// Generator for a map of conceptId -> PostAnswer[]. Concept ids are constrained
// to a small alphabet so distinct concepts (and collisions) are well exercised.
const answersByConceptArb: fc.Arbitrary<Record<string, PostAnswer[]>> =
  fc.dictionary(
    fc.string({ minLength: 1, maxLength: 4 }),
    fc.array(postAnswerArb, { minLength: 1, maxLength: 8 }),
    { minKeys: 0, maxKeys: 6 },
  );

describe('mastery evaluate — "sure but wrong" detection', () => {
  // Feature: interactive-lesson-experience, Property 12: "Sure but wrong" detection
  it('flags sureButWrong disjunctively across each concept (single- and multi-answer)', () => {
    fc.assert(
      fc.property(answersByConceptArb, (answersByConcept) => {
        const { records } = evaluate(answersByConcept);

        for (const conceptId of Object.keys(answersByConcept)) {
          const answers = answersByConcept[conceptId];
          const record = records[conceptId];

          expect(record).toBeDefined();

          // Disjunctive rule: true iff ANY answer is incorrect with high confidence.
          const expected = answers.some(
            (a) => a.correct === false && a.confidence === 'high',
          );
          expect(record.sureButWrong).toBe(expected);

          // Single-answer case aligns exactly with per-answer Property 12.
          if (answers.length === 1) {
            const a = answers[0];
            expect(record.sureButWrong).toBe(
              a.correct === false && a.confidence === 'high',
            );
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
