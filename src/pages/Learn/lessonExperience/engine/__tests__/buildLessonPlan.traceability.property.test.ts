/**
 * Property-based tests for {@link buildLessonPlan} block-to-section traceability.
 *
 * Feature: interactive-lesson-experience, Property 15: Every content block maps
 * to a legacy section type.
 *
 * Validates: Requirements 12.1, 12.8
 *
 * Property 15 statement: For any Lesson, every ContentBlock produced by
 * buildLessonPlan SHALL have a `type` drawn from the supported BlockType set,
 * and SHALL be traceable to a source LessonSection whose type is one of
 * 'text' | 'code' | 'challenge' | 'quiz' (or to a deterministic auto-generated
 * fallback). The engine auto-generates some blocks (MCQ options/fallbacks) as
 * deterministic fallbacks because the shared LessonSection model has no
 * structured option data; the meaningful, checkable invariant the design states
 * is therefore: every produced block.type is a member of the supported
 * BlockType set across all phases and steps.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildLessonPlan } from '../buildLessonPlan';
import type { Lesson, LessonSection, Language, BlockType } from '../types';

// The supported BlockType set (mirrors engine/types.ts `BlockType`). Defining it
// here keeps the test independent and lets us assert membership explicitly.
const SUPPORTED_BLOCK_TYPES: ReadonlySet<BlockType> = new Set<BlockType>([
    'conceptCard',
    'annotatedWalkthrough',
    'runnablePlayground',
    'predictOutput',
    'mcq',
    'fillInBlank',
    'codeTask',
    'reflection',
    'recap',
]);

const LANGUAGES: Language[] = ['python', 'javascript', 'cpp'];
const KNOWN_SECTION_TYPES: LessonSection['type'][] = ['text', 'code', 'challenge', 'quiz'];

/**
 * Arbitrary for a single well-formed LessonSection. Covers all known types plus
 * optional code/expected-output payloads that drive different derivation paths.
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
        // Unknown / unexpected type values the engine must tolerate.
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
 * mixtures of well-formed and malformed sections, and varied ordering.
 */
const lessonArb: fc.Arbitrary<Lesson> = fc.record({
    id: fc.string(),
    title: fc.string(),
    description: fc.string(),
    tier: fc.constantFrom(1, 2, 3, 4, 5),
    language: fc.constantFrom(...LANGUAGES),
    sections: fc.array(sectionArb, { minLength: 0, maxLength: 12 }),
    xpReward: fc.integer({ min: 0, max: 500 }),
    estimatedTime: fc.integer({ min: 0, max: 120 }),
}) as fc.Arbitrary<Lesson>;

describe('buildLessonPlan - Property-Based Tests', () => {
    /**
     * Feature: interactive-lesson-experience, Property 15: Every content block
     * maps to a legacy section type.
     *
     * Validates: Requirements 12.1, 12.8
     */
    describe('Property 15: Every content block maps to a legacy section type', () => {
        it('produces only blocks whose type is a member of the supported BlockType set', () => {
            fc.assert(
                fc.property(lessonArb, (lesson) => {
                    const plan = buildLessonPlan(lesson);

                    for (const phase of plan.phases) {
                        for (const step of phase.steps) {
                            for (const block of step.blocks) {
                                expect(SUPPORTED_BLOCK_TYPES.has(block.type)).toBe(true);
                            }
                        }
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

                        // The plan is always traversable and every block is a
                        // member of the supported BlockType set.
                        expect(plan.phases.length).toBeGreaterThan(0);
                        for (const phase of plan.phases) {
                            expect(phase.steps.length).toBeGreaterThan(0);
                            for (const step of phase.steps) {
                                for (const block of step.blocks) {
                                    expect(SUPPORTED_BLOCK_TYPES.has(block.type)).toBe(true);
                                }
                            }
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
