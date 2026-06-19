/**
 * Feedback model for assessable lesson blocks.
 *
 * Pure logic that maps an assessment outcome (correct / incorrect) into a
 * presentation-agnostic {@link FeedbackDescriptor}. The descriptor always
 * carries an explicit, non-color `icon` identifier AND human-readable `text`,
 * so that color is never the sole indicator of correctness (Requirement 16.2),
 * and an incorrect result always leaves the block retryable so the learner can
 * try again without reaching a dead-end state (Requirements 13.2, 13.3).
 *
 * This module is intentionally UI-free: it returns string icon identifiers
 * (not JSX or color values), leaving the actual rendering — icon glyph, lime
 * vs. rose styling, retry affordance — to the consuming block component
 * (`blocks/Feedback.tsx`, task 14.1). The repo ships no icon library, so the
 * identifiers are semantic tokens the renderer maps to whatever visual it uses.
 *
 * Requirements:
 * - 13.1: correct answer → check icon + a one-line explanation of why correct.
 * - 13.2: incorrect → supportive message explaining the misconception, with a
 *         hint, and the ability to retry (rendered rose by the consumer).
 * - 13.3: retry never reaches a dead-end state (`canRetry` is true for incorrect).
 * - 16.2: every correct/incorrect signal carries an icon AND text — color is
 *         never the only indicator.
 */

/**
 * Semantic tone of the feedback. Drives color in the UI (lime for `correct`,
 * rose for `incorrect`) but is never the *only* signal — `icon` and `text`
 * always accompany it (Requirement 16.2).
 */
export type FeedbackTone = 'correct' | 'incorrect';

/**
 * Explicit, non-color icon identifier. A consuming component maps these tokens
 * to a concrete glyph. `check` accompanies a correct result; `alert`
 * accompanies an incorrect result. Always non-empty.
 */
export type FeedbackIcon = 'check' | 'alert';

/**
 * A presentation-agnostic descriptor of the feedback to show for an assessable
 * block result. The descriptor is guaranteed to carry a non-empty `icon` and a
 * non-empty `text` for any result (Requirement 16.2), and `canRetry` is always
 * true for an incorrect result so retry never dead-ends (Requirements 13.2/13.3).
 */
export interface FeedbackDescriptor {
  /** Semantic tone driving (but not solely indicating) color. */
  tone: FeedbackTone;
  /** Explicit non-color icon identifier; always non-empty. */
  icon: FeedbackIcon;
  /** Human-readable explanation; always non-empty. */
  text: string;
  /** True for incorrect results so the learner can always retry (never dead-ends). */
  canRetry: boolean;
  /** Supportive hint shown for incorrect results. */
  hint?: string;
}

/**
 * Input describing an assessment outcome. Only `correct` is required; the
 * optional explanatory fields fall back to sensible defaults when missing or
 * blank, keeping {@link buildFeedback} total.
 */
export interface FeedbackInput {
  /** Whether the learner's answer was correct. */
  correct: boolean;
  /** One-line explanation of why the answer is correct (used when `correct`). */
  why?: string;
  /** Supportive explanation of the misconception (used when incorrect). */
  misconception?: string;
  /** A hint to help the learner on retry (used when incorrect). */
  hint?: string;
}

/** Default one-line explanation when no `why` is supplied for a correct answer. */
const DEFAULT_CORRECT_TEXT = "Correct \u2014 that's exactly right.";

/** Default supportive message when no `misconception` is supplied for an incorrect answer. */
const DEFAULT_INCORRECT_TEXT = "Not quite \u2014 let's look at this again.";

/** Default hint when no `hint` is supplied for an incorrect answer. */
const DEFAULT_HINT = 'Take another look at the example and try again.';

/**
 * Coerce a possibly-missing string into a trimmed value, returning `undefined`
 * when the input is absent or blank so callers can apply a default.
 */
function cleanText(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Build a {@link FeedbackDescriptor} from an assessment outcome.
 *
 * The function is total and pure: it never throws, applies sensible defaults
 * for missing/blank optional fields, and always returns a descriptor with a
 * non-empty `icon` and non-empty `text`.
 *
 * - Correct → `tone: 'correct'`, `icon: 'check'`, `text` = the one-line `why`
 *   (or a default), `canRetry: false` (a correct answer needs no retry).
 * - Incorrect → `tone: 'incorrect'`, `icon: 'alert'`, `text` = the supportive
 *   `misconception` explanation (or a default), `canRetry: true`, and a `hint`
 *   (the supplied hint or a default) so the learner can always try again.
 *
 * @param input The assessment outcome and optional explanatory text.
 */
export function buildFeedback(input: FeedbackInput): FeedbackDescriptor {
  const isCorrect = input?.correct === true;

  if (isCorrect) {
    return {
      tone: 'correct',
      icon: 'check',
      text: cleanText(input?.why) ?? DEFAULT_CORRECT_TEXT,
      canRetry: false,
    };
  }

  return {
    tone: 'incorrect',
    icon: 'alert',
    text: cleanText(input?.misconception) ?? DEFAULT_INCORRECT_TEXT,
    canRetry: true,
    hint: cleanText(input?.hint) ?? DEFAULT_HINT,
  };
}
