import { SparklesIcon } from '@hugeicons/core-free-icons';
import { Icon } from '../ui';
export default function AILoadingState() {
    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative">
                <Icon icon={SparklesIcon} className="w-8 h-8 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
            </div>
            <div className="w-full space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse delay-75" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Generating smart hint...
            </p>
        </div>
    );
}
