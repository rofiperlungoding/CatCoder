/**
 * Lesson plan derivation for the interactive lesson experience engine.
 *
 * {@link buildLessonPlan} transforms the shared, persisted {@link Lesson}
 * content model into the richer runtime {@link LessonPlan} that drives the
 * five-phase interactive experience. The shared model in `src/types` is NOT
 * modified; this module derives phases, steps, and content blocks from the
 * existing `Lesson.sections` so every legacy lesson remains fully completable
 * with zero content migration.
 *
 * Derivation table (design.md):
 *
 * | LessonSection.type | Primary block type                                  | Phase placement            |
 * | ------------------ | --------------------------------------------------- | -------------------------- |
 * | text               | conceptCard (+ derived Try MCQ when none authored)  | Learn                      |
 * | code               | runnablePlayground, wrapped in predictOutput when   | Learn                      |
 * |                    | expectedOutput is present                           |                            |
 * | challenge          | codeTask (visible test from expectedOutput)         | Practice                   |
 * | quiz               | mcq                                                 | Pre_Flight (sampled) + Post_Flight |
 *
 * Totality guarantee: the function NEVER throws. Empty or malformed `sections`,
 * missing `codeTemplate`/`expectedOutput`, and unknown `type` values all fall
 * back to safe auto-generated steps. The returned plan always contains the five
 * canonical phases (in {@link PHASE_ORDER}), and every phase contains at least
 * one traversable step.
 *
 * Requirements: 1.1, 1.7, 7.1, 8.1, 9.1, 10.1, 11.1, 12.8.
 */

import { computeScaffoldLevels } from './scaffold';
import { PHASE_ORDER } from './types';
import type {
  ConceptChunk,
  ContentBlock,
  Language,
  Lesson,
  LessonPlan,
  LessonSection,
  McqOption,
  Phase,
  PhaseId,
  Step,
  VisibleTestCase,
} from './types';

/** Maximum number of diagnostic retrieval questions sampled into Pre_Flight. */
const MAX_PREFLIGHT_QUESTIONS = 3;

/** Maximum number of retrieval questions surfaced in Post_Flight. */
const MAX_POSTFLIGHT_QUESTIONS = 3;

/** Section types the engine knows how to derive directly. */
type KnownSectionType = LessonSection['type'];

/**
 * Build a complete, five-phase {@link LessonPlan} from a shared {@link Lesson}.
 *
 * The function is total and defensive: it tolerates a missing lesson, missing
 * or non-array `sections`, malformed individual sections, and unknown section
 * `type` values, always returning a plan whose phases follow {@link PHASE_ORDER}
 * and each contain at least one step.
 *
 * @param lesson The shared lesson content model (may be malformed/partial).
 * @returns A derived runtime lesson plan ready to drive the experience.
 */
export function buildLessonPlan(lesson: Lesson | null | undefined): LessonPlan {
  const lessonId = safeString((lesson as Lesson | undefined)?.id) || 'lesson';
  const language = normalizeLanguage((lesson as Lesson | undefined)?.language);
  const sections = sanitizeSections((lesson as Lesson | undefined)?.sections);

  // 1. Partition sections into learn "runs" (consecutive text/code) plus the
  //    challenge and quiz sections that drive Practice and the assessments.
  const partition = partitionSections(sections);

  // 2. Each run seeds a ConceptChunk. If a lesson has no derivable learn
  //    content, synthesize a single chunk so the Learn phase is never empty.
  const concepts = deriveConcepts(partition.runs, lesson);
  const scaffoldLevels = computeScaffoldLevels(concepts);

  // 3. Build each phase. Every builder guarantees at least one step.
  const phasesById: Record<PhaseId, Step[]> = {
    PreFlight: buildPreFlight(partition.quizzes, concepts),
    Learn: buildLearn(partition.runs, concepts, scaffoldLevels, lesson),
    Practice: buildPractice(partition.challenges, partition.runs, concepts, language),
    PostFlight: buildPostFlight(partition.quizzes, partition.challenges, concepts, language),
    Recap: buildRecap(concepts, lesson),
  };

  const phases: Phase[] = PHASE_ORDER.map((id) => ({
    id,
    steps: ensureNonEmpty(id, phasesById[id], concepts),
  }));

  return { lessonId, language, phases, concepts };
}

