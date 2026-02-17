import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CheckCircle2,
    Sparkles,
    ChevronDown,
    BookOpen,
    ArrowRight,
    Clock,
    Search,
    Code
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { useUserStore, useProgressStore } from '../../stores';
import type { Lesson, Language, Tier } from '../../types';
import { loadLessonsByLanguage, loadLessonById } from '../../data/lessons';
import { LessonCarousel } from './LessonCarousel';

const tierMap: Record<string, string> = {
    '1': 'Seedling',
    '2': 'Sprout',
    '3': 'Growing',
    '4': 'Mature',
    '5': 'Expert'
};

export const LearnPage: React.FC = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { selectedLanguage, setSelectedLanguage } = useUserStore();
    const { isCompleted } = useProgressStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');
    const [isTierOpen, setIsTierOpen] = useState(false);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loadingLessons, setLoadingLessons] = useState(true);

    // Initial load and language change handler
    React.useEffect(() => {
        let mounted = true;
        const fetchLessons = async () => {
            setLoadingLessons(true);
            try {
                // If we have a specific lesson ID, we might need to load it first regardless of selected language
                if (lessonId) {
                    const specificLesson = await loadLessonById(lessonId);
                    if (specificLesson && mounted) {
                        // Ensure we switch language to match the deep-linked lesson
                        if (selectedLanguage !== specificLesson.language) {
                            setSelectedLanguage(specificLesson.language as Language);
                        }
                    }
                }

                const loadedLessons = await loadLessonsByLanguage(selectedLanguage);
                if (mounted) {
                    setLessons(loadedLessons);
                }
            } catch (error) {
                console.error("Failed to lead lessons", error);
            } finally {
                if (mounted) setLoadingLessons(false);
            }
        };

        fetchLessons();
        return () => { mounted = false; };
    }, [selectedLanguage, lessonId, setSelectedLanguage]);

    const activeLesson = useMemo(() => {
        return lessonId ? lessons.find(l => l.id === lessonId) || null : null;
    }, [lessonId, lessons]);

    const handleCompleteLesson = async () => {
        // Validation and XP awarding is now handled within LessonCarousel
        // This function just handles the navigation back to the list
        navigate('/learn');
    };

    const filteredLessons = lessons.filter(lesson => {
        const matchesLanguage = lesson.language === selectedLanguage;
        const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTier = selectedTier === 'all' || lesson.tier === selectedTier;
        return matchesLanguage && matchesSearch && matchesTier;
    });

    const groupedLessons = filteredLessons.reduce((acc, lesson) => {
        const tier = lesson.tier;
        if (!acc[tier]) acc[tier] = [];
        acc[tier].push(lesson);
        return acc;
    }, {} as Record<number, Lesson[]>);

    const completedCount = lessons.filter(l =>
        l.language === selectedLanguage && isCompleted('lesson', l.id)
    ).length;
    const totalCount = lessons.filter(l => l.language === selectedLanguage).length;

    if (loadingLessons && lessonId) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <LoadingSpinner size={48} className="text-primary" />
            </div>
        );
    }

    if (activeLesson) {
        return (
            <LessonCarousel
                key={activeLesson.id}
                activeLesson={activeLesson}
                onComplete={handleCompleteLesson}
                onBack={() => navigate('/learn')}
            />
        );
    }

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header Bento */}
                <div className="relative overflow-hidden bg-black dark:bg-card text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-opacity duration-1000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6">
                                <Sparkles size={12} className="text-lime-400" />
                                <span>Interactive Curriculum</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
                                Learning Library
                            </h1>
                            <p className="text-white/60 max-w-lg text-lg leading-relaxed mb-6 font-medium">
                                Structured paths to take you from beginner to expert. Master concepts one by one.
                            </p>
                        </div>

                        <div className="w-full md:w-auto min-w-[300px] bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Progress</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-lime-400 tracking-tighter">
                                        {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}
                                    </span>
                                    <span className="text-xl font-bold text-lime-400/50">%</span>
                                </div>
                            </div>

                            <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-6">
                                <div
                                    className="h-full bg-gradient-to-r from-lime-400 to-lime-200 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(163,230,53,0.5)]"
                                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 bg-white/5 py-3 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                                    <span className="text-2xl font-black text-white">{completedCount}</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Done</span>
                                </div>
                                <div className="flex-1 bg-white/5 py-3 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                                    <span className="text-2xl font-black text-white/40">{totalCount}</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 w-full md:w-auto relative z-30">
                        {/* Language Toggle */}
                        <div className="relative group">
                            <button
                                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                                className="h-12 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-full text-sm px-6 flex items-center gap-3 shadow-md hover:shadow-lg transition-all text-primary dark:text-white font-bold"
                            >
                                <Code size={18} className="text-primary/60" />
                                <span className="min-w-[80px] text-left">
                                    {selectedLanguage === 'python' ? 'Python' : selectedLanguage === 'javascript' ? 'JavaScript' : 'C++'}
                                </span>
                                <ChevronDown size={16} className={`transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isLanguageOpen && (
                                <div className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                                    {(['python', 'javascript', 'cpp'] as Language[]).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => {
                                                setSelectedLanguage(lang);
                                                setIsLanguageOpen(false);
                                            }}
                                            className={`w-full text-left px-5 py-3 text-sm transition-all flex items-center justify-between
                                            ${selectedLanguage === lang
                                                    ? 'bg-primary/5 text-primary font-black'
                                                    : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:translate-x-1'
                                                }`}
                                        >
                                            <span className="capitalize">{lang === 'cpp' ? 'C++' : lang}</span>
                                            {selectedLanguage === lang && <CheckCircle2 size={16} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tier Dropdown */}
                        <div className="relative group">
                            <button
                                onClick={() => setIsTierOpen(!isTierOpen)}
                                className="h-12 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-full text-sm px-6 flex items-center gap-3 shadow-md hover:shadow-lg transition-all text-primary dark:text-white font-bold"
                            >
                                <BookOpen size={18} className="text-primary/60" />
                                <span className="min-w-[100px] text-left">
                                    {selectedTier === 'all' ? 'All Tiers' : `Tier ${selectedTier}: ${tierMap[selectedTier]}`}
                                </span>
                                <ChevronDown size={16} className={`transition-transform duration-300 ${isTierOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isTierOpen && (
                                <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                                    <button
                                        onClick={() => { setSelectedTier('all'); setIsTierOpen(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm transition-all ${selectedTier === 'all' ? 'bg-primary/5 text-primary font-black' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:translate-x-1'}`}
                                    >
                                        All Tiers
                                    </button>
                                    {(['1', '2', '3', '4', '5']).map((tier) => (
                                        <button
                                            key={tier}
                                            onClick={() => { setSelectedTier(Number(tier) as Tier); setIsTierOpen(false); }}
                                            className={`w-full text-left px-5 py-3 text-sm transition-all flex items-center justify-between
                                            ${selectedTier === Number(tier)
                                                    ? 'bg-primary/5 text-primary font-black'
                                                    : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:translate-x-1'
                                                }`}
                                        >
                                            <span>Tier {tier}: {tierMap[tier]}</span>
                                            {selectedTier === Number(tier) && <CheckCircle2 size={16} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-14 pr-6 rounded-full bg-white dark:bg-card border-gray-200 dark:border-border shadow-md focus:shadow-xl transition-all font-medium text-base"
                        />
                    </div>
                </div>

                {/* Lessons Grid */}
                <div className="space-y-16 pb-20">
                    {Object.entries(groupedLessons).sort(([a], [b]) => Number(a) - Number(b)).map(([tier, lessons]) => (
                        <div key={tier} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">Level 0{tier}</span>
                                    <h2 className="text-xl font-black text-foreground tracking-tight px-6 bg-background relative z-10">
                                        {tierMap[tier as string]}
                                    </h2>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => navigate(`/learn/${lesson.id}`)}
                                        className="group relative bg-white dark:bg-card border border-gray-200 dark:border-border rounded-[2rem] p-8 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/5 cursor-pointer overflow-hidden"
                                    >
                                        {isCompleted('lesson', lesson.id) && (
                                            <div className="absolute top-6 right-6">
                                                <div className="bg-lime-500/10 text-lime-600 dark:text-lime-400 p-2 rounded-xl border border-lime-500/20">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/30 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {lesson.sections[0]?.type || 'Lesson'}
                                            </div>

                                            <div>
                                                <h3 className="text-2xl font-black text-foreground mb-3 leading-tight tracking-tight group-hover:text-primary transition-colors">
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-medium">
                                                    {lesson.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                                        <Clock size={14} className="text-primary/40" />
                                                        {lesson.estimatedTime}m
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-lime-600 dark:text-lime-400">
                                                        <Sparkles size={14} />
                                                        +{lesson.xpReward} XP
                                                    </div>
                                                </div>
                                                <div className="bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white p-2.5 rounded-2xl transition-all duration-300">
                                                    <ArrowRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredLessons.length === 0 && (
                        <div className="text-center py-32 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center">
                                <Search size={32} className="text-muted-foreground/30" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-foreground">No lessons found</p>
                                <p className="text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => { setSearchQuery(''); setSelectedTier('all'); }}
                                className="mt-4 rounded-full"
                            >
                                Reset all filters
                            </Button>
                        </div>
                    )}
                </div>

                {/* Backdrop for closing dropdowns */}
                {(isTierOpen || isLanguageOpen) && (
                    <div
                        className="fixed inset-0 z-10 bg-black/5"
                        onClick={() => { setIsTierOpen(false); setIsLanguageOpen(false); }}
                    />
                )}
            </div>

            {/* AI Insights Modal - REMOVED per user request */}
        </>
    );
};
