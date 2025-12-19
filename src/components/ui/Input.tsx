import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-6 py-3 text-primary dark:text-white placeholder:text-muted-foreground
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 dark:focus-visible:ring-white/10 focus-visible:border-primary dark:focus-visible:border-gray-500 transition-all
                        disabled:bg-muted disabled:text-muted-foreground
                        ${icon ? 'pl-12' : ''}
                        ${error ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
};
