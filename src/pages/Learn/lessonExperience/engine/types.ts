/**
 * Core type definitions for the interactive lesson experience engine.
 *
 * This module defines the runtime "lesson plan" model that the engine builds
 * from the shared, persisted {@link Lesson} content model. The shared model in
 * `src/types` is intentionally NOT modified; instead the engine derives a richer
 * phase/step/block structure used to drive the interactive experience.
 *
 * Requirements: 12.1 (engine module structure), 18.5 (reuse shared lesson model).
 */

import type { Language } from '../../../../types';

// Re-export the reused shared content types without modifying the shared model.
export type { Lesson, LessonSection, Language } from '../../../../types';

/**
 * Ordered phases of the interactive lesson experience.
 */
export type PhaseId = 'PreFlight' | 'Learn' | 'Practice' | 'PostFlight' | 'Recap';

/**
 * Canonical ordering of phases. The engine advances through phases in this order.
 */
export const PHASE_ORDER: PhaseId[] = ['PreFlight', 'Learn', 'Practice', 'PostFlight', 'Recap'];

/**
 * The set of interactive content block types a step can render.
 */
export type BlockType =
  | 'conceptCard'
  | 'annotatedWalkthrough'
  | 'runnablePlayground'
  | 'predictOutput'
  | 'mcq'
  | 'fillInBlank'
  | 'codeTask'
  | 'reflection'
  | 'recap';

/**
 * Learner self-reported confidence rating used in reflection/recap phases.
 */
export type ConfidenceRating = 'low' | 'medium' | 'high';

/**
 * A single concept unit a lesson is decomposed into. Concepts give the engine a
 * stable identity for tracking mastery across blocks.
 */
export interface ConceptChunk {
  id: string;
  title: string;
  order: number;
}

/**
 * A selectable option for a multiple-choice question block.
 */
export interface McqOption {
  id: string;
  label: string;
  correct: boolean;
  explanation: string;
}

/**
 * A single fill-in-the-blank token with its expected answer.
 */
export interface BlankToken {
  id: string;
  expected: string;
}

/**
 * A visible (non-hidden) test case shown to the learner for a code task.
 */
export interface VisibleTestCase {
  id: string;
  input?: string;
  expectedOutput: string;
}

/**
 * A single interactive content block. Optional payload fields are populated
 * based on the block {@link BlockType}; only the fields relevant to a given
 * type are expected to be present.
 */
export interface ContentBlock {
  id: string;
  type: BlockType;
  conceptId?: string;
  scaffoldLevel?: number;
  content?: string;
  code?: string;
  expectedOutput?: string;
  options?: McqOption[];
  blanks?: BlankToken[];
  tests?: VisibleTestCase[];
  takeaways?: string[];
  isTry?: boolean;
}

/**
 * A step groups one or more content blocks within a phase.
 */
export interface Step {
  id: string;
  phase: PhaseId;
  blocks: ContentBlock[];
  conceptId?: string;
}

/**
 * A phase groups the steps that belong to a single {@link PhaseId}.
 */
export interface Phase {
  id: PhaseId;
  steps: Step[];
}

/**
 * The runtime lesson plan derived from a shared {@link Lesson}. This is the
 * primary structure consumed by the interactive lesson experience engine.
 */
export interface LessonPlan {
  lessonId: string;
  language: Language;
  phases: Phase[];
  concepts: ConceptChunk[];
}
