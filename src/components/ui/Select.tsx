import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './';
import React from 'react';
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
                        w-full appearance-none bg-white border border-gray-200 rounded-full px-6 py-3 text-primary 
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:border-primary transition-all cursor-pointer
                        disabled:bg-muted disabled:text-muted-foreground
                        ${error ? 'border-red-300' : ''}
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
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Icon icon={ArrowDown01Icon} size={16} />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
};
