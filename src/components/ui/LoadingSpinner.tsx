import React from 'react';

interface LoadingSpinnerProps {
    size?: number;
    className?: string;
    light?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = '', light = false }) => {
    // Default size is 24px (w-6 h-6 usually, but here we use style or w-[size] if needed, 
    // but easiest is just to pass size to the style or generic class)

    // For specific Tailwind sizes:
    // 16 = w-4 h-4
    // 20 = w-5 h-5
    // 24 = w-6 h-6
    // 32 = w-8 h-8
    // 48 = w-12 h-12

    return (
        <div
            className={`
                animate-spin rounded-full 
                border-2 border-current border-t-transparent 
                ${className}
            `}
            style={{ width: size, height: size }}
            role="status"
            aria-label="loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};
