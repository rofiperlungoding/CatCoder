import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    variant = 'text'
}) => {
    const baseStyles = "animate-pulse bg-slate-200";

    const variants = {
        text: "rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-xl"
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={{ width, height }}
        />
    );
};
