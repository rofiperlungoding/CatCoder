/**
 * Example-based unit tests for the mastery engine gate/threshold boundaries.
 *
 * These fixtures pin the exact, inclusive boundary behavior of the two
 * pedagogical constants that govern mastery:
 *
 *   - {@link MASTERY_GATE} (0.8): a concept is `mastered` when its Post_Flight
 *     score is greater than or equal to the gate (inclusive at 0.8).
 *   - {@link TESTOUT_THRESHOLD} (0.9): a learner tests out when their pre-test
 *     score is greater than or equal to the threshold (inclusive at 0.9).
 *
 * Boundary cases are constructed with answer arrays that produce exact
 * fractions (e.g. 4 correct + 1 incorrect = 0.8) so the assertions exercise the
 * inclusive `>=` comparison precisely rather than relying on float fuzz.
 *
 * Validates: Requirements 7.2, 10.3
 */

import { describe, expect, it } from 'vitest';
import { MASTERY_GATE, TESTOUT_THRESHOLD, conceptScore, evaluate, meetsTestOut } from '../mastery';
import type { PostAnswer } from '../mastery';

/** Build a list of `correct` then `incorrect` answers with medium confidence. */
function answers(correct: number, incorrect: number): PostAnswer[] {
  const list: PostAnswer[] = [];
  for (let i = 0; i < correct; i++) {
    list.push({ correct: true, confidence: 'medium' });
  }
  for (let i = 0; i < incorrect; i++) {
    list.push({ correct: false, confidence: 'medium' });
  }
  return list;
}

describe('mastery boundary constants', () => {
  it('pins the exact constant values', () => {
    expect(MASTERY_GATE).toBe(0.8);
    expect(TESTOUT_THRESHOLD).toBe(0.9);
  });
});

describe('conceptScore exact fractions', () => {
  it('4 correct out of 5 is exactly 0.8 (the gate)', () => {
    expect(conceptScore(answers(4, 1))).toBe(0.8);
  });

  it('3 correct out of 5 is 0.6 (below the gate)', () => {
    expect(conceptScore(answers(3, 2))).toBe(0.6);
  });

  it('empty answers score 0', () => {
    expect(conceptScore([])).toBe(0);
  });
});

describe('meetsTestOut at the threshold', () => {
  it('is inclusive exactly at the threshold', () => {
    expect(meetsTestOut(0.9)).toBe(true);
  });

  it('is false just below the threshold', () => {
    expect(meetsTestOut(0.89)).toBe(false);
  });

  it('is true at a perfect score', () => {
    expect(meetsTestOut(1.0)).toBe(true);
  });
});

describe('evaluate at the mastery gate', () => {
  it('marks a concept at exactly 0.8 as mastered and excludes it from remediation', () => {
    const { records, remediation } = evaluate({ 'concept-gate': answers(4, 1) });

    expect(records['concept-gate'].score).toBe(0.8);
    expect(records['concept-gate'].mastered).toBe(true);
    expect(remediation).not.toContain('concept-gate');
  });

  it('routes a concept just below the gate to remediation', () => {
    const { records, remediation } = evaluate({ 'concept-low': answers(3, 2) });

    expect(records['concept-low'].score).toBe(0.6);
    expect(records['concept-low'].mastered).toBe(false);
    expect(remediation).toContain('concept-low');
  });

  it('routes an empty-answer concept (score 0) to remediation', () => {
    const { records, remediation } = evaluate({ 'concept-empty': [] });

    expect(records['concept-empty'].score).toBe(0);
    expect(records['concept-empty'].mastered).toBe(false);
    expect(remediation).toContain('concept-empty');
  });

  it('handles a mix of mastered, below-gate, and empty concepts together', () => {
    const { records, remediation } = evaluate({
      'concept-gate': answers(4, 1), // 0.8 -> mastered
      'concept-low': answers(3, 2), // 0.6 -> remediation
      'concept-empty': [], // 0 -> remediation
    });

    expect(records['concept-gate'].mastered).toBe(true);
    expect(records['concept-low'].mastered).toBe(false);
    expect(records['concept-empty'].mastered).toBe(false);

    expect(remediation).not.toContain('concept-gate');
    expect(remediation).toContain('concept-low');
    expect(remediation).toContain('concept-empty');
    expect(remediation).toHaveLength(2);
  });
});
