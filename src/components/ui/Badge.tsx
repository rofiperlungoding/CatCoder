import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = ''
}) => {
    const variants = {
        primary: "bg-primary/5 dark:bg-primary/20 text-primary dark:text-white border-primary/20 dark:border-primary/40",
        secondary: "bg-secondary dark:bg-gray-700 text-secondary-foreground dark:text-white border-transparent",
        success: "bg-accent/10 dark:bg-accent/20 text-accent-foreground border-accent/20 dark:border-accent/40",
        warning: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800",
        danger: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800",
        outline: "bg-transparent border-gray-200 dark:border-gray-700 text-muted-foreground"
    };

    const sizes = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs"
    };

    return (
        <span className={`inline-flex items-center font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};
