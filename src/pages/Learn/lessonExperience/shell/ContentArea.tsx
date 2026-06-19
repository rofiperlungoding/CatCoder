/**
 * Content area (Req 3.1, 3.2). Learn / assessment phases render a comfortable
 * centered reading column (~720px); the Practice phase widens to a two-pane
 * layout (the code-task block lays out its own two panes). Renders the active
 * step's blocks through the common block contract.
 */
import React from 'react';
import type { ContentBlock, Language, PhaseId } from '../engine/types';
import type { BlockResult } from '../state/lessonMachine';
import { BlockRenderer } from '../blocks/BlockRenderer';

interface ContentAreaProps {
    phase: PhaseId;
    phaseTitle: string;
    intro?: string;
    blocks: ContentBlock[];
    language: Language;
    results: Record<string, BlockResult>;
    hintLevels: Record<string, number>;
    reducedMotion: boolean;
    captureConfidence: boolean;
    onResult: (r: BlockResult) => void;
    onRevealHint: (blockId: string) => void;
    announce: (msg: string) => void;
    banner?: React.ReactNode;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
    phase, phaseTitle, intro, blocks, language, results, hintLevels, reducedMotion, captureConfidence, onResult, onRevealHint, announce, banner,
}) => {
    const wide = phase === 'Practice';
    return (
        <div className={`mx-auto w-full px-4 lg:px-6 py-8 ${wide ? 'max-w-[1120px]' : 'max-w-[720px]'}`}>
            <div key={`${phase}-${blocks.map((b) => b.id).join(',')}`} className="cc-reveal space-y-6">
                <div>
                    <span className="cc-eyebrow">{phaseTitle}</span>
                    {intro && <p className="text-sm mt-1" style={{ color: 'var(--cc-tx-3)' }}>{intro}</p>}
                </div>

                {banner}

                <div className="space-y-6">
                    {blocks.map((block) => (
                        <BlockRenderer
                            key={block.id}
                            block={block}
                            result={results[block.id]}
                            language={language}
                            phase={phase}
                            reducedMotion={reducedMotion}
                            captureConfidence={captureConfidence}
                            hintLevel={hintLevels[block.id] ?? 0}
                            onResult={onResult}
                            onRevealHint={onRevealHint}
                            announce={announce}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContentArea;
