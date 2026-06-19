/**
 * Property-based tests for spaced-review scheduling.
 *
 * Property 17: Spaced-review scheduling produces future, ordered due dates —
 * for any non-empty set of concepts added to the Review_Queue at time `now`,
 * scheduleReview returns one ReviewItem per concept, each with `dueAt > now`
 * and `intervalDays >= FIRST_INTERVAL_DAYS`, with intervals growing and due
 * dates strictly increasing across the sequence.
 *
 * Validates: Requirements 11.3, 11.4
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { scheduleReview, FIRST_INTERVAL_DAYS } from '../review';

// Arbitrary epoch timestamp (ms). Bounded so `now + interval * MS_PER_DAY`
// stays well within safe-integer range for the lengths we generate.
const nowArb: fc.Arbitrary<number> = fc.integer({ min: 0, max: 2_000_000_000_000 });

// Non-empty arrays of concept id strings.
const conceptsArb: fc.Arbitrary<string[]> = fc.array(fc.string(), {
  minLength: 1,
  maxLength: 30,
});

describe('scheduleReview', () => {
  // Feature: interactive-lesson-experience, Property 17: Spaced-review scheduling produces future, ordered due dates
  it('produces one future, ordered review item per concept', () => {
    fc.assert(
      fc.property(conceptsArb, nowArb, (concepts, now) => {
        const items = scheduleReview(concepts, now);

        // One ReviewItem per concept.
        expect(items).toHaveLength(concepts.length);

        let previousInterval = -Infinity;
        let previousDueAt = -Infinity;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          // Concept ids are index-aligned with the input.
          expect(item.conceptId).toBe(concepts[i]);

          // Every review is scheduled in the future.
          expect(item.dueAt).toBeGreaterThan(now);

          // Intervals never drop below the initial spacing.
          expect(item.intervalDays).toBeGreaterThanOrEqual(FIRST_INTERVAL_DAYS);

          // Intervals grow (non-decreasing) and due dates are strictly
          // increasing across the sequence (ordered due dates).
          expect(item.intervalDays).toBeGreaterThanOrEqual(previousInterval);
          expect(item.dueAt).toBeGreaterThan(previousDueAt);

          previousInterval = item.intervalDays;
          previousDueAt = item.dueAt;
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: interactive-lesson-experience, Property 17: Spaced-review scheduling produces future, ordered due dates
  it('is total: empty input yields an empty schedule', () => {
    fc.assert(
      fc.property(nowArb, (now) => {
        expect(scheduleReview([], now)).toEqual([]);
      }),
      { numRuns: 100 },
    );
  });
});
