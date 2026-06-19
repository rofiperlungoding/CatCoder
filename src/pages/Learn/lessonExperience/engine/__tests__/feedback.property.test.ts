/**
 * Property-based tests for the assessable-block feedback model.
 *
 * Property 13: Feedback always carries a non-color signal and never dead-ends —
 * for any assessable block result, `buildFeedback` SHALL produce a descriptor
 * with an explicit non-empty `icon` AND non-empty `text` (color is never the
 * sole signal), and an incorrect result SHALL leave the block retryable
 * (`canRetry === true`) with a non-empty hint so the learner never dead-ends.
 *
 * Validates: Requirements 13.1, 13.2, 13.3, 16.2
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { buildFeedback, type FeedbackInput } from '../feedback';

/**
 * Optional explanatory text that exercises the engine's default-fallback paths:
 * undefined, blank/whitespace-only strings (which should fall back to a
 * default), and meaningful strings.
 */
const optionalTextArb: fc.Arbitrary<string | undefined> = fc.option(
  fc.oneof(
    fc.constant(''),
    fc.constant('   '),
    fc.constant('\t\n  '),
    fc.string({ maxLength: 60 }),
  ),
  { nil: undefined },
);

/** Generator for an arbitrary FeedbackInput across correct/incorrect outcomes. */
const feedbackInputArb: fc.Arbitrary<FeedbackInput> = fc.record({
  correct: fc.boolean(),
  why: optionalTextArb,
  misconception: optionalTextArb,
  hint: optionalTextArb,
});

describe('buildFeedback', () => {
  // Feature: interactive-lesson-experience, Property 13: Feedback always carries a non-color signal and never dead-ends
  it('always carries a non-color signal (icon + text) and never dead-ends on incorrect', () => {
    fc.assert(
      fc.property(feedbackInputArb, (input) => {
        const descriptor = buildFeedback(input);

        // Req 16.2: color is never the sole signal — an explicit non-empty icon
        // AND non-empty text accompany every result.
        expect(typeof descriptor.icon).toBe('string');
        expect((descriptor.icon as string).length).toBeGreaterThan(0);
        expect(['check', 'alert']).toContain(descriptor.icon);

        expect(typeof descriptor.text).toBe('string');
        expect(descriptor.text.trim().length).toBeGreaterThan(0);

        if (input.correct === true) {
          // Req 13.1: correct → check icon + correct tone.
          expect(descriptor.tone).toBe('correct');
          expect(descriptor.icon).toBe('check');
        } else {
          // Req 13.2 / 13.3: incorrect → retryable (never dead-ends), with a
          // supportive non-empty hint and the alert/incorrect signal.
          expect(descriptor.tone).toBe('incorrect');
          expect(descriptor.icon).toBe('alert');
          expect(descriptor.canRetry).toBe(true);
          expect(typeof descriptor.hint).toBe('string');
          expect((descriptor.hint as string).trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });
});
