/**
 * Thin, session-scoped Zustand store wrapping the pure {@link lessonReducer}.
 *
 * This store owns no business logic of its own: it simply holds the in-progress
 * {@link LessonState} and its driving {@link LessonPlan}, and forwards every
 * dispatched {@link LessonEvent} through `lessonReducer(state, event, plan)`.
 * It is intentionally **not** persisted — a lesson session lives only for the
 * duration of the visit (Req 2.3). Persistent progress/XP remain owned by the
 * server-backed {@link useUserStore}.
 *
 * Live XP mirroring (Req 14.4): the lesson UI must never mint or own XP. The
 * single source of truth for the learner's XP is `useUserStore`'s
 * `user.xp` field. This module exposes {@link useLiveXp}, a selector hook that
 * reads that value reactively so the TopBar XP counter (one location) always
 * reflects the current user XP without the lesson store self-awarding anything.
 *
 * Requirements: 2.3, 14.4.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '../../../../stores';
import type { LessonPlan } from '../engine/types';
import {
  canGoPrevious,
  getActiveBlocks,
  getActivePhaseId,
  getActiveStep,
  getPrimaryLabel,
  getSubProgress,
  initLessonState,
  isPrimaryEnabled,
  lessonReducer,
  type LessonEvent,
  type LessonState,
} from './lessonMachine';

/**
 * Read the learner's current XP from the persistent user store. Returns `0`
 * when no user is signed in. This is the single source of XP truth that the
 * lesson session mirrors; it never writes back.
 */
function readLiveXp(): number {
  return useUserStore.getState().user?.xp ?? 0;
}

/**
 * The shape of the session-scoped lesson store.
 */
export interface LessonStore {
  /** The active lesson plan, or `null` before {@link LessonStore.init}. */
  plan: LessonPlan | null;
  /** The current runtime lesson state, or `null` before initialization. */
  state: LessonState | null;

  /**
   * Initialize the session for a plan. Seeds the reducer state via
   * {@link initLessonState}, mirroring the user's current live XP so the
   * displayed value starts in sync with {@link useUserStore}.
   */
  init: (plan: LessonPlan) => void;

  /**
   * Apply a {@link LessonEvent} through the pure reducer and store the result.
   * No-op (state unchanged) when the store has not been initialized.
   */
  dispatch: (event: LessonEvent) => void;

  /** Clear the session back to the uninitialized state. */
  reset: () => void;
}

/**
 * Session store wrapping {@link lessonReducer}. Not persisted.
 */
export const useLessonStore = create<LessonStore>()((set, get) => ({
  plan: null,
  state: null,

  init: (plan) => {
    set({ plan, state: initLessonState(plan, readLiveXp()) });
  },

  dispatch: (event) => {
    const { state, plan } = get();
    if (!state || !plan) {
      return;
    }
    set({ state: lessonReducer(state, event, plan) });
  },

  reset: () => {
    set({ plan: null, state: null });
  },
}));

/**
 * Reactive selector hook for the learner's live XP, mirrored from the single
 * source of truth (`useUserStore.user.xp`). Components — notably the TopBar XP
 * counter — should read XP through this hook so the value stays consistent and
 * the lesson session never owns or awards XP itself (Req 14.4).
 */
export function useLiveXp(): number {
  return useUserStore((s) => s.user?.xp ?? 0);
}

// --- Convenience selector re-exports --------------------------------------
// Thin wrappers that apply the pure selectors against the current session.
// They return safe defaults before the store is initialized so callers need
// not null-check the raw state/plan.

/** Stable references for the pre-init fallbacks (avoid new objects per render). */
const EMPTY_BLOCKS: ReturnType<typeof getActiveBlocks> = [];
const DEFAULT_SUBPROGRESS = { step: 1, total: 1 } as const;

/** Active phase id, or `undefined` before init. */
export function useActivePhaseId() {
  return useLessonStore((s) =>
    s.state && s.plan ? getActivePhaseId(s.state, s.plan) : undefined
  );
}

/** Active step's content blocks, or `[]` before init. */
export function useActiveBlocks() {
  return useLessonStore(
    useShallow((s) => (s.state && s.plan ? getActiveBlocks(s.state, s.plan) : EMPTY_BLOCKS))
  );
}

/** Active step, or `null` before init. */
export function useActiveStep() {
  return useLessonStore(
    useShallow((s) => (s.state && s.plan ? getActiveStep(s.state, s.plan) : null))
  );
}

/** Stepper sub-progress (`step`/`total`), or `{ step: 1, total: 1 }` before init. */
export function useSubProgress() {
  return useLessonStore(
    useShallow((s) => (s.state && s.plan ? getSubProgress(s.state, s.plan) : DEFAULT_SUBPROGRESS))
  );
}

/** Whether the Previous control is available (`false` before init). */
export function useCanGoPrevious() {
  return useLessonStore((s) => (s.state && s.plan ? canGoPrevious(s.state, s.plan) : false));
}

/** Whether the primary action is enabled (`false` before init). */
export function useIsPrimaryEnabled() {
  return useLessonStore((s) => (s.state && s.plan ? isPrimaryEnabled(s.state, s.plan) : false));
}

/** The single primary-action label (`'Continue'` before init). */
export function usePrimaryLabel() {
  return useLessonStore((s) => (s.state && s.plan ? getPrimaryLabel(s.state, s.plan) : 'Continue'));
}
