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
        primary: "bg-indigo-50 text-indigo-700 border-indigo-100",
        secondary: "bg-slate-100 text-slate-700 border-slate-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-100",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        danger: "bg-rose-50 text-rose-700 border-rose-100",
        outline: "bg-transparent border-slate-200 text-slate-600"
    };

    const sizes = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs"
    };

    return (
        <span className={`inline-flex items-center font-semibold rounded-md border ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};