// ---------------------------------------------------------------------------
// Section sanitation & partitioning
// ---------------------------------------------------------------------------

/**
 * Normalize the raw sections array into a defensive list of sections, dropping
 * non-object entries and coercing missing fields to safe defaults.
 */
function sanitizeSections(raw: unknown): LessonSection[] {
  if (!Array.isArray(raw)) return [];
  const result: LessonSection[] = [];
  raw.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const section = entry as Partial<LessonSection>;
    result.push({
      id: safeString(section.id) || `section-${index}`,
      type: section.type as LessonSection['type'],
      title: typeof section.title === 'string' ? section.title : undefined,
      content: safeString(section.content),
      codeTemplate: typeof section.codeTemplate === 'string' ? section.codeTemplate : undefined,
      expectedOutput:
        typeof section.expectedOutput === 'string' ? section.expectedOutput : undefined,
      hints: Array.isArray(section.hints)
        ? section.hints.filter((h): h is string => typeof h === 'string')
        : undefined,
    });
  });
  return result;
}

interface SectionPartition {
  /** Runs of consecutive learn-style (text/code/unknown) sections. */
  runs: LessonSection[][];
  /** Challenge sections that drive the Practice phase. */
  challenges: LessonSection[];
  /** Quiz sections that drive the Pre_Flight/Post_Flight assessments. */
  quizzes: LessonSection[];
}

/**
 * Partition sections into learn runs, challenges, and quizzes. A run is a
 * maximal sequence of consecutive learn-style sections; challenge/quiz sections
 * break runs. Unknown `type` values are treated as learn-style (text fallback).
 */
function partitionSections(sections: LessonSection[]): SectionPartition {
  const runs: LessonSection[][] = [];
  const challenges: LessonSection[] = [];
  const quizzes: LessonSection[] = [];
  let current: LessonSection[] = [];

  const flush = () => {
    if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  };

  for (const section of sections) {
    const type = section.type;
    if (type === 'challenge') {
      flush();
      challenges.push(section);
    } else if (type === 'quiz') {
      flush();
      quizzes.push(section);
    } else {
      // 'text', 'code', and any unknown/missing type fall back to learn-style.
      current.push(section);
    }
  }
  flush();

  return { runs, challenges, quizzes };
}

/**
 * Derive concept chunks from learn runs. Always returns at least one chunk so
 * the Learn phase has stable concept identity even for content-light lessons.
 */
function deriveConcepts(
  runs: LessonSection[][],
  lesson: Lesson | null | undefined
): ConceptChunk[] {
  if (runs.length === 0) {
    return [
      {
        id: 'concept-0',
        title: safeString((lesson as Lesson | undefined)?.title) || 'Key concepts',
        order: 0,
      },
    ];
  }
  return runs.map((run, index) => ({
    id: `concept-${index}`,
    title: runTitle(run, index),
    order: index,
  }));
}

// ---------------------------------------------------------------------------
// Phase builders
// ---------------------------------------------------------------------------

/**
 * Pre_Flight: up to {@link MAX_PREFLIGHT_QUESTIONS} low-stakes retrieval
 * questions sampled from quiz sections, or auto-generated recall prompts from
 * concept titles when no quizzes exist. Never XP-deducting.
 */
function buildPreFlight(quizzes: LessonSection[], concepts: ConceptChunk[]): Step[] {
  const steps: Step[] = [];

  if (quizzes.length > 0) {
    quizzes.slice(0, MAX_PREFLIGHT_QUESTIONS).forEach((quiz, index) => {
      const concept = concepts[index % concepts.length];
      const stepId = `preflight-step-${index}`;
      steps.push({
        id: stepId,
        phase: 'PreFlight',
        conceptId: concept.id,
        blocks: [makeMcqBlock(`${stepId}-mcq`, quiz, concept.id, false)],
      });
    });
  } else {
    concepts.slice(0, MAX_PREFLIGHT_QUESTIONS).forEach((concept, index) => {
      const stepId = `preflight-step-${index}`;
      steps.push({
        id: stepId,
        phase: 'PreFlight',
        conceptId: concept.id,
        blocks: [makeRecallMcqBlock(`${stepId}-mcq`, concept, false)],
      });
    });
  }

  return steps;
}

