/**
 * XP display rules for the interactive lesson experience engine.
 *
 * XP amounts in CatCoder are **server-owned**: the canonical award is computed
 * by the `submit_completion` RPC behind `useProgressStore.validateAndComplete`,
 * and the client only ever *displays* the returned `xp_awarded`. The constants
 * and helpers in this module exist purely for client-side display:
 *
 * - {@link AWARD_XP} mirrors the server's award amounts per activity kind
 *   (lesson = 50, practice = 100, daily = 150) so the UI can show a stable
 *   estimate before the server responds. They are display values only and never
 *   used to mint XP locally.
 * - {@link estimateXpAfterHints} produces a *local* XP estimate that gently
 *   decreases as a learner reveals progressive hints. This estimate is shown to
 *   the learner to communicate the cost of assistance; it never affects the
 *   authoritative server award.
 *
 * Requirements: 13.4 (gentle XP reduction per hint level), 14.1 (lesson award
 * 50 XP), 14.2 (practice award 100 XP), 14.3 (daily-scoped award 150 XP).
 */

/**
 * The kinds of activity the Progress_Service awards XP for. Used to key the
 * display-only award amounts in {@link AWARD_XP}.
 */
export type ActivityKind = 'lesson' | 'practice' | 'daily';

/** Display-only XP amount awarded for completing a lesson (server-owned). */
export const LESSON_XP = 50;

/** Display-only XP amount awarded for completing a practice problem (server-owned). */
export const PRACTICE_XP = 100;

/** Display-only XP amount awarded for completing a daily-scoped activity (server-owned). */
export const DAILY_XP = 150;

/**
 * Display-only map of server-owned XP award amounts keyed by activity kind.
 *
 * These amounts mirror the values computed server-side by `validateAndComplete`
 * and are used solely to render an estimate in the UI. The server remains the
 * sole authority for the XP a learner actually earns.
 */
export const AWARD_XP: Readonly<Record<ActivityKind, number>> = {
  lesson: LESSON_XP,
  practice: PRACTICE_XP,
  daily: DAILY_XP,
};

/**
 * Fraction of the base XP deducted per revealed hint level for the local
 * display estimate. A gentle 15% per level keeps the reduction meaningful but
 * non-punitive, in line with Requirement 13.4 ("reduce awarded XP by at most a
 * gentle reduction per hint level").
 */
export const HINT_XP_REDUCTION_PER_LEVEL = 0.15;

/**
 * Compute the locally displayed XP estimate after a learner has revealed
 * `hintLevel` progressive hints.
 *
 * The reduction rule is a fixed fraction of the base XP per revealed level
 * ({@link HINT_XP_REDUCTION_PER_LEVEL}, 15%), so each additional hint lowers the
 * estimate by `baseXp * 0.15`, clamped so the estimate never drops below zero.
 * The result is therefore:
 *
 * - **non-increasing in `hintLevel`**: revealing more hints never raises the
 *   estimate; and
 * - **non-negative**: the estimate is clamped at `0`.
 *
 * The helper is total and pure, and defends against out-of-range inputs:
 * - a negative or non-finite `hintLevel` is treated as `0` (no hints revealed);
 * - a fractional `hintLevel` is floored to whole revealed levels;
 * - a negative or non-finite `baseXp` is treated as `0`.
 *
 * Because the per-level reduction is a constant fraction of `baseXp`, a large
 * `hintLevel` simply saturates the estimate at the `0` floor.
 *
 * @param baseXp The starting (full) XP estimate for the activity, before hints.
 * @param hintLevel The number of progressive hint levels the learner revealed.
 * @returns A non-increasing (in `hintLevel`), non-negative XP estimate.
 */
export function estimateXpAfterHints(baseXp: number, hintLevel: number): number {
  // Defensive normalization: treat invalid inputs as their safe lower bound.
  const safeBase = Number.isFinite(baseXp) && baseXp > 0 ? baseXp : 0;
  const safeLevel = Number.isFinite(hintLevel) && hintLevel > 0 ? Math.floor(hintLevel) : 0;

  const reduction = safeBase * HINT_XP_REDUCTION_PER_LEVEL * safeLevel;
  const estimate = safeBase - reduction;

  // Clamp at zero so the estimate is never negative for large hint levels.
  return estimate > 0 ? estimate : 0;
}
