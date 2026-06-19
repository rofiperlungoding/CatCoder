/**
 * Fill-in-the-blank code (Req 12.6). Splits the code template on `___`
 * placeholders and interleaves typeable inputs; validates the completed
 * template against expected tokens and reports correctness.
 */
import React, { useMemo, useState } from 'react';
import { buildFeedback } from '../engine/feedback';
import type { BlankToken } from '../engine/types';
import { Feedback } from './Feedback';
import type { BlockComponentProps } from './blockContract';

const PLACEHOLDER = /_{3,}/g;

export const FillInBlank: React.FC<BlockComponentProps> = ({ block, result, onResult, announce }) => {
    const blanks: BlankToken[] = block.blanks ?? [];
    const segments = useMemo(() => (block.code ?? '').split(PLACEHOLDER), [block.code]);
    const slotCount = Math.max(segments.length - 1, blanks.length);
    const submitted = result?.attempted ?? false;
    const [values, setValues] = useState<string[]>(() => Array(slotCount).fill(''));

    const norm = (s: string) => s.replace(/\r\n/g, '\n').trim();
    const allCorrect = blanks.length > 0
        ? blanks.every((b, i) => norm(values[i] ?? '') === norm(b.expected))
        : values.every((v) => norm(v).length > 0);

    const submit = () => {
        onResult({ blockId: block.id, attempted: true, correct: allCorrect, conceptId: block.conceptId });
        announce?.(allCorrect ? 'Correct. The code is complete.' : 'Not quite — check the highlighted tokens.');
    };
    const retry = () => { setValues(Array(slotCount).fill('')); onResult({ blockId: block.id, attempted: false, conceptId: block.conceptId }); };

    const setAt = (i: number, v: string) => setValues((prev) => prev.map((x, j) => (j === i ? v : x)));

    return (
        <div className="cc-reveal space-y-4">
            {block.content && <p className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>{block.content}</p>}

            <div className="cc-card cc-e1 p-4 overflow-x-auto">
                <pre className="m-0 cc-mono text-sm leading-loose whitespace-pre-wrap" style={{ color: 'var(--cc-tx-1)' }}>
                    {segments.map((seg, i) => (
                        <React.Fragment key={i}>
                            <span>{seg}</span>
                            {i < segments.length - 1 && (
                                <input
                                    type="text"
                                    value={values[i] ?? ''}
                                    disabled={submitted}
                                    onChange={(e) => setAt(i, e.target.value)}
                                    aria-label={`Blank ${i + 1}`}
                                    className="inline-block align-baseline mx-1 px-2 py-0.5 rounded-md cc-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                                    style={{
                                        minWidth: '5ch',
                                        width: `${Math.max((values[i]?.length ?? 0) + 1, 5)}ch`,
                                        background: 'var(--cc-surface-1)',
                                        border: `1px solid ${submitted ? (allCorrect ? 'var(--cc-ac)' : 'var(--cc-wa)') : 'rgba(163,230,53,.4)'}`,
                                        color: 'var(--cc-brand-1)',
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </pre>
            </div>

            {!submitted ? (
                <button type="button" onClick={submit} disabled={values.some((v) => !v.trim())} className="cc-btn cc-btn-secondary h-10 px-5 text-sm disabled:opacity-50">
                    Check
                </button>
            ) : (
                <Feedback
                    feedback={buildFeedback({
                        correct: allCorrect,
                        why: 'Every blank matches the expected token.',
                        misconception: 'One or more tokens don\u2019t match yet.',
                        hint: 'Compare each blank against the surrounding code and the concept you just learned.',
                    })}
                    onRetry={allCorrect ? undefined : retry}
                />
            )}
        </div>
    );
};

export default FillInBlank;
