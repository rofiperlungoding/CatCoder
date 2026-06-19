/**
 * Property-based tests for the Predict → Run → Reveal comparison engine.
 *
 * Property 8: Predict→Run→Reveal gating and comparison —
 * `comparePrediction(predicted, actual)` classifies the result as `match` iff
 * the normalized predicted output equals the normalized actual output, and as
 * `error` iff execution failed (the actual output starts with `Error:`). It
 * always returns both original values so the reveal UI can display the
 * prediction alongside the actual output regardless of outcome.
 *
 * Validates: Requirements 6.2, 6.3, 6.4, 6.5
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { comparePrediction } from '../prediction';

/**
 * Mirror of the production normalization so the test independently derives the
 * expected classification rather than trusting the implementation's internals:
 * normalize CRLF → LF, trim, lowercase.
 */
function normalize(value: string): string {
  return value.replace(/\r\n/g, '\n').trim().toLowerCase();
}

/** Coerce null/undefined to '' the same way the engine does. */
function toSafe(value: string | null | undefined): string {
  return typeof value === 'string' ? value : '';
}

// Strings that exercise whitespace, CRLF line endings, and mixed case so the
// normalization rules are stressed by the generator.
const messyStringArb: fc.Arbitrary<string> = fc.string({ maxLength: 40 });
const crlfStringArb: fc.Arbitrary<string> = fc
  .array(
    fc.constantFrom('a', 'B', ' ', '\t', '\r\n', '\n', 'Error', ':', 'Z', '\r'),
    { maxLength: 12 },
  )
  .map((parts) => parts.join(''));

// "Error:"-prefixed actual outputs (optionally with leading whitespace, since
// error detection trims first) to specifically exercise the error branch.
const errorActualArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.constantFrom('', ' ', '\t', '\n', '\r\n', '   '),
    fc.string({ maxLength: 30 }),
  )
  .map(([lead, rest]) => `${lead}Error:${rest}`);

// Nullable variants so the function's totality over null/undefined is covered.
const nullableArb = (
  base: fc.Arbitrary<string>,
): fc.Arbitrary<string | null | undefined> =>
  fc.oneof(base, fc.constant(null), fc.constant(undefined)) as fc.Arbitrary<
    string | null | undefined
  >;

const predictedArb = nullableArb(fc.oneof(messyStringArb, crlfStringArb));
const actualArb = nullableArb(
  fc.oneof(messyStringArb, crlfStringArb, errorActualArb),
);

describe('comparePrediction', () => {
  // Feature: interactive-lesson-experience, Property 8: Predict→Run→Reveal gating and comparison
  it('classifies match/mismatch/error and always returns both values for display', () => {
    fc.assert(
      fc.property(predictedArb, actualArb, (predicted, actual) => {
        const verdict = comparePrediction(predicted, actual);

        const safePredicted = toSafe(predicted);
        const safeActual = toSafe(actual);

        // Both original values are always present for the reveal UI (Req 6.5):
        // null/undefined collapse to '' but are never dropped.
        expect(verdict.predicted).toBe(safePredicted);
        expect(verdict.actual).toBe(safeActual);

        // Normalized values mirror the documented normalization.
        expect(verdict.normalizedPredicted).toBe(normalize(safePredicted));
        expect(verdict.normalizedActual).toBe(normalize(safeActual));

        // Classification semantics (Req 6.2, 6.3, 6.4):
        const isError = safeActual.trim().startsWith('Error:');
        expect(verdict.isError).toBe(isError);

        if (isError) {
          expect(verdict.classification).toBe('error');
        } else if (normalize(safePredicted) === normalize(safeActual)) {
          expect(verdict.classification).toBe('match');
        } else {
          expect(verdict.classification).toBe('mismatch');
        }

        // `match` holds iff (not error) and normalized values are equal.
        const expectMatch =
          !isError && normalize(safePredicted) === normalize(safeActual);
        expect(verdict.classification === 'match').toBe(expectMatch);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: interactive-lesson-experience, Property 8: Predict→Run→Reveal gating and comparison
  it('always classifies Error:-prefixed actual output as error with isError set', () => {
    fc.assert(
      fc.property(predictedArb, errorActualArb, (predicted, actual) => {
        const verdict = comparePrediction(predicted, actual);

        expect(verdict.isError).toBe(true);
        expect(verdict.classification).toBe('error');
        // The original actual output is still surfaced for display.
        expect(verdict.actual).toBe(actual);
      }),
      { numRuns: 100 },
    );
  });
});
