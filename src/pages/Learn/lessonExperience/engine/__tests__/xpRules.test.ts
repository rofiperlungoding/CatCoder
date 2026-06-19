/**
 * Example-based unit tests for the display-only XP rules.
 *
 * These fixtures pin the bounded hint-reduction behavior of
 * {@link estimateXpAfterHints} and the server-mirrored award constants:
 *
 *   - The estimate decreases by a gentle fixed fraction
 *     ({@link HINT_XP_REDUCTION_PER_LEVEL}, 15%) of the base XP per revealed
 *     hint level, is **non-increasing** in `hintLevel`, and is clamped so it
 *     **never drops below zero**.
 *   - Out-of-range inputs (negative / non-finite `hintLevel`, fractional
 *     `hintLevel`, negative / non-finite `baseXp`) are normalized to safe
 *     bounds.
 *   - {@link AWARD_XP} and the per-kind constants mirror the server-owned award
 *     amounts (lesson = 50, practice = 100, daily = 150).
 *
 * Validates: Requirements 13.4
 */

import { describe, expect, it } from 'vitest';
import {
  AWARD_XP,
  DAILY_XP,
  HINT_XP_REDUCTION_PER_LEVEL,
  LESSON_XP,
  PRACTICE_XP,
  estimateXpAfterHints,
} from '../xpRules';

describe('estimateXpAfterHints — no hints', () => {
  it('returns the full base XP when no hints are revealed', () => {
    expect(estimateXpAfterHints(100, 0)).toBe(100);
  });
});

describe('estimateXpAfterHints — gentle bounded reduction', () => {
  it('reduces by 15% of base per revealed level', () => {
    expect(estimateXpAfterHints(100, 1)).toBeCloseTo(85);
    expect(estimateXpAfterHints(100, 2)).toBeCloseTo(70);
    expect(estimateXpAfterHints(100, 3)).toBeCloseTo(55);
    expect(estimateXpAfterHints(100, 4)).toBeCloseTo(40);
  });

  it('is non-increasing across consecutive hint levels (base 100)', () => {
    for (let k = 0; k <= 6; k++) {
      const current = estimateXpAfterHints(100, k);
      const next = estimateXpAfterHints(100, k + 1);
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });
});

describe('estimateXpAfterHints — clamped at zero', () => {
  it('never drops below zero for large hint levels', () => {
    expect(estimateXpAfterHints(100, 100)).toBe(0);
    expect(estimateXpAfterHints(100, 1000)).toBe(0);
  });
});

describe('estimateXpAfterHints — defensive input handling', () => {
  it('treats a negative hint level as zero hints (returns base XP)', () => {
    expect(estimateXpAfterHints(100, -5)).toBe(100);
  });

  it('treats non-finite hint levels as zero hints (returns base XP)', () => {
    expect(estimateXpAfterHints(100, Number.NaN)).toBe(100);
    expect(estimateXpAfterHints(100, Number.POSITIVE_INFINITY)).toBe(100);
    expect(estimateXpAfterHints(100, Number.NEGATIVE_INFINITY)).toBe(100);
  });

  it('floors a fractional hint level to whole revealed levels', () => {
    expect(estimateXpAfterHints(100, 1.9)).toBeCloseTo(85);
  });

  it('treats a negative or non-finite base XP as zero', () => {
    expect(estimateXpAfterHints(-100, 0)).toBe(0);
    expect(estimateXpAfterHints(Number.NaN, 0)).toBe(0);
    expect(estimateXpAfterHints(Number.POSITIVE_INFINITY, 2)).toBe(0);
  });
});

describe('XP award constants mirror the server-owned amounts', () => {
  it('pins the per-kind award amounts', () => {
    expect(AWARD_XP.lesson).toBe(50);
    expect(AWARD_XP.practice).toBe(100);
    expect(AWARD_XP.daily).toBe(150);
  });

  it('pins the individual exported constants', () => {
    expect(LESSON_XP).toBe(50);
    expect(PRACTICE_XP).toBe(100);
    expect(DAILY_XP).toBe(150);
  });

  it('pins the per-level reduction fraction', () => {
    expect(HINT_XP_REDUCTION_PER_LEVEL).toBe(0.15);
  });
});

describe('estimateXpAfterHints — general monotonicity and non-negativity', () => {
  it('is non-increasing and non-negative across many bases and levels', () => {
    const bases = [10, 50, 100, 150, 333];
    for (const base of bases) {
      let previous = Number.POSITIVE_INFINITY;
      for (let level = 0; level <= 12; level++) {
        const estimate = estimateXpAfterHints(base, level);
        expect(estimate).toBeGreaterThanOrEqual(0);
        expect(estimate).toBeLessThanOrEqual(previous);
        previous = estimate;
      }
    }
  });
});
