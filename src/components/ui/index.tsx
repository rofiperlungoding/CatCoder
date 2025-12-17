import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/* --- BUTTON --- */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm border border-transparent',
            secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200',
            ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200 border border-transparent',
            danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-transparent focus:ring-red-500'
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-5 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base'
        };

        return (
            <button
                ref={ref}
                className={`
                    ${baseStyles}
                    ${variants[variant]}
                    ${sizes[size]}
                    ${fullWidth ? 'w-full' : ''}
                    ${className}
                `}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

/* --- CARD (Bento Block) --- */
export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'hover' | 'flat';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    variant = 'default',
    onClick
}) => {
    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    const variants = {
        default: 'bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        hover: 'bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-indigo-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5',
        flat: 'bg-slate-50 border border-slate-100'
    };

    return (
        <div
            className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/* --- BADGE --- */
export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}) => {
    const variants = {
        default: 'bg-slate-100 text-slate-600 border border-slate-200',
        primary: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
        secondary: 'bg-slate-100 text-slate-600 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        danger: 'bg-rose-50 text-rose-700 border border-rose-100',
        info: 'bg-blue-50 text-blue-700 border border-blue-100'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

/* --- PROGRESS BAR --- */
export interface ProgressBarProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'success' | 'warning';
    showLabel?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    className = ''
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    };

    const variants = {
        primary: 'bg-indigo-600',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500'
    };

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-500">
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

/* --- AVATAR --- */
export const Avatar: React.FC<{
    src?: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}> = ({ src, fallback, size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl'
    };

    return (
        <div className={`relative inline-block rounded-full overflow-hidden bg-slate-100 border border-slate-200 ${sizes[size]} ${className}`}>
            {src ? (
                <img src={src} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 uppercase">
                    {fallback.charAt(0)}
                </div>
            )}
        </div>
    );
};

/* --- INPUT --- */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full rounded-lg border bg-white
                            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5
                            text-sm placeholder-slate-400
                            transition-all duration-200
                            ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 hover:border-slate-300'
                            }
                            focus:outline-none
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';

/* --- SELECT (Matches Bento Input) --- */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
                <select
                    ref={ref}
                    className={`
                        w-full rounded-lg border bg-white px-3 py-2.5
                        text-sm text-slate-700
                        transition-all duration-200
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 hover:border-slate-300'
                        }
                        focus:outline-none appearance-none
                        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
                        bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center]
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);
Select.displayName = 'Select';

/* --- TABS (Bento Pill Style) --- */
export interface TabsProps {
    tabs: { id: string; label: string; icon?: React.ReactNode }[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className = '' }) => {
    return (
        <div className={`inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/50 ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                            ${isActive
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }
                        `}
                    >
                        {tab.icon && <span className={isActive ? 'text-indigo-600' : 'opacity-70'}>{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

/* --- SKELETON (Loading State) --- */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
);

/* --- MODAL (Bento style) --- */
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
