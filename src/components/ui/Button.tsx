import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 border border-transparent",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
        danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
