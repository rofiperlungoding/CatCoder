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
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
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
                        w-full bg-white border border-gray-200 rounded-full px-6 py-3 text-primary placeholder:text-muted-foreground
                        focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all
                        disabled:bg-muted disabled:text-muted-foreground
                        ${icon ? 'pl-12' : ''}
                        ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
};
