import { Trophy, Sparkles, ThumbsUp, Lightbulb, Code2, X } from 'lucide-react';
import StarRating from './StarRating';
import type { AICodeReviewResponse } from '../../services/ai/types';

interface AIReviewCardProps {
    review: AICodeReviewResponse;
    onClose?: () => void;
}

export default function AIReviewCard({ review, onClose }: AIReviewCardProps) {
    const { rating, strengths, improvements, alternatives, explanation, cached } = review;

    const getRatingMessage = (r: number) => {
        if (r >= 4) return { text: 'Excellent work! 🎉', color: 'text-green-600 dark:text-green-400' };
        if (r === 3) return { text: 'Good effort! 👍', color: 'text-yellow-600 dark:text-yellow-400' };
        return { text: 'Keep practicing! 💪', color: 'text-orange-600 dark:text-orange-400' };
    };

    const message = getRatingMessage(rating);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-green-100 dark:border-green-900/30 ring-1 ring-green-100/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-green-100 dark:border-green-900/30">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg shadow-green-500/20 text-white">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Code Review</h2>
                            <p className={`font-semibold ${message.color}`}>{message.text}</p>
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

                <div className="flex items-center justify-between">
                    <StarRating rating={rating} size="lg" />
                    {cached && (
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                            Cached
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Summary */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <h3>Review Summary</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {explanation}
                    </p>
                </section>

                {/* Strengths */}
                {strengths.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                            <ThumbsUp className="w-5 h-5 text-green-500" />
                            <h3>What You Did Well</h3>
                        </div>
                        <div className="grid gap-3">
                            {strengths.map((item, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                                    <div className="mt-0.5 w-4 h-4 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center shrink-0">
                                        <svg className="w-2.5 h-2.5 text-green-700 dark:text-green-300" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="2.5 6 4.5 9 9.5 3" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-green-800 dark:text-green-200">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Improvements */}
                {improvements.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            <h3>Areas for Improvement</h3>
                        </div>
                        <div className="grid gap-3">
                            {improvements.map((item, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                    <div className="mt-0.5 w-1 h-full bg-yellow-400 dark:bg-yellow-600 rounded-full shrink-0" />
                                    <span className="text-sm text-yellow-800 dark:text-yellow-200">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Alternatives */}
                {alternatives.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                            <Code2 className="w-5 h-5 text-blue-500" />
                            <h3>Alternative Approaches</h3>
                        </div>
                        <div className="grid gap-3">
                            {alternatives.map((item, i) => (
                                <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-200">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                Codes are reviewed by AI and may suggest optional improvements.
            </div>
        </div>
    );
}
