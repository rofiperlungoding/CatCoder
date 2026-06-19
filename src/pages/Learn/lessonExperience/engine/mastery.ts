/**
 * Mastery evaluation for the interactive lesson experience engine.
 *
 * This module records pre/post assessment results per `conceptId`, evaluates
 * the per-concept mastery gate, and routes concepts that fall below the gate
 * back into a remediation queue before a lesson can be completed.
 *
 * Two pedagogical constants govern the behaviour:
 * - {@link MASTERY_GATE}: the fraction of Post_Flight answers a learner must get
 *   correct, per concept, to be considered to have mastered that concept.
 * - {@link TESTOUT_THRESHOLD}: the (higher) pre-test mastery fraction a learner
 *   must reach to skip the Learn phase for a concept.
 *
 * All functions in this module are total: empty inputs yield empty records and
 * an empty remediation route, and per-concept scores are well-defined for any
 * number of answers (a concept with zero answers scores `0`).
 *
 * "Sure but wrong" aggregation rule (concept level): a concept is flagged
 * `sureButWrong` when ANY of its Post_Flight answers is incorrect while reported
 * with `confidence = 'high'`. This is the disjunctive (any) aggregation of the
 * per-answer rule in Property 12 — a single confidently-wrong answer is a
 * meaningful misconception signal, so it is surfaced even if other answers for
 * the same concept were correct. For a concept with no confidently-wrong
 * answers, `sureButWrong` is `false`.
 *
 * Requirements: 7.4 (record pre/post per concept), 10.3 (mastery gate), 10.4
 * (route weak concepts back), 10.5 ("sure but wrong" detection), 13.5 (mastery
 * surfaced per concept).
 */

import type { ConfidenceRating } from './types';

/**
 * Fraction of correct answers per concept required to pass the Post_Flight gate.
 * A concept is `mastered` when its score is greater than or equal to this value.
 */
export const MASTERY_GATE = 0.8;

/**
 * Pre-test mastery fraction required to skip the Learn phase for a concept.
 */
export const TESTOUT_THRESHOLD = 0.9;

/**
 * A single Post_Flight answer: whether it was correct and the learner's
 * self-reported confidence when answering.
 */
export interface PostAnswer {
  correct: boolean;
  confidence: ConfidenceRating;
}

/**
 * A Post_Flight answer attributed to a specific concept. Useful when answers
 * arrive as a flat list and need aggregating per `conceptId`.
 */
export interface ConceptAnswer extends PostAnswer {
  conceptId: string;
}

/**
 * The per-concept mastery outcome.
 *
 * - `score`: fraction of correct answers for the concept, in `[0, 1]`.
 * - `mastered`: `true` when `score >= MASTERY_GATE`.
 * - `sureButWrong`: `true` when any answer was incorrect with high confidence.
 */
export interface MasteryRecord {
  conceptId: string;
  score: number;
  mastered: boolean;
  sureButWrong: boolean;
}

/**
 * The result of evaluating Post_Flight answers across all concepts.
 *
 * - `records`: per-concept {@link MasteryRecord}, keyed by `conceptId`.
 * - `remediation`: the ordered list of `conceptId`s whose score is below
 *   {@link MASTERY_GATE}, i.e. the concepts that must be revisited before the
 *   lesson can complete.
 */
export interface MasteryEvaluation {
  records: Record<string, MasteryRecord>;
  remediation: string[];
}

/**
 * Aggregate a flat list of concept-attributed answers into a map keyed by
 * `conceptId`. Answer order within each concept is preserved.
 *
 * This is the helper used to record/aggregate raw pre/post results before
 * scoring. It is total: an empty list yields an empty map.
 *
 * @param answers Flat list of answers, each tagged with its `conceptId`.
 * @returns A map from `conceptId` to that concept's answers, in input order.
 */
export function aggregateByConcept(
  answers: ConceptAnswer[]
): Record<string, PostAnswer[]> {
  const grouped: Record<string, PostAnswer[]> = {};
  for (const { conceptId, correct, confidence } of answers) {
    (grouped[conceptId] ??= []).push({ correct, confidence });
  }
  return grouped;
}

/**
 * Compute the per-concept score: the fraction of answers that were correct.
 *
 * Total by construction: a concept with no answers scores `0` (an empty set of
 * evidence cannot demonstrate mastery).
 *
 * @param answers The answers recorded for a single concept.
 * @returns A fraction in `[0, 1]`.
 */
export function conceptScore(answers: PostAnswer[]): number {
  if (answers.length === 0) {
    return 0;
  }
  const correctCount = answers.reduce((sum, a) => sum + (a.correct ? 1 : 0), 0);
  return correctCount / answers.length;
}

/**
 * Determine whether any of a concept's answers was incorrect while reported with
 * high confidence (the concept-level "sure but wrong" signal).
 *
 * @param answers The answers recorded for a single concept.
 * @returns `true` when at least one answer is incorrect with `confidence = 'high'`.
 */
export function isSureButWrong(answers: PostAnswer[]): boolean {
  return answers.some((a) => !a.correct && a.confidence === 'high');
}

/**
 * Whether a pre-test score qualifies the learner to skip the Learn phase.
 *
 * @param score A per-concept fraction in `[0, 1]`.
 * @returns `true` when `score >= TESTOUT_THRESHOLD`.
 */
export function meetsTestOut(score: number): boolean {
  return score >= TESTOUT_THRESHOLD;
}

/**
 * Evaluate Post_Flight results across all concepts.
 *
 * Accepts answers grouped per `conceptId` (use {@link aggregateByConcept} to
 * build this shape from a flat list). For each concept it computes the score,
 * the `mastered` flag (score `>= MASTERY_GATE`), and the `sureButWrong` flag
 * (any answer incorrect with high confidence), and collects every below-gate
 * concept into the remediation route.
 *
 * Total by construction: an empty input yields empty `records` and an empty
 * `remediation` route. Concepts present with an empty answer list score `0` and
 * are therefore routed to remediation.
 *
 * @param answersByConcept Map from `conceptId` to that concept's Post_Flight answers.
 * @returns The per-concept {@link MasteryRecord}s and the remediation route.
 */
export function evaluate(
  answersByConcept: Record<string, PostAnswer[]>
): MasteryEvaluation {
  const records: Record<string, MasteryRecord> = {};
  const remediation: string[] = [];

  for (const conceptId of Object.keys(answersByConcept)) {
    const answers = answersByConcept[conceptId] ?? [];
    const score = conceptScore(answers);
    const mastered = score >= MASTERY_GATE;

    records[conceptId] = {
      conceptId,
      score,
      mastered,
      sureButWrong: isSureButWrong(answers),
    };

    if (!mastered) {
      remediation.push(conceptId);
    }
  }

  return { records, remediation };
}
