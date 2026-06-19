/**
 * Property-based tests for mastery-gate remediation routing.
 *
 * Property 11: Mastery gate routes weak concepts back before completion — for
 * any set of Post_Flight answers, every conceptId whose score is below
 * MASTERY_GATE SHALL appear in the remediation route, and COMPLETE SHALL be
 * rejected (no transition to completed=true) while the remediation queue is
 * non-empty.
 *
 * Part A exercises the mastery engine (`evaluate`/`conceptScore`); Part B
 * exercises the `lessonReducer` COMPLETE gating against a constructed
 * `LessonState`.
 *
 * Validates: Requirements 10.3, 10.4, 13.6
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { evaluate, conceptScore, MASTERY_GATE } from '../mastery';
import type { PostAnswer } from '../mastery';
import { buildLessonPlan } from '../buildLessonPlan';
import type { ConfidenceRating, Lesson } from '../types';
import { lessonReducer, initLessonState } from '../../state/lessonMachine';

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

// Generator for a map of conceptId -> PostAnswer[]. Concept ids use a small
// alphabet so distinct concepts (and key collisions) are well exercised; each
// concept has at least one answer so scores are meaningful.
const answersByConceptArb: fc.Arbitrary<Record<string, PostAnswer[]>> =
  fc.dictionary(
    fc.string({ minLength: 1, maxLength: 4 }),
    fc.array(postAnswerArb, { minLength: 1, maxLength: 8 }),
    { minKeys: 0, maxKeys: 6 },
  );

// A minimal valid lesson so buildLessonPlan yields a real five-phase plan to
// pass to the reducer. The plan's content is irrelevant to COMPLETE gating.
const minimalLesson: Lesson = {
  id: 'lesson-remediation',
  title: 'Remediation gating',
  language: 'python',
  sections: [],
} as unknown as Lesson;

const plan = buildLessonPlan(minimalLesson);

// Generator for a remediation queue: an array of conceptIds, possibly empty.
const remediationQueueArb: fc.Arbitrary<string[]> = fc.array(
  fc.string({ minLength: 1, maxLength: 4 }),
  { minLength: 0, maxLength: 6 },
);

describe('mastery evaluate — gate remediation routing (Part A)', () => {
  // Feature: interactive-lesson-experience, Property 11: Mastery gate routes weak concepts back before completion
  it('routes exactly the below-gate concepts into remediation and sets mastered accordingly', () => {
    fc.assert(
      fc.property(answersByConceptArb, (answersByConcept) => {
        const { records, remediation } = evaluate(answersByConcept);
        const remediationSet = new Set(remediation);

        for (const conceptId of Object.keys(answersByConcept)) {
          const score = conceptScore(answersByConcept[conceptId]);
          const belowGate = score < MASTERY_GATE;

          // score < MASTERY_GATE  <=>  conceptId in remediation route.
          expect(remediationSet.has(conceptId)).toBe(belowGate);

          // mastered reflects the gate exactly.
          expect(records[conceptId].score).toBe(score);
          expect(records[conceptId].mastered).toBe(score >= MASTERY_GATE);
        }

        // The remediation route contains only known concepts.
        for (const conceptId of remediation) {
          expect(Object.prototype.hasOwnProperty.call(answersByConcept, conceptId)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('lessonReducer COMPLETE — mastery gate (Part B)', () => {
  // Feature: interactive-lesson-experience, Property 11: Mastery gate routes weak concepts back before completion
  it('rejects COMPLETE while remediationQueue is non-empty, allows it when empty', () => {
    fc.assert(
      fc.property(remediationQueueArb, (remediationQueue) => {
        const state = { ...initLessonState(plan), remediationQueue };

        const next = lessonReducer(state, { t: 'COMPLETE' }, plan);

        if (remediationQueue.length > 0) {
          // Non-empty queue: completion rejected, no transition.
          expect(next.completed).toBe(false);
          expect(next).toBe(state);
        } else {
          // Empty queue: completion succeeds.
          expect(next.completed).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