/**
 * Learn: for each concept chunk emit a Show step (concept cards / runnable or
 * predict-output playgrounds) and a mandatory Try step (a gating MCQ). The
 * Prove feedback is rendered inline by the Try block. Scaffolding is faded by
 * concept order.
 */
function buildLearn(
  runs: LessonSection[][],
  concepts: ConceptChunk[],
  scaffoldLevels: number[],
  lesson: Lesson | null | undefined
): Step[] {
  const steps: Step[] = [];

  if (runs.length === 0) {
    // Content-light lesson: synthesize a Show card from the lesson description
    // and a Try check so the Learn phase is still a full Show -> Try loop.
    const concept = concepts[0];
    const scaffold = scaffoldLevels[0] ?? 0;
    const description =
      safeString((lesson as Lesson | undefined)?.description) ||
      'Review the key ideas for this lesson.';
    steps.push({
      id: 'learn-step-0-show',
      phase: 'Learn',
      conceptId: concept.id,
      blocks: [
        {
          id: 'learn-step-0-show-b0',
          type: 'conceptCard',
          conceptId: concept.id,
          scaffoldLevel: scaffold,
          content: description,
        },
      ],
    });
    steps.push(makeTryStep('learn-step-0-try', concept, scaffold));
    return steps;
  }

  runs.forEach((run, chunkIndex) => {
    const concept = concepts[chunkIndex];
    const scaffold = scaffoldLevels[chunkIndex] ?? chunkIndex;

    // Chunking (active learning, no wall of text): each section becomes its own
    // Show step, so every screen is a single concept card or a single runnable
    // example the learner can digest in ~30–60s.
    run.forEach((section, sectionIndex) => {
      const showStepId = `learn-step-${chunkIndex}-${sectionIndex}-show`;
      const block = makeShowBlock(`${showStepId}-b0`, section, concept.id, scaffold);
      // Runnable examples are active Try beats: the learner must predict/run
      // before continuing (Show → Try → Prove woven into every code sample).
      if (block.type === 'predictOutput' || block.type === 'runnablePlayground') {
        block.isTry = true;
      }
      steps.push({ id: showStepId, phase: 'Learn', conceptId: concept.id, blocks: [block] });
    });

    // Each concept chunk closes with a mandatory retrieval Try (gated Continue).
    steps.push(makeTryStep(`learn-step-${chunkIndex}-try`, concept, scaffold));
  });

  return steps;
}

/**
 * Practice ("the Build"): a single codeTask seeded from the first challenge
 * section, falling back to the last code section, then to a fully synthesized
 * task. Visible tests are derived from `expectedOutput` when present.
 */
function buildPractice(
  challenges: LessonSection[],
  runs: LessonSection[][],
  concepts: ConceptChunk[],
  language: Language
): Step[] {
  const source = challenges[0] ?? lastCodeSection(runs);
  const concept = concepts[concepts.length - 1];
  const stepId = 'practice-step-0';

  const code =
    safeString(source?.codeTemplate) || safeString(source?.content) || defaultStarter(language);
  const tests = makeVisibleTests(`${stepId}-test`, source?.expectedOutput);
  const prompt =
    safeString(source?.content) ||
    safeString(source?.title) ||
    'Apply what you learned to complete this task.';

  const block: ContentBlock = {
    id: `${stepId}-task`,
    type: 'codeTask',
    conceptId: concept.id,
    content: prompt,
    code,
    expectedOutput: source?.expectedOutput,
    tests,
  };

  return [{ id: stepId, phase: 'Practice', conceptId: concept.id, blocks: [block] }];
}

/**
 * Post_Flight: retrieval questions (reused from quizzes or derived from concept
 * titles) followed by exactly one transfer task (a codeTask derived from a
 * challenge/code section, or a reflection prompt fallback).
 */
