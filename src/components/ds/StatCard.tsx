import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Surface } from './Surface';
import { Progress } from './Progress';

interface StatCardProps {
    icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
    /** Tailwind text color class for the icon, e.g. "text-lime-300". */
    accentClass?: string;
    /** Mono uppercase eyebrow, e.g. "EXPERIENCE". */
    eyebrow: string;
    value: React.ReactNode;
    /** Small label/meta under the value (tx-3). */
    meta?: string;
    /** Optional progress (0-100) rendered as an inset-track bar. */
    progress?: number;
    /** Optional delta pill, e.g. "Lv 4". */
    delta?: string;
    /** Optional tiny sparkline values (0-1 each) for density. */
    spark?: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    accentClass = 'text-lime-300',
    eyebrow,
    value,
    meta,
    progress,
    delta,
    spark,
}) => (
    <Surface elevation={1} className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="cc-eyebrow">{eyebrow}</span>
            {delta && <span className="cc-pill cc-pill-brand text-[11px]">{delta}</span>}
        </div>
        <div className="flex items-center gap-3">
            <div className={`cc-icon-well w-10 h-10 shrink-0 ${accentClass}`}>
                <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
                <div className="cc-mono text-[1.75rem] leading-none font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                    {value}
                </div>
            </div>
        </div>
        {spark && spark.length > 0 && (
            <div className="flex items-end gap-1 h-7" aria-hidden="true">
                {spark.map((v, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                            height: `${Math.max(8, v * 100)}%`,
                            background: v > 0 ? 'linear-gradient(180deg,#c8f56e,var(--cc-brand-2))' : 'var(--cc-surface-3)',
                            opacity: v > 0 ? 0.9 : 0.5,
                        }}
                    />
                ))}
            </div>
        )}
        {typeof progress === 'number' && <Progress value={progress} className="h-1.5" aria-label={eyebrow} />}
        {meta && <p className="text-xs" style={{ color: 'var(--cc-tx-3)' }}>{meta}</p>}
    </Surface>
);

export default StatCard;
