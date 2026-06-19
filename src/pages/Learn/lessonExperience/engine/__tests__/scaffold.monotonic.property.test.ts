/**
 * Property-based tests for the faded-scaffolding level computation.
 *
 * Property 7: Faded scaffolding is non-increasing across concept order — the
 * amount of instructional support never increases as the learner progresses,
 * which means the numeric scaffold level is NON-DECREASING across concept
 * order (higher number = more faded = less support).
 *
 * Validates: Requirements 5.5, 8.4
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { computeScaffoldLevels } from '../scaffold';
import type { ConceptChunk } from '../types';

// Generator for a single ConceptChunk with arbitrary id/title/order.
const conceptChunkArb: fc.Arbitrary<ConceptChunk> = fc.record({
  id: fc.string(),
  title: fc.string(),
  order: fc.integer(),
});

// Arrays of ConceptChunks of varying length, including empty and single-element.
const conceptsArb: fc.Arbitrary<ConceptChunk[]> = fc.array(conceptChunkArb, {
  minLength: 0,
  maxLength: 50,
});

describe('computeScaffoldLevels', () => {
  // Feature: interactive-lesson-experience, Property 7: Faded scaffolding is non-increasing across concept order
  it('produces non-decreasing scaffold levels parallel to the input', () => {
    fc.assert(
      fc.property(conceptsArb, (concepts) => {
        const levels = computeScaffoldLevels(concepts);

        // Result is parallel to the input array.
        expect(levels).toHaveLength(concepts.length);

        // Every level is a finite, non-negative number, and adjacent pairs are
        // non-decreasing (scaffolding fades — support never increases).
        for (let i = 0; i < levels.length; i++) {
          expect(Number.isFinite(levels[i])).toBe(true);
          expect(levels[i]).toBeGreaterThanOrEqual(0);
          if (i > 0) {
            expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
