import React from 'react';

interface ProgressBarProps {
    value: number;
    max: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'success' | 'warning';
    showLabel?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    className = ''
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizes = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4"
    };

    const variants = {
        primary: "bg-indigo-600",
        success: "bg-emerald-500",
        warning: "bg-amber-500"
    };

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${variants[variant]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
