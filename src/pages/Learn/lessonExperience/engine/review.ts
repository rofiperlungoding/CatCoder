/**
 * Spaced-repetition review scheduling for the interactive lesson experience
 * engine.
 *
 * After a learner completes a lesson, the concepts they encountered are
 * scheduled for future review at progressively wider spacing. The first review
 * happens after {@link FIRST_INTERVAL_DAYS}; each subsequent concept in the
 * sequence is scheduled with a longer interval (1 → 3 → 7 → 15 …), reflecting
 * the expanding-interval principle of spaced repetition.
 *
 * Concepts are identified by their stable concept id (a `string`). Callers that
 * hold {@link ConceptChunk} values can pass `chunk.id`.
 *
 * Requirements: 11.3 (schedule concepts for spaced review), 11.4 (review
 * intervals grow over the sequence).
 */

/**
 * Initial spacing, in days, before a concept's first review. Later intervals in
 * a schedule grow from this value (1 → 3 → 7 …).
 */
export const FIRST_INTERVAL_DAYS = 1;

/** Number of milliseconds in a single day, used to convert intervals to epoch offsets. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * A scheduled spaced-repetition review for a single concept.
 */
export interface ReviewItem {
  /** Stable identity of the concept to review. */
  conceptId: string;
  /** When the review becomes due, as an epoch timestamp in milliseconds. */
  dueAt: number;
  /** Spacing applied before this review, in days (always `>= FIRST_INTERVAL_DAYS`). */
  intervalDays: number;
}

/**
 * Grow the review interval for the next position in a schedule. The sequence
 * starts at {@link FIRST_INTERVAL_DAYS} and expands as `1 → 3 → 7 → 15 …`
 * (each step is `previous * 2 + 1`), giving steadily wider spacing.
 *
 * @param previous The interval (in days) used for the prior concept.
 * @returns The next, strictly larger interval in days.
 */
function nextInterval(previous: number): number {
  return previous * 2 + 1;
}

/**
 * Schedule a spaced-repetition review for each concept.
 *
 * Returns one {@link ReviewItem} per concept, preserving the input order. The
 * first concept is scheduled with {@link FIRST_INTERVAL_DAYS} of spacing and
 * each subsequent concept receives a wider interval (1 → 3 → 7 …). Every item's
 * `dueAt` is `now + intervalDays * MS_PER_DAY`, which is strictly greater than
 * `now` because `intervalDays >= FIRST_INTERVAL_DAYS >= 1`.
 *
 * The function is total: an empty `concepts` array yields an empty schedule.
 *
 * @param concepts Concept ids to schedule, in the desired review order.
 * @param now The reference time (epoch milliseconds) the schedule is anchored to.
 * @returns Index-aligned review items, one per concept.
 */
export function scheduleReview(concepts: string[], now: number): ReviewItem[] {
  let intervalDays = FIRST_INTERVAL_DAYS;

  return concepts.map((conceptId, index) => {
    if (index > 0) {
      intervalDays = nextInterval(intervalDays);
    }

    return {
      conceptId,
      intervalDays,
      dueAt: now + intervalDays * MS_PER_DAY,
    };
  });
}
