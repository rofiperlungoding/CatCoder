import { Brain, RotateCw, Sparkles, ArrowRight, X, Zap, Trophy } from 'lucide-react';
import SkillProgressBar from './SkillProgressBar';
import InsightCard from './InsightCard';
import { LoadingSpinner } from '../ui';
import type { LearningInsight, SkillAssessment, PersonalizedRecommendation } from '../../types/analytics';

interface AIInsightsPanelProps {
    insights: LearningInsight[];
    skills: SkillAssessment[];
    recommendation: PersonalizedRecommendation | null;
    loading: boolean;
    onRefresh: () => void;
    onAcceptRecommendation?: (challengeId: string) => void;
    onClose?: () => void;
}

export default function AIInsightsPanel({
    insights,
    skills,
    recommendation,
    loading,
    onRefresh,
    onAcceptRecommendation,
    onClose,
}: AIInsightsPanelProps) {
    return (
        <div className="flex flex-col h-full w-full bg-[#0a0a0a]/80 backdrop-blur-xl text-gray-100 overflow-hidden relative">

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20" />
                        <img
                            src="/logo.png"
                            alt="CatCoder AI"
                            className="relative w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            AI Insights
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className={`p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors`}
                    >
                        {loading ? (
                            <LoadingSpinner
                                size={20}
                                className="border-white/20 border-t-white text-white"
                            />
                        ) : (
                            <RotateCw className="w-5 h-5" />
                        )}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 z-10">
                {loading && !insights.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
                        <div className="h-64 bg-white/5 rounded-3xl" />
                        <div className="h-64 bg-white/5 rounded-3xl" />
                        <div className="h-48 bg-white/5 rounded-3xl md:col-span-2" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                        {/* Left Column: Recommendation & Stats (5 cols) */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                            {/* Hero Recommendation Card */}
                            {recommendation && (
                                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border border-emerald-500/20 shadow-2xl group">
                                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full" />

                                    <div className="relative p-8 space-y-6">
                                        <div className="flex items-center gap-3 text-emerald-300 text-sm font-bold uppercase tracking-wider">
                                            <Zap className="w-4 h-4" />
                                            <span>Recommended for you</span>
                                        </div>

                                        <div>
                                            <h3 className="text-3xl font-bold text-white mb-2 leading-tight">
                                                Next Challenge
                                            </h3>
                                            <p className="text-emerald-100/70 text-base leading-relaxed">
                                                {recommendation.reason}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <span className="px-4 py-2 bg-black/40 rounded-xl text-emerald-300 text-sm font-medium border border-emerald-500/20 backdrop-blur-sm">
                                                {recommendation.estimatedDifficulty}
                                            </span>
                                            <span className="px-4 py-2 bg-black/40 rounded-xl text-emerald-300 text-sm font-medium border border-emerald-500/20 backdrop-blur-sm">
                                                ~{recommendation.estimatedTime}
                                            </span>
                                        </div>

                                        {onAcceptRecommendation && (
                                            <button
                                                onClick={() => onAcceptRecommendation(recommendation.challengeId)}
                                                className="w-full group/btn relative overflow-hidden rounded-xl bg-white text-emerald-950 font-bold py-4 px-6 hover:bg-emerald-50"
                                            >
                                                <div className="relative flex items-center justify-center gap-3">
                                                    <span>Start Challenge</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Skills Radar / Progress */}
                            {skills.length > 0 && (
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                                    <div className="flex items-center gap-3 mb-6 text-gray-200">
                                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg">Skill Mastery</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {skills.map((skill) => (
                                            <SkillProgressBar
                                                key={skill.skill}
                                                skill={skill.skill}
                                                proficiency={skill.proficiency}
                                                challenges={skill.challengesCompleted}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Insights (7 cols) */}
                        <div className="lg:col-span-12 xl:col-span-7">
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md h-full">
                                <div className="flex items-center gap-3 mb-8 text-gray-200">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg">Analysis & Patterns</h3>
                                </div>

                                {insights.length > 0 ? (
                                    <div className="grid gap-4">
                                        {insights.map((insight, i) => (
                                            <div key={i} className="">
                                                <InsightCard insight={insight} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-gray-500">
                                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>Keep coding to unlock detailed insights</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
