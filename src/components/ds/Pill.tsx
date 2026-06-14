import React from 'react';

interface PillProps {
    children: React.ReactNode;
    variant?: 'default' | 'brand';
    className?: string;
}

export const Pill: React.FC<PillProps> = ({ children, variant = 'default', className = '' }) => (
    <span className={`cc-pill ${variant === 'brand' ? 'cc-pill-brand' : ''} ${className}`}>
        {children}
    </span>
);

export default Pill;
