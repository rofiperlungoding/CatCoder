/**
 * Common contract every Content_Block component conforms to so the shell can
 * render and gate them uniformly (design: "Content block interface").
 */
import type { ContentBlock, Language } from '../engine/types';
import type { BlockResult } from '../state/lessonMachine';
import type { PhaseId } from '../engine/types';

export type { BlockResult };

export interface BlockComponentProps<B extends ContentBlock = ContentBlock> {
    block: B;
    /** Prior attempt for this block (resumable across navigation). */
    result: BlockResult | undefined;
    language: Language;
    /** The phase the block is rendered in (used for distinct, non-duplicated labels). */
    phase?: PhaseId;
    /** Block reports its attempt/outcome upward. */
    onResult: (r: BlockResult) => void;
    /** Whether the user prefers reduced motion (instant states). */
    reducedMotion: boolean;
    /** Push a message to the single polite live region. */
    announce?: (msg: string) => void;
    /** Revealed assistance level for code tasks (0..4). */
    hintLevel?: number;
    /** Request the next progressive hint level for a code task. */
    onRevealHint?: (blockId: string) => void;
    /** When true (Post_Flight), assessable blocks capture a confidence rating. */
    captureConfidence?: boolean;
}
