import React from 'react';
import { cn } from '../../lib/utils';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-600 shadow-sm',
        secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-200 shadow-sm',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2'
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
};

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'hover' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    className,
    ...props
}) => {
    const baseStyles = 'rounded-xl border border-gray-200 bg-white shadow-sm';

    const variants = {
        default: 'bg-white',
        hover: 'bg-white hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 hover:border-gray-300',
        glass: 'bg-white/80 backdrop-blur-xl'
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-8'
    };

    return (
        <div className={cn(baseStyles, variants[variant], paddings[padding], className)} {...props}>
            {children}
        </div>
    );
};

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';

    const variants = {
        default: 'bg-gray-100 text-gray-700 border border-gray-200',
        primary: 'bg-orange-50 text-orange-700 border border-orange-100',
        success: 'bg-green-50 text-green-700 border border-green-100',
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
        danger: 'bg-red-50 text-red-700 border border-red-100',
        info: 'bg-blue-50 text-blue-700 border border-blue-100'
    };

    const sizes = {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm'
    };

    return (
        <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
            {children}
        </span>
    );
};

// ProgressBar Component
interface ProgressBarProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    variant?: 'default' | 'success' | 'warning';
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    size = 'md',
    showLabel = false,
    variant = 'default',
    className
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    };

    const variants = {
        default: 'bg-orange-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500'
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between mb-1 text-xs font-medium">
                    <span className="text-gray-600">{value}</span>
                    <span className="text-gray-400">{max}</span>
                </div>
            )}
            <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizes[size])}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', variants[variant])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Avatar Component
interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'Avatar',
    fallback = '🐱',
    size = 'md',
    className
}) => {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl'
    };

    return (
        <div className={cn(
            'rounded-full bg-orange-50 flex items-center justify-center overflow-hidden border border-gray-200 text-orange-600 font-bold',
            sizes[size],
            className
        )}>
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <span>{fallback}</span>
            )}
        </div>
    );
};

// Tooltip Component
interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top'
}) => {
    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div className="relative group">
            {children}
            <div className={cn(
                'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg',
                positions[position]
            )}>
                {content}
            </div>
        </div>
    );
};

// Tabs Component
interface TabsProps {
    tabs: { id: string; label: string; icon?: React.ReactNode }[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    className
}) => {
    return (
        <div className={cn('flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200', className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                        activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    )}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

// Skeleton Component
interface SkeletonProps {
    width?: string;
    height?: string;
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    className,
    variant = 'rectangular'
}) => {
    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    };

    return (
        <div
            className={cn('animate-pulse bg-gray-200', variants[variant], className)}
            style={{ width, height }}
        />
    );
};

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={cn(
                'relative w-full mx-4 bg-white border border-gray-200 rounded-xl shadow-2xl animate-fade-in',
                sizes[size]
            )}>
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    className={cn(
                        'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm',
                        icon && 'pl-10',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    className,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={cn(
                        'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer shadow-sm',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="text-gray-900">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
