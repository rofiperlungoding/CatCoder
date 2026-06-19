/**
 * Recap & Reflect (Req 11). Key takeaways + mastered concepts, the single
 * server-owned XP/streak summary (shown exactly once — Property 16), a
 * spaced-review scheduling control (Req 11.3/11.4 via {@link scheduleReview}),
 * and clear "Next lesson" / "Back to path" navigation.
 */
import { CheckmarkCircle02Icon, ArrowRight01Icon, FireIcon, FlashIcon, Calendar01Icon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { Icon } from '../../../../components/ui';
import { Surface } from '../../../../components/ds';
import { scheduleReview, FIRST_INTERVAL_DAYS } from '../engine/review';
import type { ConceptChunk, ContentBlock } from '../engine/types';
import type { MasteryRecord } from '../engine/mastery';
import { MasteryBar } from './MasteryBar';

export interface RecapCompletion {
    xpAwarded: number;
    alreadyCompleted: boolean;
    /** True for guest/mock users where XP is a local estimate, not a server award. */
    estimate: boolean;
    pending: boolean;
}

interface RecapBlockProps {
    block: ContentBlock;
    concepts: ConceptChunk[];
    mastery: Record<string, MasteryRecord>;
    completion: RecapCompletion;
    streak: number;
    hasNext: boolean;
    onNext: () => void;
    onBackToPath: () => void;
    onAddToReview: () => void;
}

export const RecapBlock: React.FC<RecapBlockProps> = ({ block, concepts, mastery, completion, streak, hasNext, onNext, onBackToPath, onAddToReview }) => {
    const [scheduled, setScheduled] = useState(false);
    const takeaways = block.takeaways ?? concepts.map((c) => c.title);
    const masteredConcepts = concepts.filter((c) => mastery[c.id]?.mastered);

    // First review interval is deterministic; the actual schedule (with real
    // timestamps) is computed in the handler to keep render pure.
    const dueLabel = `${FIRST_INTERVAL_DAYS} day${FIRST_INTERVAL_DAYS === 1 ? '' : 's'}`;

    const handleReview = () => {
        scheduleReview(concepts.map((c) => c.id), Date.now());
        setScheduled(true);
        onAddToReview();
    };

    return (
        <div className="space-y-6 cc-stagger">
            {/* Celebration / XP — shown exactly once */}
            <Surface elevation={2} glow className="p-7 text-center">
                <div className="cc-icon-well w-14 h-14 mx-auto mb-4" style={{ color: 'var(--cc-ac)' }}>
                    <Icon icon={CheckmarkCircle02Icon} size={28} aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>Lesson complete</h2>
                <p className="text-sm mt-1.5" style={{ color: 'var(--cc-tx-2)' }}>{block.content || 'Nicely done.'}</p>

                <div className="flex items-center justify-center gap-3 mt-5">
                    <span className="cc-pill cc-pill-brand text-sm px-4 py-1.5">
                        <Icon icon={FlashIcon} size={15} aria-hidden="true" />
                        {completion.pending
                            ? 'Saving XP…'
                            : completion.alreadyCompleted
                                ? 'Already completed'
                                : `${completion.estimate ? '~' : '+'}${completion.xpAwarded} XP${completion.estimate ? ' (sign in to keep)' : ''}`}
                    </span>
                    {streak > 0 && (
                        <span className="cc-pill text-sm px-4 py-1.5" style={{ color: 'var(--cc-tle)' }}>
                            <Icon icon={FireIcon} size={15} aria-hidden="true" /> {streak} day streak
                        </span>
                    )}
                </div>
            </Surface>

            {/* Takeaways */}
            <Surface elevation={1} className="p-6">
                <span className="cc-eyebrow block mb-3">Key takeaways</span>
                <ul className="space-y-2.5">
                    {takeaways.map((t, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--cc-tx-1)' }}>
                            <span className="shrink-0 mt-0.5" style={{ color: 'var(--cc-ac)' }}><Icon icon={CheckmarkCircle02Icon} size={16} aria-hidden="true" /></span>
                            <span style={{ color: 'var(--cc-tx-2)' }}>{t}</span>
                        </li>
                    ))}
                </ul>
            </Surface>

            {/* Mastery */}
            {masteredConcepts.length > 0 && (
                <Surface elevation={1} className="p-6 space-y-4">
                    <span className="cc-eyebrow block">Concepts mastered</span>
                    {masteredConcepts.map((c) => (
                        <MasteryBar key={c.id} title={c.title} record={mastery[c.id]} />
                    ))}
                </Surface>
            )}

            {/* Spaced review */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start gap-3">
                    <span className="cc-icon-well w-10 h-10 shrink-0" style={{ color: 'var(--cc-info)' }}>
                        <Icon icon={Calendar01Icon} size={18} aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold" style={{ color: 'var(--cc-tx-1)' }}>Spaced review</h3>
                        {scheduled ? (
                            <p className="text-sm mt-1" style={{ color: 'var(--cc-ac)' }}>Added — we'll bring these concepts back in about {dueLabel}.</p>
                        ) : (
                            <p className="text-sm mt-1" style={{ color: 'var(--cc-tx-2)' }}>Lock this in. We'll resurface these concepts in about {dueLabel} so they stick.</p>
                        )}
                    </div>
                    {!scheduled && (
                        <button type="button" onClick={handleReview} className="cc-btn cc-btn-secondary h-9 px-4 text-sm shrink-0">Add to review</button>
                    )}
                </div>
            </Surface>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={onBackToPath} className="cc-btn cc-btn-ghost h-11 px-6 text-sm flex-1">Back to path</button>
                {hasNext && (
                    <button type="button" onClick={onNext} className="cc-btn cc-btn-primary h-11 px-6 text-sm flex-1">
                        Next lesson <Icon icon={ArrowRight01Icon} size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default RecapBlock;
