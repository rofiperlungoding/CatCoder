import React from 'react';

interface SkeletonProps {
    className?: string;
}

/** Shimmer placeholder. Compose with width/height utility classes. */
export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => (
    <div className={`cc-skeleton ${className}`} aria-hidden="true" />
);

export default Skeleton;
