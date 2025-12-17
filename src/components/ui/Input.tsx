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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all
                        disabled:bg-slate-50 disabled:text-slate-500
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
};
