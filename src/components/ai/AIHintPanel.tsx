import { Sparkles, MessageSquare, X } from 'lucide-react';

import { useAIHint } from '../../hooks/useAIHint';
import AILoadingState from './AILoadingState';
import ProgressiveHint from './ProgressiveHint';

import type { AIHintRequest } from '../../services/ai/types';

interface AIHintPanelProps {
    challenge: { id: string; title: string; language: 'python' | 'javascript' | 'cpp' };
    userCode: string;
    onClose?: () => void;
}

export default function AIHintPanel({ challenge, userCode, onClose }: AIHintPanelProps) {
    const { hint, loading, error, remainingHints, generateHint, clearHint } = useAIHint(challenge.id);
    // const [showLevelSelect, setShowLevelSelect] = useState(true); // Removed as redundant

    const handleSelectLevel = async (level: 'gentle' | 'detailed' | 'solution') => {
        // setShowLevelSelect(false); // Redundant
        const request: AIHintRequest = {
            challengeId: challenge.id,
            code: userCode,
            language: challenge.language,
            hintLevel: level,
            previousHints: [], // Ideally track previous hints in parent or context
        };
        await generateHint(request);
    };

    const handleAskAnother = () => {
        // If not all hints used, go back to level select
        clearHint();
        // setShowLevelSelect(true); // Redundant
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in duration-300 w-full rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-gray-100">AI Tutor</h2>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {remainingHints} hints remaining
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {loading ? (
                    <AILoadingState />
                ) : error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                            Could not generate hint
                        </h3>
                        <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
                        <button
                            onClick={() => clearHint()}
                            className="mt-3 text-xs font-medium text-red-700 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : hint ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/10 rounded-2xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 ring-1 ring-emerald-100/50">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        Here's a hint for you
                                    </h3>
                                    {hint.cached && (
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                            Cached
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {hint.hint}
                            </div>
                        </div>

                        {remainingHints > 0 ? (
                            <button
                                onClick={handleAskAnother}
                                className="w-full py-3 px-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Need more help? Ask another question
                            </button>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500">
                                You've used all available hints for this challenge.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center space-y-2 mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Stuck on a problem?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto">
                                Our AI tutor can analyze your code and provide personalized guidance appropriate for your level.
                            </p>
                        </div>

                        <ProgressiveHint
                            onSelectLevel={handleSelectLevel}
                            disabled={remainingHints <= 0}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <BookOpen className="w-3 h-3" />
                    <p>Asking for hints uses XP but helps you learn.</p>
                </div>
            </div>
        </div>
    );
}

// Helper icons
function BookOpen({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}
