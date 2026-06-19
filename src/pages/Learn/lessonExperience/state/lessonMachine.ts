/**
 * Pure navigation/gating reducer for the interactive lesson experience.
 *
 * This module is the **state layer** described in the design: a pure
 * `(state, event, plan) => state` reducer plus a set of pure selectors that the
 * shell components (`ActionBar`, `PhaseStepper`) and the property-based tests
 * consume directly. It owns no React state and performs no I/O — the thin
 * `useLessonStore` (Zustand) wraps this reducer and mirrors live XP.
 *
 * Responsibilities encoded here:
 * - phase/step navigation and advancement (monotonic, terminating in Recap);
 * - sub-progress derivation ("step x of n");
 * - Continue gating on the mandatory `Try_Interaction` (`isTry`) attempt;
 * - Previous availability (disabled exactly on the first step);
 * - primary-action label selection (`Continue | Check | Run | Submit`);
 * - non-punitive Pre_Flight recording + test-out (`testedOut`);
 * - Post_Flight evaluation wiring into the mastery engine;
 * - progressive hint reveal ordering with a bounded, non-increasing XP estimate;
 * - `COMPLETE` rejection while the remediation queue is non-empty.
 *
 * The reducer is total and pure: it returns new state objects, never mutates,
 * and never throws. Unknown/unhandled events return the state unchanged.
 *
 * Requirements: 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 5.2, 7.2, 7.3, 7.5,
 * 8.2, 9.6, 9.7, 10.4, 13.6.
 */

import { evaluate, meetsTestOut } from '../engine/mastery';
import type { MasteryRecord, PostAnswer } from '../engine/mastery';
import { AWARD_XP, estimateXpAfterHints } from '../engine/xpRules';
import type {
  ConfidenceRating,
  ContentBlock,
  LessonPlan,
  PhaseId,
  Step,
} from '../engine/types';

/**
 * The normalized outcome a content block reports upward after the learner
 * interacts with it. Code-bearing and assessable blocks all emit this shape so
 * the reducer can gate progression and attribute results to concepts uniformly.
 *
 * - `attempted` gates the Continue action for a step's `Try_Interaction`.
 * - `correct` is present for assessable blocks (MCQ, fill-in-blank, code task).
 * - `confidence` is captured for Post_Flight answers.
 * - `predicted` carries the learner's prediction for Predict→Run→Reveal blocks.
 * - `conceptId` attributes the result to a concept for mastery tracking.
 */
export interface BlockResult {
  blockId: string;
  attempted: boolean;
  correct?: boolean;
  confidence?: ConfidenceRating;
  predicted?: string;
  conceptId?: string;
}

/**
 * A single Post_Flight answer recorded in {@link LessonState.postFlight}.
 */
export interface PostFlightAnswer {
  correct: boolean;
  confidence: ConfidenceRating;
}

/**
 * The session-scoped runtime state of an in-progress lesson. Indices are into
 * the **present** phases (`plan.phases`) and the active phase's steps.
 */
export interface LessonState {
  /** Index into `plan.phases`. */
  phaseIndex: number;
  /** Index into the active phase's `steps`. */
  stepIndex: number;
  /** Block results keyed by `blockId`. */
  results: Record<string, BlockResult>;
  /** Pre_Flight per-concept correctness (non-punitive). */
  preFlight: Record<string, boolean>;
  /** Post_Flight per-concept answer (correctness + confidence). */
  postFlight: Record<string, PostFlightAnswer>;
  /** Revealed assistance level per code-task `blockId` (0..MAX_HINT_LEVEL). */
  hintLevel: Record<string, number>;
  /** Mastery outcome per concept, populated by `EVALUATE_POSTFLIGHT`. */
  mastery: Record<string, MasteryRecord>;
  /** Concepts routed back for remediation; blocks completion while non-empty. */
  remediationQueue: string[];
  /** Whether the learner tested out of the Learn phase via Pre_Flight. */
  testedOut: boolean;
  /** Displayed live XP value (also used for the hint-cost estimate). */
  liveXp: number;
  /** Whether the lesson has been completed. */
  completed: boolean;
}

