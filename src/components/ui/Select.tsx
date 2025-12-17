import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: Option[];
    label?: string;
    error?: string;
}

export const Select: React.FC<SelectProps> = ({ options, label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`
                        w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 
                        focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all cursor-pointer
                        disabled:bg-slate-50 disabled:text-slate-500
                        ${error ? 'border-rose-300' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
};
