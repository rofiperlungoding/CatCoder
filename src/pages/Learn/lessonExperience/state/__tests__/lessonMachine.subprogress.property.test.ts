/**
 * Property-based tests for the lessonMachine stepper sub-progress selector.
 *
 * Feature: interactive-lesson-experience, Property 2: Sub-progress is always
 * well-formed.
 *
 * Validates: Requirements 1.3
 *
 * Property 2 statement: For any LessonPlan and any reachable
 * (phaseIndex, stepIndex), the stepper sub-progress returned by
 * getSubProgress SHALL satisfy `1 <= step <= total`, and `total` SHALL equal
 * the active phase's step count.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildLessonPlan } from '../../engine/buildLessonPlan';
import { getSubProgress, initLessonState } from '../lessonMachine';
import type { Lesson, LessonSection, Language } from '../../engine/types';

const LANGUAGES: Language[] = ['python', 'javascript', 'cpp'];
const KNOWN_SECTION_TYPES: LessonSection['type'][] = ['text', 'code', 'challenge', 'quiz'];

/**
 * Arbitrary for a single well-formed LessonSection covering all known types and
 * optionally-absent payload fields that drive different derivation paths.
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
 * Arbitrary for a malformed/edge-case section: unknown `type` values and
 * missing fields, exercising the engine's defensive sanitation.
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
 * mixtures of well-formed and malformed sections, and varied ordering.
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

describe('lessonMachine getSubProgress - Property-Based Tests', () => {
  /**
   * Feature: interactive-lesson-experience, Property 2: Sub-progress is always
   * well-formed.
   *
   * Validates: Requirements 1.3
   */
  describe('Property 2: Sub-progress is always well-formed', () => {
    it('satisfies 1 <= step <= total and total === active phase step count for every reachable position', () => {
      fc.assert(
        fc.property(
          lessonArb,
          // index selectors in [0,1) scaled to the plan's dimensions below.
          fc.double({ min: 0, max: 0.999999, noNaN: true }),
          fc.double({ min: 0, max: 0.999999, noNaN: true }),
          (lesson, phaseSel, stepSel) => {
            const plan = buildLessonPlan(lesson);

            // Constructively reach an arbitrary valid (phaseIndex, stepIndex):
            // every phase has >= 1 step (guaranteed by buildLessonPlan).
            const phaseIndex = Math.floor(phaseSel * plan.phases.length);
            const phase = plan.phases[phaseIndex];
            const stepIndex = Math.floor(stepSel * phase.steps.length);

            const state = { ...initLessonState(plan), phaseIndex, stepIndex };
            const { step, total } = getSubProgress(state, plan);

            // total equals the active phase's step count.
            expect(total).toBe(phase.steps.length);
            // sub-progress is well-formed: 1 <= step <= total.
            expect(step).toBeGreaterThanOrEqual(1);
            expect(step).toBeLessThanOrEqual(total);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
