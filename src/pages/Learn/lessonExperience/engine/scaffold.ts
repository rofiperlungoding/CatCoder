/**
 * Faded-scaffolding levels for the interactive lesson experience engine.
 *
 * As a learner progresses through the ordered concepts of a lesson, the amount
 * of instructional support ("scaffolding") is gradually reduced — the early
 * concepts present a full worked example, while later concepts fade toward an
 * independent, unsupported task. This module computes the scaffold level for
 * each {@link ConceptChunk} purely from its position in the lesson's concept
 * sequence.
 *
 * Level semantics: `0` = full worked example, higher = more faded (less
 * support). The produced sequence is always non-decreasing across concept
 * order, so a later concept never receives more support than an earlier one.
 *
 * Requirements: 5.5 (faded scaffolding across concept order), 8.4 (scaffolding
 * is reduced, never increased, as the learner progresses).
 */

import type { ConceptChunk } from './types';

/**
 * Compute a non-decreasing scaffold level for each concept, by its position in
 * the provided concept sequence.
 *
 * The returned array is parallel to the input array: `result[i]` is the
 * scaffold level for `concepts[i]`. The earliest concept starts at `0` (full
 * worked example) and each subsequent concept fades by one level, so the
 * sequence is strictly increasing — and therefore non-decreasing — across
 * concept order. A later chunk's level is always greater than or equal to
 * every earlier chunk's level.
 *
 * The function is total: an empty input yields an empty array, and a single
 * concept yields `[0]`.
 *
 * @param concepts The lesson's concept chunks, in lesson (presentation) order.
 * @returns Scaffold levels aligned to the input array indices.
 */
export function computeScaffoldLevels(concepts: ConceptChunk[]): number[] {
  return concepts.map((_, index) => index);
}