/**
 * Events dispatched into {@link lessonReducer}.
 */
export type LessonEvent =
  | { t: 'ATTEMPT'; result: BlockResult }
  | { t: 'PRIMARY' }
  | { t: 'PREVIOUS' }
  | { t: 'REVEAL_HINT'; blockId: string }
  | { t: 'TEST_OUT' }
  | { t: 'EVALUATE_POSTFLIGHT' }
  | { t: 'ADD_TO_REVIEW' }
  | { t: 'COMPLETE' };

/**
 * The primary action labels the `ActionBar` can render. Exactly one is active
 * per step (see {@link getPrimaryLabel}).
 */
export type PrimaryLabel = 'Continue' | 'Check' | 'Run' | 'Submit';

/**
 * Fixed order in which progressive assistance is revealed for a code task. A
 * learner may only reveal the next level after the previous one is available,
 * and the full solution is always last.
 */
export const HINT_ORDER = ['hint1', 'hint2', 'workedStep', 'solution'] as const;

/** The maximum revealable hint level (the `solution` level). */
export const MAX_HINT_LEVEL = HINT_ORDER.length;

/**
 * Base XP estimate (server-owned practice award) used to derive the displayed
 * hint-cost estimate. The estimate is display-only and never mints XP.
 */
const HINT_XP_BASE = AWARD_XP.practice;

/**
 * Create the initial lesson state: positioned at the first step of the first
 * present phase, with empty records and zero live XP.
 *
 * @param plan The derived lesson plan (used only to anchor the starting index).
 * @param liveXp Optional starting live XP (defaults to `0`).
 */
export function initLessonState(_plan: LessonPlan, liveXp = 0): LessonState {
  return {
    phaseIndex: 0,
    stepIndex: 0,
    results: {},
    preFlight: {},
    postFlight: {},
    hintLevel: {},
    mastery: {},
    remediationQueue: [],
    testedOut: false,
    liveXp,
    completed: false,
  };
}

// --- Selectors -------------------------------------------------------------

/** The id of the currently active phase. */
export function getActivePhaseId(state: LessonState, plan: LessonPlan): PhaseId | undefined {
  return plan.phases[state.phaseIndex]?.id;
}

/**
 * The currently active step. Defensive against out-of-range indices: returns a
 * safe empty step rather than throwing if the plan is degenerate.
 */
export function getActiveStep(state: LessonState, plan: LessonPlan): Step {
  const step = plan.phases[state.phaseIndex]?.steps[state.stepIndex];
  if (step) {
    return step;
  }
  const phase = plan.phases[state.phaseIndex]?.id ?? 'PreFlight';
  return { id: `__empty-${state.phaseIndex}-${state.stepIndex}`, phase, blocks: [] };
}

/** The content blocks of the active step. */
export function getActiveBlocks(state: LessonState, plan: LessonPlan): ContentBlock[] {
  return getActiveStep(state, plan).blocks;
}

/**
 * Stepper sub-progress for the active phase: `1 ≤ step ≤ total`, where `total`
 * is the active phase's step count.
 */
export function getSubProgress(
  state: LessonState,
  plan: LessonPlan
): { step: number; total: number } {
  const total = plan.phases[state.phaseIndex]?.steps.length ?? 0;
  // Clamp the displayed step into [1, max(total, 1)] so the indicator is always
  // well-formed even for a degenerate (empty) phase.
  const safeTotal = Math.max(total, 1);
  const step = Math.min(Math.max(state.stepIndex + 1, 1), safeTotal);
  return { step, total: safeTotal };
}

/**
 * Whether the Previous control is available. False if and only if the state is
 * at the first step of the first present phase.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canGoPrevious(state: LessonState, _plan: LessonPlan): boolean {
  return !(state.phaseIndex === 0 && state.stepIndex === 0);
}

/**
 * Whether the single primary action is enabled. Disabled while the active step
 * has any `isTry` block without a recorded attempt; enabled otherwise.
 */
