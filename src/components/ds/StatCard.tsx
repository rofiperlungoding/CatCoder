import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Surface } from './Surface';
import { Progress } from './Progress';

interface StatCardProps {
    icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
    /** Tailwind text color class for the icon, e.g. "text-lime-300". */
    accentClass?: string;
    label: string;
    value: React.ReactNode;
    /** Optional progress (0-100). */
    progress?: number;
    /** Optional delta pill text, e.g. "+120 today". */
    delta?: string;
    /** Optional hint shown when value is empty/zero (first-run). */
    hint?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    accentClass = 'text-lime-300',
    label,
    value,
    progress,
    delta,
    hint,
}) => (
    <Surface elevation={2} className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
            <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center cc-surface-3 ${accentClass}`}
                style={{ boxShadow: 'var(--cc-e1)' }}
            >
                <HugeiconsIcon icon={icon} size={22} strokeWidth={1.8} />
            </div>
            {delta && (
                <span className="cc-pill cc-pill-brand text-[11px]">{delta}</span>
            )}
        </div>
        <div>
            <div className="cc-mono text-3xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                {value}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--cc-tx-3)' }}>
                {label}
            </div>
        </div>
        {typeof progress === 'number' && <Progress value={progress} className="h-1.5" aria-label={label} />}
        {hint && <p className="text-xs" style={{ color: 'var(--cc-tx-2)' }}>{hint}</p>}
    </Surface>
);

export default StatCard;
