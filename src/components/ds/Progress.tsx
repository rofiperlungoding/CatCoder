import React from 'react';

interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    'aria-label'?: string;
}

/** Brand-gradient progress bar on a recessed track. */
export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    className = 'h-2',
    ...rest
}) => {
    const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
    return (
        <div
            className={`cc-progress-track ${className}`}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            {...rest}
        >
            <div className="cc-progress-fill" style={{ width: `${pct}%` }} />
        </div>
    );
};

export default Progress;
