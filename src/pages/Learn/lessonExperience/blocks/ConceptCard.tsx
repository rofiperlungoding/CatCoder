/**
 * Concept card — calm, readable prose in a comfortable reading column
 * (Req 12.2). Dual-coding affordance: an optional decorative concept glyph.
 */
import React from 'react';
import MarkdownContent from '../../../../components/ui/MarkdownContent';
import type { BlockComponentProps } from './blockContract';

export const ConceptCard: React.FC<BlockComponentProps> = ({ block }) => {
    return (
        <article className="cc-reveal">
            <div
                className="prose prose-invert max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-p:leading-relaxed prose-strong:text-foreground"
                style={{ color: 'var(--cc-tx-2)' }}
            >
                <MarkdownContent content={block.content ?? ''} />
            </div>
        </article>
    );
};

export default ConceptCard;