export function isPrimaryEnabled(state: LessonState, plan: LessonPlan): boolean {
  const blocks = getActiveBlocks(state, plan);
  for (const block of blocks) {
    if (block.isTry) {
      const result = state.results[block.id];
      if (!result || !result.attempted) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Priority of a primary label when a step contains multiple block types. The
 * most "active" affordance wins so a step pairing a reading block with a Try
 * MCQ surfaces `Check`, not `Continue`.
 */
const LABEL_PRIORITY: Record<PrimaryLabel, number> = {
  Submit: 3,
  Run: 2,
  Check: 1,
  Continue: 0,
};

/** Map a single block type to the primary label it implies. */
function labelForBlockType(type: ContentBlock['type']): PrimaryLabel {
  switch (type) {
    case 'codeTask':
      return 'Submit';
    case 'runnablePlayground':
    case 'predictOutput':
      return 'Run';
    case 'mcq':
    case 'fillInBlank':
      return 'Check';
    case 'conceptCard':
    case 'annotatedWalkthrough':
    case 'reflection':
    case 'recap':
    default:
      return 'Continue';
  }
}

/**
 * The single primary-action label for the active step. Selects the highest
 * priority label among the step's blocks; defaults to `Continue` for an empty
 * step. Always returns exactly one valid label.
 *
 * Mapping: `codeTask → Submit`, `runnablePlayground|predictOutput → Run`,
 * `mcq|fillInBlank → Check`, reading/recap/reflection → `Continue`.
 */
export function getPrimaryLabel(state: LessonState, plan: LessonPlan): PrimaryLabel {
  const blocks = getActiveBlocks(state, plan);
  let label: PrimaryLabel = 'Continue';
  for (const block of blocks) {
    const candidate = labelForBlockType(block.type);
    if (LABEL_PRIORITY[candidate] > LABEL_PRIORITY[label]) {
      label = candidate;
    }
  }
  return label;
}

// --- Navigation helpers ----------------------------------------------------

interface Position {
  phaseIndex: number;
  stepIndex: number;
}

/**
 * Compute the position immediately after `(phaseIndex, stepIndex)`, crossing
 * into the next phase's first step at a phase boundary. Returns `null` at the
 * terminal step (last step of the last phase).
 */
function stepForward(phaseIndex: number, stepIndex: number, plan: LessonPlan): Position | null {
  const phase = plan.phases[phaseIndex];
  if (!phase) {
    return null;
  }
  if (stepIndex + 1 < phase.steps.length) {
    return { phaseIndex, stepIndex: stepIndex + 1 };
  }
  if (phaseIndex + 1 < plan.phases.length) {
    return { phaseIndex: phaseIndex + 1, stepIndex: 0 };
  }
  return null;
}

/**
 * Compute the position immediately before `(phaseIndex, stepIndex)`, crossing
 * back to the previous phase's last step at a phase boundary. Returns `null` at
 * the first step of the first phase.
 */
function stepBackward(phaseIndex: number, stepIndex: number, plan: LessonPlan): Position | null {
  if (stepIndex > 0) {
    return { phaseIndex, stepIndex: stepIndex - 1 };
  }
  if (phaseIndex > 0) {
    const prevPhase = plan.phases[phaseIndex - 1];
    return { phaseIndex: phaseIndex - 1, stepIndex: Math.max(prevPhase.steps.length - 1, 0) };
  }
  return null;
}

/**
 * Apply the test-out skip: when the learner has tested out and the next
 * position lands inside the Learn phase, jump to the first step of the phase
 * after Learn (or terminate if none follows).
 */
function applyTestOutSkip(next: Position | null, plan: LessonPlan, testedOut: boolean): Position | null {
  if (!next || !testedOut) {
    return next;
  }
  if (plan.phases[next.phaseIndex]?.id !== 'Learn') {
    return next;
  }
  const afterLearn = next.phaseIndex + 1;
  return afterLearn < plan.phases.length ? { phaseIndex: afterLearn, stepIndex: 0 } : null;
}

// --- Reducer ---------------------------------------------------------------

/**
 * The pure lesson reducer. Computes the next {@link LessonState} from the
 * current state, an {@link LessonEvent}, and the (navigation-providing)
 * {@link LessonPlan}. Never mutates its inputs and never throws; unhandled
 * events return the state unchanged.
 *
 * @param state The current lesson state.
 * @param event The dispatched event.
 * @param plan The derived lesson plan, required for navigation.
 */
export function lessonReducer(
  state: LessonState,
  event: LessonEvent,
  plan: LessonPlan
): LessonState {
  switch (event.t) {
    case 'PRIMARY': {
      // Gated: only advance when the active step's Try interaction is attempted.
      if (!isPrimaryEnabled(state, plan)) {
        return state;
      }
      const next = applyTestOutSkip(
        stepForward(state.phaseIndex, state.stepIndex, plan),
        plan,
        state.testedOut
      );
      if (!next) {
        // Terminal step (Recap): no further advancement.
        return state;
      }
      return { ...state, phaseIndex: next.phaseIndex, stepIndex: next.stepIndex };
    }

    case 'PREVIOUS': {
      const prev = stepBackward(state.phaseIndex, state.stepIndex, plan);
      if (!prev) {
        // Already at the first step of the first phase.
        return state;
      }
      return { ...state, phaseIndex: prev.phaseIndex, stepIndex: prev.stepIndex };
    }

    case 'ATTEMPT': {
      const result: BlockResult = { ...event.result, attempted: true };
      const results = { ...state.results, [result.blockId]: result };

      const phaseId = getActivePhaseId(state, plan);
      let preFlight = state.preFlight;
      let postFlight = state.postFlight;

      if (phaseId === 'PreFlight' && result.conceptId) {
        // Non-punitive: record correctness, never touch liveXp.
        preFlight = { ...preFlight, [result.conceptId]: result.correct === true };
      } else if (phaseId === 'PostFlight' && result.conceptId) {
        postFlight = {
          ...postFlight,
          [result.conceptId]: {
            correct: result.correct === true,
            confidence: result.confidence ?? 'medium',
          },
        };
      }

      // liveXp is intentionally left unchanged (Property 9 / Req 7.3, 7.5).
      return { ...state, results, preFlight, postFlight };
    }

    case 'TEST_OUT': {
      const entries = Object.values(state.preFlight);
      if (entries.length === 0) {
        return state;
      }
      const correctCount = entries.reduce((sum, correct) => sum + (correct ? 1 : 0), 0);
      const ratio = correctCount / entries.length;
      if (meetsTestOut(ratio)) {
        // Grant the skip without any XP change (Property 10 / Req 7.2, 7.3).
        return { ...state, testedOut: true };
      }
      return state;
    }

    case 'EVALUATE_POSTFLIGHT': {
      const answersByConcept: Record<string, PostAnswer[]> = {};
      for (const [conceptId, answer] of Object.entries(state.postFlight)) {
        answersByConcept[conceptId] = [answer];
      }
      const { records, remediation } = evaluate(answersByConcept);
      return { ...state, mastery: records, remediationQueue: remediation };
    }

    case 'REVEAL_HINT': {
      const current = state.hintLevel[event.blockId] ?? 0;
      const nextLevel = Math.min(current + 1, MAX_HINT_LEVEL);
      if (nextLevel === current) {
        // Already at the final assistance level (solution): no change.
        return state;
      }
      const hintLevel = { ...state.hintLevel, [event.blockId]: nextLevel };
      // Displayed XP estimate: non-increasing in revealed levels, never < 0.
      const liveXp = estimateXpAfterHints(HINT_XP_BASE, nextLevel);
      return { ...state, hintLevel, liveXp };
    }

    case 'COMPLETE': {
      // Mastery gate: completion is rejected while remediation is pending.
      if (state.remediationQueue.length > 0) {
        return state;
      }
      return { ...state, completed: true };
    }

    case 'ADD_TO_REVIEW':
    default:
      // Review scheduling is handled outside the navigation state; unknown and
      // no-op events leave the state unchanged.
      return state;
  }
}
