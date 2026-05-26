import { useEffect, useState } from 'react';
import { SparklesIcon, EnergyIcon } from '@hugeicons/core-free-icons';
import { Icon } from '../ui';
import { AIRateLimitManager } from '../../services/ai/aiRateLimit';

interface AIUsageIndicatorProps {
    /** Optional challenge id to show per-challenge hint quota. */
    challengeId?: string;
    className?: string;
}

interface Usage {
    hintsRemainingForChallenge: number | null;
    requestsRemaining: number;
    requestsLimit: number;
}

const TOTAL_HINTS_PER_CHALLENGE = 3;
const HOURLY_LIMIT = 50;

function readUsage(challengeId?: string): Usage {
    return {
        hintsRemainingForChallenge: challengeId
            ? AIRateLimitManager.getRemainingHints(challengeId)
            : null,
        requestsRemaining: AIRateLimitManager.getRemainingRequests(),
        requestsLimit: HOURLY_LIMIT,
    };
}

/**
 * Surfaces the user's remaining AI quota so they aren't confused by silent
 * `LIMIT_EXCEEDED` failures. Refreshes both on focus and on a 10s timer to
 * pick up usage triggered from other tabs that share the same localStorage.
 */
export const AIUsageIndicator: React.FC<AIUsageIndicatorProps> = ({ challengeId, className = '' }) => {
    const [usage, setUsage] = useState<Usage>(() => readUsage(challengeId));

    useEffect(() => {
        const refresh = () => setUsage(readUsage(challengeId));
        refresh();

        const interval = setInterval(refresh, 10_000);
        const focus = () => refresh();
        window.addEventListener('focus', focus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', focus);
        };
    }, [challengeId]);

    const hintsExhausted = usage.hintsRemainingForChallenge === 0;
    const globalLow = usage.requestsRemaining <= 5;

    const tone = hintsExhausted || globalLow
        ? 'text-amber-500'
        : 'text-muted-foreground';

    return (
        <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-3 text-xs font-medium ${tone} ${className}`}
        >
            {usage.hintsRemainingForChallenge !== null && (
                <span className="inline-flex items-center gap-1.5">
                    <Icon icon={SparklesIcon} size={14} aria-hidden="true" />
                    <span>
                        Hints {usage.hintsRemainingForChallenge}/{TOTAL_HINTS_PER_CHALLENGE}
                    </span>
                </span>
            )}
            <span className="inline-flex items-center gap-1.5">
                <Icon icon={EnergyIcon} size={14} aria-hidden="true" />
                <span>
                    AI {usage.requestsRemaining}/{usage.requestsLimit} this hour
                </span>
            </span>
        </div>
    );
};

export default AIUsageIndicator;