function buildPostFlight(
  quizzes: LessonSection[],
  challenges: LessonSection[],
  concepts: ConceptChunk[],
  language: Language
): Step[] {
  const steps: Step[] = [];

  if (quizzes.length > 0) {
    quizzes.slice(0, MAX_POSTFLIGHT_QUESTIONS).forEach((quiz, index) => {
      const concept = concepts[index % concepts.length];
      const stepId = `postflight-step-${index}`;
      steps.push({
        id: stepId,
        phase: 'PostFlight',
        conceptId: concept.id,
        blocks: [makeMcqBlock(`${stepId}-mcq`, quiz, concept.id, false)],
      });
    });
  } else {
    concepts.slice(0, MAX_POSTFLIGHT_QUESTIONS).forEach((concept, index) => {
      const stepId = `postflight-step-${index}`;
      steps.push({
        id: stepId,
        phase: 'PostFlight',
        conceptId: concept.id,
        blocks: [makeRecallMcqBlock(`${stepId}-mcq`, concept, false)],
      });
    });
  }

  // Exactly one transfer task closes the Post_Flight phase.
  const transferConcept = concepts[concepts.length - 1];
  const transferSource = challenges[0] ?? null;
  const transferStepId = `postflight-transfer`;
  const transferCode = safeString(transferSource?.codeTemplate) || defaultStarter(language);
  steps.push({
    id: transferStepId,
    phase: 'PostFlight',
    conceptId: transferConcept.id,
    blocks: [
      {
        id: `${transferStepId}-task`,
        type: 'codeTask',
        conceptId: transferConcept.id,
        content:
          safeString(transferSource?.content) ||
          'Transfer task: apply this concept to a new problem.',
        code: transferCode,
        expectedOutput: transferSource?.expectedOutput,
        tests: makeVisibleTests(`${transferStepId}-test`, transferSource?.expectedOutput),
      },
    ],
  });

  return steps;
}

/**
 * Recap: a single recap block listing the lesson's takeaways (concept titles).
 */
