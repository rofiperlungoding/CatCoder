/**
 * Example-based unit tests for {@link comparePrediction} normalization.
 *
 * These fixtures pin the normalization rules the Predict_Run_Reveal comparison
 * relies on: CRLF line endings are normalized to LF, surrounding whitespace is
 * trimmed, and the comparison is case-insensitive. They complement the
 * property-based test (Property 8) by asserting concrete classification
 * outcomes for representative edge cases, and confirm the verdict always
 * carries the original predicted/actual values unchanged for display.
 *
 * Validates: Requirements 6.4
 */

import { describe, expect, it } from 'vitest';
import { comparePrediction } from '../prediction';

describe('comparePrediction normalization', () => {
  describe("classification 'match' (inputs normalize equal)", () => {
    it('is case-insensitive', () => {
      const verdict = comparePrediction('Hello', 'hello');
      expect(verdict.classification).toBe('match');
    });

    it('ignores a trailing newline', () => {
      const verdict = comparePrediction('result\n', 'result');
      expect(verdict.classification).toBe('match');
    });

    it('trims leading and trailing whitespace', () => {
      const verdict = comparePrediction('  spaced  ', 'spaced');
      expect(verdict.classification).toBe('match');
    });

    it('normalizes CRLF to LF', () => {
      const verdict = comparePrediction('line1\r\nline2', 'line1\nline2');
      expect(verdict.classification).toBe('match');
    });

    it('handles combined CRLF, trailing newline, whitespace, and case', () => {
      const verdict = comparePrediction('DONE\r\n', '  done  ');
      expect(verdict.classification).toBe('match');
    });
  });

  describe("classification 'mismatch' (successful run, prediction differs)", () => {
    it('classifies entirely different output as mismatch', () => {
      const verdict = comparePrediction('foo', 'bar');
      expect(verdict.classification).toBe('mismatch');
    });

    it('uses equality (not substring) so a prefix is a mismatch', () => {
      const verdict = comparePrediction('12', '123');
      expect(verdict.classification).toBe('mismatch');
    });
  });

  describe("classification 'error' (actual output indicates failure)", () => {
    it('classifies as error and sets isError when actual starts with "Error:"', () => {
      const verdict = comparePrediction('anything', 'Error: something went wrong');
      expect(verdict.classification).toBe('error');
      expect(verdict.isError).toBe(true);
    });

    it('treats an error actual as error even when prediction would otherwise match', () => {
      const verdict = comparePrediction('Error: something went wrong', 'Error: something went wrong');
      expect(verdict.classification).toBe('error');
      expect(verdict.isError).toBe(true);
    });
  });

  describe('original values preserved for display', () => {
    it('carries predicted and actual through unchanged regardless of outcome', () => {
      const matchVerdict = comparePrediction('DONE\r\n', '  done  ');
      expect(matchVerdict.predicted).toBe('DONE\r\n');
      expect(matchVerdict.actual).toBe('  done  ');

      const mismatchVerdict = comparePrediction('foo', 'bar');
      expect(mismatchVerdict.predicted).toBe('foo');
      expect(mismatchVerdict.actual).toBe('bar');

      const errorVerdict = comparePrediction('anything', 'Error: something went wrong');
      expect(errorVerdict.predicted).toBe('anything');
      expect(errorVerdict.actual).toBe('Error: something went wrong');
    });
  });
});
