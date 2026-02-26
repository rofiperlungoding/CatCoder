import { Loading02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from '../ui';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { useUserStore, useProgressStore } from '../../stores';
import { learningAnalyzer } from '../../services/ai/learningAnalyzer';
import { loadLessonsByLanguage } from '../../data/lessons';
import type { LearningPathGuide, ChallengeAttempt } from '../../types/analytics';

export const AILearningGuide: React.FC = () => {
    const navigate = useNavigate();
    const { user, selectedLanguage } = useUserStore();
    const { progress: userProgress } = useProgressStore();
    const [guide, setGuide] = useState<LearningPathGuide | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchGuide = async () => {
            if (!user) return;

            try {
                // Fetch actual lessons to feed the AI
                const lessons = await loadLessonsByLanguage(selectedLanguage || 'python');
                const availableLessons = lessons.map(l => ({
                    id: l.id,
                    title: l.title,
                    topic: l.sections[0]?.type || 'General' // Simple heuristic for topic
                }));

                // Construct a partial progress object for the analyzer
                // In a real app, this should come fully from the store or a centralized analytics provider
                const progressData = {
                    userId: user.id,
                    level: user.level,
                    totalXP: user.xp,
                    completedChallenges: userProgress.filter(p => p.status === 'completed').map(p => p.contentId),
                    currentStreak: user.streakCurrent
                };

                // Mock recent attempts - ideally this should be tracked in store
                const recentAttempts: ChallengeAttempt[] = [];

                const result = await learningAnalyzer.generateLearningPathGuide(progressData, recentAttempts, availableLessons);

                if (mounted) {
                    setGuide(result);
                }
            } catch (error) {
                console.error("Failed to load AI Guide:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchGuide();

        return () => { mounted = false; };
    }, [user, userProgress, selectedLanguage]);

    if (loading) {
        return (
            <div className="w-full bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-lg flex items-center justify-center min-h-[200px] animate-pulse">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Icon icon={Loading02Icon} size={24} className="animate-spin text-lime-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Analyzing Progress...</span>
                </div>
            </div>
        );
    }

    if (!guide) return null;

    return (
        <div className="relative overflow-hidden w-full bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl ring-1 ring-white/10 group">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-lime-500/30 transition-colors duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 font-bold uppercase tracking-widest">
                            <img src="/Python Logo.png" alt="Python" className="w-5 h-5 object-contain" />
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                        {guide.message}
                    </h2>

                    <div className="space-y-1">
                        <p className="text-lg font-medium text-lime-200">
                            Recommendation: <span className="text-white">{guide.recommendation}</span>
                        </p>
                        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                            {guide.reason}
                        </p>
                    </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                    <Button
                        size="lg"
                        onClick={() => navigate(guide.targetUrl)}
                        className="w-full md:w-auto bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-bold border-0 shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transition-all duration-300 transform hover:scale-105"
                    >
                        {guide.actionLabel}
                        <Icon icon={ArrowRight01Icon} size={18} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
