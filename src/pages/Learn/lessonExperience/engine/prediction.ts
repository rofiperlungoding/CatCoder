/**
 * Predict → Run → Reveal comparison engine.
 *
 * Pure logic for the Predict_Run_Reveal interaction (Requirement 6): after a
 * learner submits a predicted output and the example is executed via
 * {@link useCodeRunner}, this module compares the prediction against the actual
 * output and produces a verdict used to drive the reveal UI.
 *
 * Normalization mirrors the {@link useCodeRunner} hook (`src/hooks/useCodeRunner.ts`)
 * so that the in-lesson comparison stays consistent with how the runner itself
 * validates output: line endings are normalized (`\r\n` → `\n`), surrounding
 * whitespace is trimmed, and the comparison is case-insensitive.
 *
 * Note on `match` semantics: the hook validates challenge output using a
 * case-insensitive *substring* check (`normalizedActual.includes(normalizedExpected)`).
 * For the Predict_Run_Reveal reveal, however, design Property 8 specifies a
 * stricter rule — `match` holds iff the normalized predicted output *equals* the
 * normalized actual output. This module therefore classifies `match` by equality
 * while still exposing the substring relationship via {@link PredictionVerdict.actualContainsPredicted}
 * for display/feedback purposes.
 *
 * Requirements: 6.4, 6.5.
 */

/**
 * Classification of a prediction versus the actual execution output.
 *
 * - `match`   — the normalized predicted output equals the normalized actual output.
 * - `mismatch`— execution succeeded but the prediction did not match the output.
 * - `error`   — execution failed (the actual output indicates an execution error).
 */
export type PredictionClassification = 'match' | 'mismatch' | 'error';

/**
 * The result of comparing a learner's predicted output against the actual
 * execution output. Always carries both original values so the reveal UI can
 * display the prediction alongside the actual output regardless of outcome.
 */
export interface PredictionVerdict {
  /** How the prediction relates to the actual output. */
  classification: PredictionClassification;
  /** The learner's original predicted output, unmodified, for display. */
  predicted: string;
  /** The original actual output, unmodified, for display. */
  actual: string;
  /** The normalized predicted output used for comparison. */
  normalizedPredicted: string;
  /** The normalized actual output used for comparison. */
  normalizedActual: string;
  /** True when execution failed (the actual output indicates an error). */
  isError: boolean;
  /**
   * True when the normalized actual output contains the normalized predicted
   * output as a substring. Mirrors the hook's lenient validation check and is
   * exposed for richer feedback messaging; it is not used to decide `match`.
   */
  actualContainsPredicted: boolean;
}

/**
 * Prefix the runner uses to mark an execution failure in its output logs.
 * See `src/hooks/useCodeRunner.ts` (errors surface as a message starting with `Error:`).
 */
const ERROR_PREFIX = 'Error:';

/**
 * Coerce a possibly-undefined/null value into a string defensively, so the
 * comparison is total over any input the caller may provide.
 */
function toSafeString(value: string | null | undefined): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Normalize output text using the same rules as {@link useCodeRunner}:
 * normalize CRLF line endings to LF, trim surrounding whitespace, and lowercase
 * for case-insensitive comparison.
 */
function normalizeOutput(value: string): string {
  return value.replace(/\r\n/g, '\n').trim().toLowerCase();
}

/**
 * Detect whether an actual output value indicates an execution failure. The
 * runner reports errors as a message beginning with `Error:` (after trimming).
 */
function indicatesError(actual: string): boolean {
  return actual.trim().startsWith(ERROR_PREFIX);
}

/**
 * Compare a learner's predicted output against the actual execution output and
 * classify the result for the Predict_Run_Reveal reveal.
 *
 * The function is total: `null`/`undefined` inputs are treated as empty strings,
 * and it never throws. Both original values are always returned for display.
 *
 * Classification rules (design Property 8):
 * - `error`    — the actual output indicates an execution failure (starts with `Error:`).
 * - `match`    — execution succeeded AND normalized predicted === normalized actual.
 * - `mismatch` — execution succeeded but the prediction did not match.
 *
 * @param predicted The learner's predicted output.
 * @param actual    The actual output produced by the code runner.
 */
export function comparePrediction(
  predicted: string | null | undefined,
  actual: string | null | undefined,
): PredictionVerdict {
  const safePredicted = toSafeString(predicted);
  const safeActual = toSafeString(actual);

  const normalizedPredicted = normalizeOutput(safePredicted);
  const normalizedActual = normalizeOutput(safeActual);

  const isError = indicatesError(safeActual);
  const actualContainsPredicted =
    normalizedPredicted.length > 0 && normalizedActual.includes(normalizedPredicted);

  let classification: PredictionClassification;
  if (isError) {
    classification = 'error';
  } else if (normalizedPredicted === normalizedActual) {
    classification = 'match';
  } else {
    classification = 'mismatch';
  }

  return {
    classification,
    predicted: safePredicted,
    actual: safeActual,
    normalizedPredicted,
    normalizedActual,
    isError,
    actualContainsPredicted,
  };
}
