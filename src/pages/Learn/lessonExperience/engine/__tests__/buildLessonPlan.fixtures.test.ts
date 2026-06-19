/**
 * Example-based unit tests for {@link buildLessonPlan}.
 *
 * These fixtures complement the property-based tests by pinning the derivation
 * behavior for four concrete, representative lessons:
 *
 *   1. An all-`text` legacy lesson (the most common existing content shape).
 *   2. A code-heavy lesson mixing `code` sections with and without expected output.
 *   3. A quiz-bearing lesson whose `quiz` sections drive the assessments.
 *   4. An empty-sections lesson that exercises the totality/fallback guarantees.
 *
 * They assert that the derived {@link LessonPlan} is sensible: phases follow the
 * canonical {@link PHASE_ORDER}, every phase is traversable, and blocks map to
 * the expected types per the design's derivation table.
 *
 * Validates: Requirements 1.7, 12.8
 */

import { describe, expect, it } from 'vitest';
import { buildLessonPlan } from '../buildLessonPlan';
import { PHASE_ORDER } from '../types';
import type { BlockType, ContentBlock, Lesson, LessonPlan, LessonSection, PhaseId } from '../types';

/** Build a Lesson with sensible defaults, overriding only what a fixture needs. */
function makeLesson(overrides: Partial<Lesson> & { sections: LessonSection[] }): Lesson {
  return {
    id: 'lesson-fixture',
    title: 'Fixture Lesson',
    description: 'A lesson used by the buildLessonPlan fixtures.',
    tier: 1,
    language: 'python',
    xpReward: 50,
    estimatedTime: 10,
    ...overrides,
  };
}

/** Return the phase with the given id (phases are guaranteed present). */
function phase(plan: LessonPlan, id: PhaseId) {
  const found = plan.phases.find((p) => p.id === id);
  expect(found, `phase ${id} should be present`).toBeDefined();
  return found!;
}

/** Flatten every content block within a phase into a single array. */
function blocksOf(plan: LessonPlan, id: PhaseId): ContentBlock[] {
  return phase(plan, id).steps.flatMap((step) => step.blocks);
}

/** Collect the distinct block types present within a phase. */
function blockTypesOf(plan: LessonPlan, id: PhaseId): Set<BlockType> {
  return new Set(blocksOf(plan, id).map((block) => block.type));
}

