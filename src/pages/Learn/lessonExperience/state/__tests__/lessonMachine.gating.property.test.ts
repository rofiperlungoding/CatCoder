/**
 * Property-based tests for the lessonMachine reducer's Continue gating.
 *
 * Feature: interactive-lesson-experience, Property 4: Continue gating reflects
 * Try attempt state.
 *
 * Validates: Requirements 4.3, 4.4, 5.2, 8.2
 *
 * Property 4 statement: For any step containing a Try_Interaction (an `isTry`
 * block), the reducer SHALL report the primary (Continue) action disabled while
 * no ATTEMPT for that block has been recorded, and enabled once an ATTEMPT has
 * been recorded. While disabled, dispatching PRIMARY SHALL NOT advance the
 * position; after the attempt is recorded, PRIMARY SHALL advance. For any step
 * with no `isTry` block, the primary action SHALL be enabled immediately.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildLessonPlan } from '../../engine/buildLessonPlan';
import {
  initLessonState,
  lessonReducer,
  isPrimaryEnabled,
  getActiveStep,
  getActiveBlocks,
  type LessonState,
} from '../lessonMachine';
import type { Lesson, LessonSection, Language } from '../../engine/types';

const LANGUAGES: Language[] = ['python', 'javascript', 'cpp'];
const KNOWN_SECTION_TYPES: LessonSection['type'][] = ['text', 'code', 'challenge', 'quiz'];

/**
 * Arbitrary for a single well-formed LessonSection covering all known types and
 * optional payload fields that drive different derivation paths (and therefore
 * differing Try / non-Try step compositions).
 */
const wellFormedSectionArb: fc.Arbitrary<LessonSection> = fc.record(
  {
    id: fc.string(),
    type: fc.constantFrom(...KNOWN_SECTION_TYPES),
    title: fc.option(fc.string(), { nil: undefined }),
    content: fc.string(),
    codeTemplate: fc.option(fc.string(), { nil: undefined }),
    expectedOutput: fc.option(fc.string(), { nil: undefined }),
    hints: fc.option(fc.array(fc.string()), { nil: undefined }),
  },
  { requiredKeys: ['id', 'type', 'content'] }
);

/** Arbitrary for a Lesson with an edge-case-rich sections array. */
const lessonArb: fc.Arbitrary<Lesson> = fc.record(
  {
    id: fc.string(),
    title: fc.string(),
    description: fc.string(),
    tier: fc.constantFrom(1, 2, 3, 4, 5),
    language: fc.constantFrom(...LANGUAGES),
    sections: fc.array(wellFormedSectionArb, { minLength: 0, maxLength: 10 }),
    xpReward: fc.integer({ min: 0, max: 500 }),
    estimatedTime: fc.integer({ min: 0, max: 120 }),
  },
  {
    requiredKeys: [
      'id',
      'title',
      'description',
      'tier',
      'language',
      'sections',
      'xpReward',
      'estimatedTime',
    ],
  }
) as fc.Arbitrary<Lesson>;

/** Place the state at a specific (phaseIndex, stepIndex) of the plan. */
function at(base: LessonState, phaseIndex: number, stepIndex: number): LessonState {
  return { ...base, phaseIndex, stepIndex };
}

describe('lessonMachine - Property-Based Tests', () => {
  // Feature: interactive-lesson-experience, Property 4: Continue gating reflects Try attempt state
  describe('Property 4: Continue gating reflects Try attempt state', () => {
    it('gates the primary action on Try-block attempts across every step of the plan', () => {
      fc.assert(
        fc.property(lessonArb, (lesson) => {
          const plan = buildLessonPlan(lesson);
          const base = initLessonState(plan);

          // Walk every step of every phase in the derived plan.
          plan.phases.forEach((phase, phaseIndex) => {
            phase.steps.forEach((_step, stepIndex) => {
              const state = at(base, phaseIndex, stepIndex);
              const blocks = getActiveBlocks(state, plan);
              const tryBlocks = blocks.filter((b) => b.isTry);

              if (tryBlocks.length === 0) {
                // No Try interaction: the primary action is enabled immediately.
                expect(isPrimaryEnabled(state, plan)).toBe(true);
                return;
              }

              // A Try interaction with no recorded attempt: disabled.
              expect(isPrimaryEnabled(state, plan)).toBe(false);

              // While disabled, PRIMARY must not move the position.
              const blocked = lessonReducer(state, { t: 'PRIMARY' }, plan);
              expect(blocked.phaseIndex).toBe(state.phaseIndex);
              expect(blocked.stepIndex).toBe(state.stepIndex);

              // Record an ATTEMPT for each Try block in the step.
              let attempted = state;
              for (const block of tryBlocks) {
                attempted = lessonReducer(
                  attempted,
                  { t: 'ATTEMPT', result: { blockId: block.id, attempted: true, correct: true } },
                  plan
                );
              }

              // Once every Try block is attempted, the primary action enables.
              expect(isPrimaryEnabled(attempted, plan)).toBe(true);

              // After the attempt, PRIMARY advances (Try steps live in the Learn
              // phase, which is never terminal, so a next position always exists).
              const advanced = lessonReducer(attempted, { t: 'PRIMARY' }, plan);
              const moved =
                advanced.phaseIndex !== attempted.phaseIndex ||
                advanced.stepIndex !== attempted.stepIndex;
              expect(moved).toBe(true);
            });
          });
        }),
        { numRuns: 100 }
      );
    });

    it('enables the primary action immediately after a partial Try attempt is missing', () => {
      // Focused check: a Try block stays gated until its own attempt is recorded,
      // even when an unrelated block has been attempted.
      fc.assert(
        fc.property(lessonArb, (lesson) => {
          const plan = buildLessonPlan(lesson);
          const base = initLessonState(plan);

          // Find the first step that has a Try block.
          for (let phaseIndex = 0; phaseIndex < plan.phases.length; phaseIndex++) {
            const steps = plan.phases[phaseIndex].steps;
            for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
              const state = at(base, phaseIndex, stepIndex);
              const tryBlock = getActiveStep(state, plan).blocks.find((b) => b.isTry);
              if (!tryBlock) {
                continue;
              }

              // Recording an attempt for an unrelated block id does not satisfy
              // the gate for this step's Try block.
              const unrelated = lessonReducer(
                state,
                { t: 'ATTEMPT', result: { blockId: `${tryBlock.id}-other`, attempted: true } },
                plan
              );
              expect(isPrimaryEnabled(unrelated, plan)).toBe(false);

              // Recording the Try block's own attempt satisfies the gate.
              const satisfied = lessonReducer(
                unrelated,
                { t: 'ATTEMPT', result: { blockId: tryBlock.id, attempted: true } },
                plan
              );
              expect(isPrimaryEnabled(satisfied, plan)).toBe(true);
              return;
            }
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