function buildRecap(concepts: ConceptChunk[], lesson: Lesson | null | undefined): Step[] {
  const takeaways = concepts.map((concept) => concept.title);
  const stepId = 'recap-step-0';
  return [
    {
      id: stepId,
      phase: 'Recap',
      blocks: [
        {
          id: `${stepId}-recap`,
          type: 'recap',
          content:
            safeString((lesson as Lesson | undefined)?.title) || 'Lesson recap',
          takeaways: takeaways.length > 0 ? takeaways : ['You completed this lesson.'],
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Block factories
// ---------------------------------------------------------------------------

/**
 * Build a Show block for a learn-style section: a runnable playground (wrapped
 * as predictOutput when an expected output is available) for `code` sections,
 * otherwise a concept card. Unknown/missing types fall back to a concept card.
 */
function makeShowBlock(
  id: string,
  section: LessonSection,
  conceptId: string,
  scaffoldLevel: number
): ContentBlock {
  if (section.type === 'code') {
    const code = safeString(section.codeTemplate) || safeString(section.content);
    if (section.expectedOutput) {
      return {
        id,
        type: 'predictOutput',
        conceptId,
        scaffoldLevel,
        code,
        expectedOutput: section.expectedOutput,
        content: safeString(section.content),
      };
    }
    return {
      id,
      type: 'runnablePlayground',
      conceptId,
      scaffoldLevel,
      code,
      content: safeString(section.content),
    };
  }

  // 'text' and any unknown/missing type render as a concept card.
  return {
    id,
    type: 'conceptCard',
    conceptId,
    scaffoldLevel,
    content: safeString(section.content) || safeString(section.title) || 'Concept',
  };
}

/**
 * Build a mandatory Try step (gating MCQ) for a concept chunk. The Try block is
 * marked `isTry` so the reducer can gate Continue until it is attempted.
 */
function makeTryStep(stepId: string, concept: ConceptChunk, scaffoldLevel: number): Step {
  return {
    id: stepId,
    phase: 'Learn',
    conceptId: concept.id,
    blocks: [makeRecallMcqBlock(`${stepId}-mcq`, concept, true, scaffoldLevel)],
  };
}

/**
 * Build an MCQ block from a quiz section. Because the shared `LessonSection`
 * model carries no structured options, options are auto-generated as a
 * low-stakes self-check; the quiz `content` seeds the prompt.
 */
function makeMcqBlock(
  id: string,
  quiz: LessonSection,
  conceptId: string,
  isTry: boolean
): ContentBlock {
  const prompt = safeString(quiz.content) || safeString(quiz.title) || 'Quick check';
  return {
    id,
    type: 'mcq',
    conceptId,
    content: prompt,
    options: makeSelfCheckOptions(id),
    isTry: isTry || undefined,
  };
}

/**
 * Build a lightweight recall MCQ derived from a concept's title (used when no
 * authored quiz exists).
 */
function makeRecallMcqBlock(
  id: string,
  concept: ConceptChunk,
  isTry: boolean,
  scaffoldLevel?: number
): ContentBlock {
  return {
    id,
    type: 'mcq',
    conceptId: concept.id,
    scaffoldLevel,
    content: `Do you recall: ${concept.title}?`,
    options: makeSelfCheckOptions(id),
    isTry: isTry || undefined,
  };
}

/**
 * Generate the auto-derived, low-stakes self-check options used when authored
 * answer data is unavailable. Always includes exactly one correct option.
 */
function makeSelfCheckOptions(idSeed: string): McqOption[] {
  return [
    {
      id: `${idSeed}-opt-0`,
      label: 'Yes — I understand this',
      correct: true,
      explanation: 'Great — this concept is clear to you.',
    },
    {
      id: `${idSeed}-opt-1`,
      label: 'Not yet — I need a refresher',
      correct: false,
      explanation: 'No problem — revisit the worked example and try again.',
    },
  ];
}

/**
 * Derive visible test cases from a section's expected output. Returns an empty
 * array when no expected output is available (an observation-only task).
 */
function makeVisibleTests(idSeed: string, expectedOutput?: string): VisibleTestCase[] {
  if (typeof expectedOutput === 'string' && expectedOutput.length > 0) {
    return [{ id: `${idSeed}-0`, expectedOutput }];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Guarantee a phase has at least one traversable step. If a builder produced no
 * steps, synthesize a safe auto-generated step appropriate to the phase.
 */
function ensureNonEmpty(phase: PhaseId, steps: Step[], concepts: ConceptChunk[]): Step[] {
  if (steps.length > 0) return steps;

  const conceptId = concepts[0]?.id;
  const stepId = `${phase.toLowerCase()}-fallback-0`;
  const block = makeFallbackBlock(`${stepId}-b0`, phase, concepts, conceptId);
  return [{ id: stepId, phase, conceptId, blocks: [block] }];
}

/**
 * Produce a safe, traversable fallback block for an otherwise-empty phase.
 */
function makeFallbackBlock(
  id: string,
  phase: PhaseId,
  concepts: ConceptChunk[],
  conceptId: string | undefined
): ContentBlock {
  switch (phase) {
    case 'PreFlight':
    case 'PostFlight':
      return {
        id,
        type: 'mcq',
        conceptId,
        content: 'Quick check: are you ready to continue?',
        options: makeSelfCheckOptions(id),
      };
    case 'Practice':
      return {
        id,
        type: 'codeTask',
        conceptId,
        content: 'Practice: write code that runs successfully.',
        code: '',
        tests: [],
      };
    case 'Recap':
      return {
        id,
        type: 'recap',
        content: 'Lesson recap',
        takeaways: concepts.map((c) => c.title),
      };
    case 'Learn':
    default:
      return {
        id,
        type: 'conceptCard',
        conceptId,
        scaffoldLevel: 0,
        content: 'Review the key ideas for this lesson.',
      };
  }
}

/** Derive a stable title for a learn run / concept chunk. */
function runTitle(run: LessonSection[], index: number): string {
  for (const section of run) {
    const title = safeString(section.title);
    if (title) return title;
  }
  return `Concept ${index + 1}`;
}

/** Find the last code section across all learn runs, if any. */
function lastCodeSection(runs: LessonSection[][]): LessonSection | null {
  for (let r = runs.length - 1; r >= 0; r -= 1) {
    const run = runs[r];
    for (let s = run.length - 1; s >= 0; s -= 1) {
      if (run[s].type === 'code') return run[s];
    }
  }
  return null;
}

/** Coerce an unknown value to a trimmed-safe string ('' for non-strings). */
function safeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Normalize a possibly-malformed language to a supported {@link Language}. */
function normalizeLanguage(value: unknown): Language {
  if (value === 'python' || value === 'javascript' || value === 'cpp') return value;
  return 'python';
}

/** Minimal default starter code per supported language. */
function defaultStarter(language: Language): string {
  switch (language) {
    case 'javascript':
      return '// Write your solution here\n';
    case 'cpp':
      return '#include <iostream>\nint main() {\n  // Write your solution here\n  return 0;\n}\n';
    case 'python':
    default:
      return '# Write your solution here\n';
  }
}

// Referenced to keep the known-type alias meaningful for future maintainers.
export type { KnownSectionType };
