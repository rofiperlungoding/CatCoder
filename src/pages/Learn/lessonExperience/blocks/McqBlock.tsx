/**
 * MCQ block (Req 12.5) with per-option explanatory feedback (Req 13.1, 13.2).
 * Emits a normalized BlockResult on submit. In Post_Flight it also captures a
 * confidence rating for mastery calibration (Req 10.5).
 */
import { CheckmarkCircle02Icon, AlertCircleIcon, CircleIcon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { Icon } from '../../../../components/ui';
import MarkdownContent from '../../../../components/ui/MarkdownContent';
import { buildFeedback } from '../engine/feedback';
import type { ConfidenceRating, McqOption } from '../engine/types';
import { Feedback } from './Feedback';
import type { BlockComponentProps } from './blockContract';

const CONFIDENCE: { id: ConfidenceRating; label: string }[] = [
    { id: 'low', label: 'Guessing' },
    { id: 'medium', label: 'Fairly sure' },
    { id: 'high', label: 'Certain' },
];

export const McqBlock: React.FC<BlockComponentProps> = ({ block, result, onResult, announce, captureConfidence }) => {
    const options: McqOption[] = block.options ?? [];
    const submitted = result?.attempted ?? false;
    const [selected, setSelected] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<ConfidenceRating>('medium');

    const chosen = options.find((o) => o.id === selected) ?? null;
    // On revisit the block remounts and `selected` is null; fall back to the
    // recorded result so feedback stays accurate after back-navigation.
    const isCorrect = chosen ? chosen.correct : (result?.correct ?? false);

    const submit = () => {
        if (!chosen) return;
        const feedbackText = chosen.explanation;
        onResult({
            blockId: block.id,
            attempted: true,
            correct: isCorrect,
            conceptId: block.conceptId,
            confidence: captureConfidence ? confidence : undefined,
        });
        announce?.(isCorrect ? `Correct. ${feedbackText}` : `Not quite. ${feedbackText}`);
    };

    const retry = () => { setSelected(null); onResult({ blockId: block.id, attempted: false, conceptId: block.conceptId }); };

    return (
        <div className="cc-reveal space-y-4">
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-0" style={{ color: 'var(--cc-tx-1)' }}>
                <MarkdownContent content={block.content ?? 'Quick check'} />
            </div>

            <fieldset className="space-y-2.5" role="radiogroup" aria-label="Answer options">
                {options.map((opt) => {
                    const isPicked = selected === opt.id;
                    const showState = submitted && (isPicked || opt.correct);
                    const tone = !showState ? 'idle' : opt.correct ? 'correct' : 'wrong';
                    const color = tone === 'correct' ? 'var(--cc-ac)' : tone === 'wrong' ? 'var(--cc-wa)' : 'var(--cc-border)';
                    return (
                        <label
                            key={opt.id}
                            className="flex items-start gap-3 rounded-2xl p-4 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-lime-400/60"
                            style={{
                                border: `1px solid ${tone === 'idle' ? (isPicked ? 'rgba(163,230,53,.4)' : 'var(--cc-border)') : color}`,
                                background: isPicked && !submitted ? 'rgba(163,230,53,.06)' : tone === 'correct' ? 'rgba(74,222,128,.08)' : tone === 'wrong' ? 'rgba(251,113,133,.08)' : 'var(--cc-surface-2)',
                                opacity: submitted && !isPicked && !opt.correct ? 0.6 : 1,
                            }}
                        >
                            <input
                                type="radio"
                                name={block.id}
                                value={opt.id}
                                checked={isPicked}
                                disabled={submitted}
                                onChange={() => setSelected(opt.id)}
                                className="sr-only"
                            />
                            <span className="shrink-0 mt-0.5" style={{ color: tone === 'idle' ? 'var(--cc-tx-3)' : color }}>
                                <Icon icon={tone === 'correct' ? CheckmarkCircle02Icon : tone === 'wrong' ? AlertCircleIcon : CircleIcon} size={18} aria-hidden="true" />
                            </span>
                            <span className="flex-1 min-w-0">
                                <span className="text-sm font-medium block" style={{ color: 'var(--cc-tx-1)' }}>{opt.label}</span>
                                {showState && (
                                    <span className="text-xs mt-1 block" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>{opt.explanation}</span>
                                )}
                            </span>
                        </label>
                    );
                })}
            </fieldset>

            {captureConfidence && !submitted && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="cc-eyebrow">How sure are you?</span>
                    {CONFIDENCE.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setConfidence(c.id)}
                            aria-pressed={confidence === c.id}
                            className="cc-pill text-xs"
                            style={confidence === c.id ? { color: 'var(--cc-brand-1)', borderColor: 'rgba(163,230,53,.3)', background: 'rgba(163,230,53,.12)' } : undefined}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            )}

            {!submitted ? (
                <button type="button" onClick={submit} disabled={!chosen} className="cc-btn cc-btn-secondary h-10 px-5 text-sm disabled:opacity-50">
                    Check answer
                </button>
            ) : (
                <Feedback
                    feedback={buildFeedback({
                        correct: isCorrect,
                        why: chosen?.explanation,
                        misconception: chosen?.explanation,
                        hint: options.find((o) => o.correct)?.label ? `Consider: ${options.find((o) => o.correct)!.label}` : undefined,
                    })}
                    onRetry={isCorrect ? undefined : retry}
                />
            )}
        </div>
    );
};

export default McqBlock;
