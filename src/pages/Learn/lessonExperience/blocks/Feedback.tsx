/**
 * Renders a {@link FeedbackDescriptor} from the pure feedback model.
 *
 * Color is never the sole signal: every state carries an explicit icon AND
 * text (Req 16.2). Correct = lime/green; incorrect = rose but supportive, with
 * a hint and an always-available retry affordance so it never dead-ends
 * (Req 13.1, 13.2, 13.3).
 */
import { CheckmarkCircle02Icon, AlertCircleIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Icon } from '../../../../components/ui';
import type { FeedbackDescriptor } from '../engine/feedback';

interface FeedbackProps {
    feedback: FeedbackDescriptor;
    onRetry?: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({ feedback, onRetry }) => {
    const correct = feedback.tone === 'correct';
    const color = correct ? 'var(--cc-ac)' : 'var(--cc-wa)';
    const bg = correct ? 'rgba(74,222,128,.10)' : 'rgba(251,113,133,.10)';
    const border = correct ? 'rgba(74,222,128,.28)' : 'rgba(251,113,133,.28)';

    return (
        <div
            className="rounded-2xl p-4 cc-reveal"
            style={{ backgroundColor: bg, border: `1px solid ${border}` }}
            role="status"
        >
            <div className="flex items-start gap-3">
                <span style={{ color }} className="shrink-0 mt-0.5">
                    <Icon icon={correct ? CheckmarkCircle02Icon : AlertCircleIcon} size={20} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>
                        <span style={{ color }}>{correct ? 'Correct. ' : 'Not quite. '}</span>
                        {feedback.text}
                    </p>
                    {!correct && feedback.hint && (
                        <p className="text-xs mt-2" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                            <span className="cc-eyebrow" style={{ color: 'var(--cc-tle)' }}>Hint</span>{' '}
                            {feedback.hint}
                        </p>
                    )}
                </div>
                {feedback.canRetry && onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="cc-btn cc-btn-ghost h-8 px-3 text-xs shrink-0"
                        style={{ color: 'var(--cc-tx-2)' }}
                    >
                        <Icon icon={RefreshIcon} size={14} /> Try again
                    </button>
                )}
            </div>
        </div>
    );
};

export default Feedback;
