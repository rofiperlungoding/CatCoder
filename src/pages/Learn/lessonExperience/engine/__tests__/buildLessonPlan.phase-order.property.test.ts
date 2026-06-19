/**
 * Property-based tests for {@link buildLessonPlan} canonical phase derivation.
 *
 * Feature: interactive-lesson-experience, Property 1: Plan always yields the
 * five phases in canonical order.
 *
 * Validates: Requirements 1.1, 1.7, 12.8
 *
 * Property 1 statement: For any Lesson (including lessons with empty or
 * arbitrary sections), buildLessonPlan SHALL produce phases whose ids equal
 * ['PreFlight','Learn','Practice','PostFlight','Recap'] in that exact order,
 * and every phase SHALL contain at least one traversable step.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildLessonPlan } from '../buildLessonPlan';
import { PHASE_ORDER } from '../types';
import type { Lesson, LessonSection, Language } from '../types';

const LANGUAGES: Language[] = ['python', 'javascript', 'cpp'];
const KNOWN_SECTION_TYPES: LessonSection['type'][] = ['text', 'code', 'challenge', 'quiz'];

/**
 * Arbitrary for a single well-formed LessonSection. Covers all known types plus
 * optionally-absent payload fields (codeTemplate, expectedOutput, title, hints)
 * that drive different derivation paths.
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
 * Arbitrary for a malformed/edge-case section: unknown `type` values and missing
 * fields. Cast through unknown because these intentionally violate the type to
 * exercise the engine's defensive sanitation.
 */
const malformedSectionArb: fc.Arbitrary<LessonSection> = fc
    .record({
        id: fc.option(fc.string(), { nil: undefined }),
        type: fc.constantFrom('unknown', 'TEXT', '', 'video', undefined),
        title: fc.option(fc.string(), { nil: undefined }),
        content: fc.option(fc.string(), { nil: undefined }),
        codeTemplate: fc.option(fc.string(), { nil: undefined }),
        expectedOutput: fc.option(fc.string(), { nil: undefined }),
    })
    .map((s) => s as unknown as LessonSection);

const sectionArb: fc.Arbitrary<LessonSection> = fc.oneof(
    { weight: 3, arbitrary: wellFormedSectionArb },
    { weight: 1, arbitrary: malformedSectionArb }
);

/**
 * Arbitrary for a Lesson with an edge-case-rich sections array: empty arrays,
 * mixtures of well-formed and malformed sections, varied ordering, and
 * sometimes-absent optional `prerequisites`.
 */
const lessonArb: fc.Arbitrary<Lesson> = fc.record(
    {
        id: fc.string(),
        title: fc.string(),
        description: fc.string(),
        tier: fc.constantFrom(1, 2, 3, 4, 5),
        language: fc.constantFrom(...LANGUAGES),
        sections: fc.array(sectionArb, { minLength: 0, maxLength: 12 }),
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

describe('buildLessonPlan - Property-Based Tests', () => {
    /**
     * Feature: interactive-lesson-experience, Property 1: Plan always yields the
     * five phases in canonical order.
     *
     * Validates: Requirements 1.1, 1.7, 12.8
     */
    describe('Property 1: Plan always yields the five phases in canonical order', () => {
        it('produces the five canonical phase ids in exact order, each with >= 1 step', () => {
            fc.assert(
                fc.property(lessonArb, (lesson) => {
                    const plan = buildLessonPlan(lesson);

                    // Phase ids equal PHASE_ORDER in exact order.
                    expect(plan.phases.map((p) => p.id)).toEqual(PHASE_ORDER);

                    // Every phase contains at least one traversable step.
                    for (const phase of plan.phases) {
                        expect(phase.steps.length).toBeGreaterThanOrEqual(1);
                    }
                }),
                { numRuns: 100 }
            );
        });

        it('holds for null/undefined and structurally malformed lessons', () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.constant({}),
                        fc.record({ sections: fc.constant(null) }),
                        fc.record({ sections: fc.constant('not-an-array') }),
                        fc.record({ sections: fc.array(fc.anything(), { maxLength: 8 }) })
                    ),
                    (malformed) => {
                        const plan = buildLessonPlan(malformed as unknown as Lesson);

                        expect(plan.phases.map((p) => p.id)).toEqual(PHASE_ORDER);
                        for (const phase of plan.phases) {
                            expect(phase.steps.length).toBeGreaterThanOrEqual(1);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
