/**
 * Property-based tests for the lessonMachine reducer's Previous availability.
 *
 * Feature: interactive-lesson-experience, Property 5: Previous is disabled
 * exactly on the first step.
 *
 * Validates: Requirements 4.6, 4.7
 *
 * Property 5 statement: For any LessonState, canGoPrevious SHALL be false if and
 * only if the state is at the first step of the first present phase; otherwise
 * dispatching PREVIOUS SHALL move to the immediately preceding step (crossing
 * back to the previous phase's last step at a phase boundary), and at the very
 * first step PREVIOUS SHALL be a no-op.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildLessonPlan } from '../../engine/buildLessonPlan';
import { initLessonState, lessonReducer, canGoPrevious } from '../lessonMachine';
import type { LessonState } from '../lessonMachine';
import type { Lesson, LessonPlan, LessonSection, Language } from '../../engine/types';

const LANGUAGES: Language[] = ['python', 'javascript', 'cpp'];
const KNOWN_SECTION_TYPES: LessonSection['type'][] = ['text', 'code', 'challenge', 'quiz'];

/** Arbitrary for a single well-formed LessonSection covering all known types. */
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

/**
 * Independently compute the expected immediate predecessor of a position by
 * walking the plan. Returns null at the very first step of the first phase.
 */
function expectedPredecessor(pos: Position, plan: LessonPlan): Position | null {
    if (pos.stepIndex > 0) {
        return { phaseIndex: pos.phaseIndex, stepIndex: pos.stepIndex - 1 };
    }
    if (pos.phaseIndex > 0) {
        const prevPhase = plan.phases[pos.phaseIndex - 1];
        return {
            phaseIndex: pos.phaseIndex - 1,
            stepIndex: Math.max(prevPhase.steps.length - 1, 0),
        };
    }
    return null;
}

/**
 * Arbitrary producing a Lesson together with a reachable (phaseIndex, stepIndex)
 * that is valid within the derived plan. Two unit-interval seeds are mapped onto
 * the plan's actual phase/step counts so every emitted position is in range.
 */
const lessonWithPositionArb = fc
    .tuple(lessonArb, fc.double({ min: 0, max: 0.9999, noNaN: true }), fc.double({ min: 0, max: 0.9999, noNaN: true }))
    .map(([lesson, phaseSeed, stepSeed]) => {
        const plan = buildLessonPlan(lesson);
        const phaseIndex = Math.min(
            Math.floor(phaseSeed * plan.phases.length),
            plan.phases.length - 1
        );
        const stepCount = plan.phases[phaseIndex].steps.length;
        const stepIndex = Math.min(Math.floor(stepSeed * stepCount), stepCount - 1);
        return { plan, phaseIndex, stepIndex };
    });

describe('lessonMachine - Property-Based Tests', () => {
    /**
     * Feature: interactive-lesson-experience, Property 5: Previous is disabled
     * exactly on the first step.
     *
     * Validates: Requirements 4.6, 4.7
     */
    describe('Property 5: Previous is disabled exactly on the first step', () => {
        it('canGoPrevious is false iff at the first step of the first phase; PREVIOUS moves to the immediate predecessor otherwise', () => {
            fc.assert(
                fc.property(lessonWithPositionArb, ({ plan, phaseIndex, stepIndex }) => {
                    const state: LessonState = {
                        ...initLessonState(plan),
                        phaseIndex,
                        stepIndex,
                    };

                    const atFirstStep = phaseIndex === 0 && stepIndex === 0;

                    // canGoPrevious is false iff at the first step of the first phase.
                    expect(canGoPrevious(state, plan)).toBe(!atFirstStep);

                    const next = lessonReducer(state, { t: 'PREVIOUS' }, plan);

                    if (atFirstStep) {
                        // No-op at the very first step: indices are unchanged.
                        expect(next.phaseIndex).toBe(state.phaseIndex);
                        expect(next.stepIndex).toBe(state.stepIndex);
                    } else {
                        // Otherwise PREVIOUS lands on the immediate predecessor.
                        const predecessor = expectedPredecessor({ phaseIndex, stepIndex }, plan);
                        expect(predecessor).not.toBeNull();
                        expect(next.phaseIndex).toBe(predecessor!.phaseIndex);
                        expect(next.stepIndex).toBe(predecessor!.stepIndex);
                    }
                }),
                { numRuns: 100 }
            );
        });
    });
});
