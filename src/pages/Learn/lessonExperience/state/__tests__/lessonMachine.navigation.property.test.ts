/**
 * Property-based tests for {@link lessonReducer} phase/step navigation.
 *
 * Feature: interactive-lesson-experience, Property 3: Phase/step navigation is
 * monotonic and advances correctly.
 *
 * Validates: Requirements 1.4, 1.5
 *
 * Property 3 statement: For any LessonPlan, repeatedly dispatching PRIMARY from
 * the first step (with all required Try interactions marked attempted) SHALL
 * visit every step exactly once in order and advance to the next phase only
 * after the last step of the current phase, terminating in the Recap phase.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildLessonPlan } from '../../engine/buildLessonPlan';
import {
  initLessonState,
  lessonReducer,
  getActiveStep,
  getActiveBlocks,
  getActivePhaseId,
  isPrimaryEnabled,
  type LessonState,
} from '../lessonMachine';
import type { Lesson, LessonSection, Language } from '../../engine/types';

const LANGUAGES: Language[] = ['python', 'javascript', 'cpp'];
const KNOWN_SECTION_TYPES: LessonSection['type'][] = ['text', 'code', 'challenge', 'quiz'];

/**
 * Arbitrary for a single well-formed LessonSection. Covers all known types plus
 * optionally-absent payload fields that drive different derivation paths (and
 * thus produce varying numbers of steps/blocks per phase).
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

/**
 * Arbitrary for a Lesson with a sections array rich in edge cases: empty arrays
 * and varied counts/orderings of well-formed sections so that derived plans have
 * a wide range of phase/step shapes.
 */
const lessonArb: fc.Arbitrary<Lesson> = fc.record(
  {
    id: fc.string(),
    title: fc.string(),
    description: fc.string(),
    tier: fc.constantFrom(1, 2, 3, 4, 5),
    language: fc.constantFrom(...LANGUAGES),
    sections: fc.array(wellFormedSectionArb, { minLength: 0, maxLength: 12 }),
    xpReward: fc.integer({ min: 0, max: 500 }),
    estimatedTime: fc.integer({ min: 0, max: 120 }),
    prerequisites: fc.option(fc.array(fc.string()), { nil: undefined }),
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

interface Position {
  phaseIndex: number;
  stepIndex: number;
}

describe('lessonMachine navigation - Property-Based Tests', () => {
  /**
   * Feature: interactive-lesson-experience, Property 3: Phase/step navigation is
   * monotonic and advances correctly.
   *
   * Validates: Requirements 1.4, 1.5
   */
  describe('Property 3: Phase/step navigation is monotonic and advances correctly', () => {
    it('visits every step exactly once in order, terminating in Recap', () => {
      fc.assert(
        fc.property(lessonArb, (lesson) => {
          const plan = buildLessonPlan(lesson);

          // Expected linear enumeration of (phaseIndex, stepIndex) by walking
          // plan.phases in order.
          const expected: Position[] = [];
          plan.phases.forEach((phase, phaseIndex) => {
            phase.steps.forEach((_step, stepIndex) => {
              expected.push({ phaseIndex, stepIndex });
            });
          });

          // The plan always yields five non-empty phases, so there is at least
          // one step to visit.
          expect(expected.length).toBeGreaterThanOrEqual(1);

          let state: LessonState = initLessonState(plan);
          const visited: Position[] = [];

          // Generous guard: total steps plus slack. Never less than the expected
          // count so a correct reducer always completes the walk.
          const maxIterations = expected.length + 10;

          for (let i = 0; i < maxIterations; i++) {
            // testedOut must remain false so navigation visits every step.
            expect(state.testedOut).toBe(false);

            visited.push({ phaseIndex: state.phaseIndex, stepIndex: state.stepIndex });

            // Satisfy Continue gating: mark every isTry block in the active step
            // as attempted.
            const blocks = getActiveBlocks(state, plan);
            for (const block of blocks) {
              if (block.isTry) {
                state = lessonReducer(
                  state,
                  {
                    t: 'ATTEMPT',
                    result: {
                      blockId: block.id,
                      attempted: true,
                      conceptId: block.conceptId,
                    },
                  },
                  plan
                );
              }
            }

            // After attempting all Try interactions, the primary must be enabled.
            expect(isPrimaryEnabled(state, plan)).toBe(true);

            // The active step must be a real step belonging to the active phase.
            const activeStep = getActiveStep(state, plan);
            expect(activeStep.phase).toBe(getActivePhaseId(state, plan));

            const before = { phaseIndex: state.phaseIndex, stepIndex: state.stepIndex };
            state = lessonReducer(state, { t: 'PRIMARY' }, plan);
            const after = { phaseIndex: state.phaseIndex, stepIndex: state.stepIndex };

            // Terminal: PRIMARY at the last step leaves the state unchanged.
            if (after.phaseIndex === before.phaseIndex && after.stepIndex === before.stepIndex) {
              break;
            }

            // Monotonic advancement: either next step in the same phase, or the
            // first step (index 0) of the next phase.
            if (after.phaseIndex === before.phaseIndex) {
              expect(after.stepIndex).toBe(before.stepIndex + 1);
            } else {
              expect(after.phaseIndex).toBe(before.phaseIndex + 1);
              expect(after.stepIndex).toBe(0);
            }
          }

          // Visited sequence equals the full expected enumeration: every step
          // exactly once, in order.
          expect(visited).toEqual(expected);

          // Final state is at the terminal step: the Recap phase (last phase),
          // at its last step.
          const lastPhaseIndex = plan.phases.length - 1;
          const lastPhase = plan.phases[lastPhaseIndex];
          expect(getActivePhaseId(state, plan)).toBe('Recap');
          expect(state.phaseIndex).toBe(lastPhaseIndex);
          expect(state.stepIndex).toBe(lastPhase.steps.length - 1);

          // testedOut never flipped during the pure navigation walk.
          expect(state.testedOut).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});
