/**
 * Reflection prompt (Req 12.7) — captures a single-line metacognitive response.
 * Attempting (any non-empty response) marks the Try as attempted so Continue
 * unlocks; there is no right/wrong answer.
 */
import { Idea01Icon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { Icon } from '../../../../components/ui';
import type { BlockComponentProps } from './blockContract';

export const ReflectionPrompt: React.FC<BlockComponentProps> = ({ block, result, onResult, announce }) => {
    const saved = result?.attempted ?? false;
    const [text, setText] = useState('');

    const save = () => {
        if (!text.trim()) return;
        onResult({ blockId: block.id, attempted: true, correct: true, conceptId: block.conceptId });
        announce?.('Reflection saved.');
    };

    return (
        <div className="cc-reveal cc-card cc-e1 p-5 space-y-3">
            <div className="flex items-center gap-2">
                <span style={{ color: 'var(--cc-tle)' }}><Icon icon={Idea01Icon} size={18} aria-hidden="true" /></span>
                <span className="cc-eyebrow">Reflect</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--cc-tx-1)' }}>
                {block.content || 'Explain in one line why this works.'}
            </p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={saved}
                rows={2}
                aria-label="Your reflection"
                placeholder="In your own words…"
                className="w-full rounded-xl p-3 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                style={{ background: 'var(--cc-surface-1)', border: '1px solid var(--cc-border)', color: 'var(--cc-tx-1)' }}
            />
            {saved ? (
                <p className="text-xs" style={{ color: 'var(--cc-ac)' }}>Saved — there's no wrong answer here.</p>
            ) : (
                <button type="button" onClick={save} disabled={!text.trim()} className="cc-btn cc-btn-secondary h-9 px-4 text-sm disabled:opacity-50">
                    Save reflection
                </button>
            )}
        </div>
    );
};

export default ReflectionPrompt;
