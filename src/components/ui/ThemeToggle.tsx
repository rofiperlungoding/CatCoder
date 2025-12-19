import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../stores';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Toggle Track Icons */}
            <Sun size={14} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <Moon size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-300" />

            {/* Toggle Thumb */}
            <div
                className={`
                    w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md
                    transform transition-transform duration-300 ease-out
                    flex items-center justify-center
                    ${isDark ? 'translate-x-6' : 'translate-x-0'}
                `}
            >
                {isDark ? (
                    <Moon size={12} className="text-blue-400" />
                ) : (
                    <Sun size={12} className="text-amber-500" />
                )}
            </div>
        </button>
    );
};
