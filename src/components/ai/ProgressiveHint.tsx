import { Lightbulb, BookOpen01Icon, MessageProgrammingIcon } from '@hugeicons/core-free-icons';
import { Icon } from '../ui';
import { clsx } from 'clsx';

interface ProgressiveHintProps {
    onSelectLevel: (level: 'gentle' | 'detailed' | 'solution') => void;
    disabled?: boolean;
}

export default function ProgressiveHint({ onSelectLevel, disabled }: ProgressiveHintProps) {
    const levels = [
        {
            id: 'gentle',
            label: 'Gentle Hint',
            desc: 'A small nudge in the right direction.',
            cost: 5,
            icon: Lightbulb,
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            border: 'hover:border-purple-400',
        },
        {
            id: 'detailed',
            label: 'Detailed Help',
            desc: 'Explanation of the logic needed.',
            cost: 15,
            icon: BookOpen01Icon,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            border: 'hover:border-blue-400',
        },
        {
            id: 'solution',
            label: 'Show Solution',
            desc: 'Complete code with explanation.',
            cost: 30,
            icon: MessageProgrammingIcon,
            color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            border: 'hover:border-red-400',
        },
    ] as const;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {levels.map((level) => {
                const IconCmp = level.icon;
                return (
                    <button
                        key={level.id}
                        onClick={() => onSelectLevel(level.id)}
                        disabled={disabled}
                        className={clsx(
                            "relative flex flex-col items-start p-4 text-left transition-all border-2 rounded-xl group",
                            "border-transparent bg-white dark:bg-gray-800 shadow-sm hover:shadow-md",
                            level.border,
                            disabled && "opacity-50 cursor-not-allowed grayscale"
                        )}
                    >
                        <div className={clsx("p-2 mb-3 rounded-lg", level.color)}>
                            <Icon icon={IconCmp} className="w-5 h-5" />
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {level.label}
                        </h3>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                            {level.desc}
                        </p>

                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 w-full flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Cost
                            </span>
                            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                                ⚡ -{level.cost} XP
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