describe('buildLessonPlan fixtures', () => {
  describe('all-text legacy lesson', () => {
    const lesson = makeLesson({
      id: 'all-text',
      sections: [
        { id: 's0', type: 'text', title: 'Variables', content: 'A variable stores a value.' },
        { id: 's1', type: 'text', title: 'Types', content: 'Values have types.' },
        { id: 's2', type: 'text', title: 'Operators', content: 'Operators combine values.' },
      ],
    });
    const plan = buildLessonPlan(lesson);

    it('yields the five phases in canonical order', () => {
      expect(plan.phases.map((p) => p.id)).toEqual(PHASE_ORDER);
    });

    it('gives every phase at least one traversable step', () => {
      for (const p of plan.phases) {
        expect(p.steps.length).toBeGreaterThanOrEqual(1);
        for (const step of p.steps) {
          expect(step.blocks.length).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('builds Learn as Show + Try steps with a gating Try interaction', () => {
      const learn = phase(plan, 'Learn');
      const showSteps = learn.steps.filter((s) => s.id.endsWith('-show'));
      const trySteps = learn.steps.filter((s) => s.id.endsWith('-try'));

      expect(showSteps.length).toBeGreaterThanOrEqual(1);
      expect(trySteps.length).toBeGreaterThanOrEqual(1);

      // Show steps render the text sections as concept cards.
      expect(showSteps[0].blocks.every((b) => b.type === 'conceptCard')).toBe(true);

      // Every Try step carries exactly the mandatory, attempt-gated MCQ.
      for (const tryStep of trySteps) {
        expect(tryStep.blocks).toHaveLength(1);
        expect(tryStep.blocks[0].type).toBe('mcq');
        expect(tryStep.blocks[0].isTry).toBe(true);
      }
    });

    it('derives concepts from the consecutive text run', () => {
      // Consecutive text sections form a single learn run -> a single concept,
      // seeded from the run's first title.
      expect(plan.concepts).toHaveLength(1);
      expect(plan.concepts[0].title).toBe('Variables');
      expect(plan.concepts[0].order).toBe(0);
    });
  });

  describe('code-heavy lesson', () => {
    const lesson = makeLesson({
      id: 'code-heavy',
      language: 'javascript',
      sections: [
        {
          id: 'c0',
          type: 'code',
          title: 'Logging',
          content: 'Print a greeting.',
          codeTemplate: 'console.log("hi");',
          expectedOutput: 'hi',
        },
        {
          id: 'c1',
          type: 'code',
          title: 'Playground',
          content: 'Experiment freely.',
          codeTemplate: 'let x = 1 + 1;',
        },
        {
          id: 'c2',
          type: 'code',
          title: 'Sum',
          content: 'Add two numbers.',
          codeTemplate: 'console.log(2 + 3);',
          expectedOutput: '5',
        },
      ],
    });
    const plan = buildLessonPlan(lesson);

    it('keeps the canonical phase order', () => {
      expect(plan.phases.map((p) => p.id)).toEqual(PHASE_ORDER);
    });

    it('maps code sections with expectedOutput to predictOutput blocks', () => {
      const predicts = blocksOf(plan, 'Learn').filter((b) => b.type === 'predictOutput');
      // Two code sections carry expectedOutput ('hi' and '5').
      expect(predicts).toHaveLength(2);
      expect(predicts.map((b) => b.expectedOutput)).toEqual(['hi', '5']);
    });

    it('maps code sections without expectedOutput to runnablePlayground blocks', () => {
      const playgrounds = blocksOf(plan, 'Learn').filter((b) => b.type === 'runnablePlayground');
      // Exactly the one code section lacking expectedOutput.
      expect(playgrounds).toHaveLength(1);
      expect(playgrounds[0].expectedOutput).toBeUndefined();
    });

    it('produces a Practice codeTask', () => {
      const practiceBlocks = blocksOf(plan, 'Practice');
      const codeTasks = practiceBlocks.filter((b) => b.type === 'codeTask');
      expect(codeTasks.length).toBeGreaterThanOrEqual(1);
      // Seeded from the last code section (no challenge present).
      expect(codeTasks[0].code).toBeTruthy();
    });
  });

  describe('quiz-bearing lesson', () => {
    const lesson = makeLesson({
      id: 'quiz-bearing',
      sections: [
        { id: 't0', type: 'text', title: 'Intro', content: 'Some reading.' },
        { id: 'q0', type: 'quiz', title: 'Check 1', content: 'What is a variable?' },
        { id: 'q1', type: 'quiz', title: 'Check 2', content: 'What is a type?' },
      ],
    });
    const plan = buildLessonPlan(lesson);

    it('keeps the canonical phase order', () => {
      expect(plan.phases.map((p) => p.id)).toEqual(PHASE_ORDER);
    });

    it('samples quiz sections into PreFlight as mcq blocks', () => {
      const preFlight = phase(plan, 'PreFlight');
      const mcqs = blocksOf(plan, 'PreFlight').filter((b) => b.type === 'mcq');
      expect(preFlight.steps.length).toBeGreaterThanOrEqual(1);
      // Two quiz sections -> two sampled retrieval questions.
      expect(mcqs).toHaveLength(2);
    });

    it('surfaces quiz-derived mcq blocks in PostFlight', () => {
      const types = blockTypesOf(plan, 'PostFlight');
      expect(types.has('mcq')).toBe(true);
      const mcqs = blocksOf(plan, 'PostFlight').filter((b) => b.type === 'mcq');
      expect(mcqs).toHaveLength(2);
    });
  });

  describe('empty-sections lesson', () => {
    const lesson = makeLesson({ id: 'empty', sections: [] });

    it('does not throw and returns the five canonical phases', () => {
      let plan: LessonPlan | undefined;
      expect(() => {
        plan = buildLessonPlan(lesson);
      }).not.toThrow();
      expect(plan!.phases.map((p) => p.id)).toEqual(PHASE_ORDER);
    });

    it('gives every phase at least one traversable fallback step', () => {
      const plan = buildLessonPlan(lesson);
      for (const p of plan.phases) {
        expect(p.steps.length).toBeGreaterThanOrEqual(1);
        for (const step of p.steps) {
          expect(step.blocks.length).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('synthesizes at least one concept chunk', () => {
      const plan = buildLessonPlan(lesson);
      expect(plan.concepts.length).toBeGreaterThanOrEqual(1);
    });
  });
});
