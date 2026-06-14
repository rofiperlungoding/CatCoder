import {
    EnergyIcon, FireIcon, Target01Icon, Trophy, ArrowRight01Icon,
    CodeIcon, BookOpen01Icon, SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Surface, Button, Progress, Pill, Skeleton, StatCard, LeaderboardRow } from '../../components/ds';
import { useUserStore, useProgressStore } from '../../stores';
import { fetchLeaderboard, subscribeLeaderboard } from '../../lib/leaderboard';
import { syncUserXP } from '../../lib/sync';
import { calculateLevelProgress, formatXP } from '../../lib/utils';
import { loadLessonsByLanguage } from '../../data/lessons';
import { problems } from '../../data/problems';
import type { LeaderboardEntry, Lesson } from '../../types';

const LANG_LABEL: Record<string, string> = {
    python: 'Python', javascript: 'JavaScript', cpp: 'C++',
};

// Deterministic "daily" problem so it's stable across a day.
function dailyProblem() {
    if (problems.length === 0) return null;
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return problems[dayOfYear % problems.length];
}

export const HomePage: React.FC = () => {
    const { user, selectedLanguage } = useUserStore();
    const { completedLessons, completedProblems } = useProgressStore();
    const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = React.useState(true);
    const [langLessons, setLangLessons] = React.useState<Lesson[] | null>(null);

    // Leaderboard (initial fetch + live updates)
    React.useEffect(() => {
        if (!user) return;
        let cancelled = false;
        let unsub: (() => void) | null = null;
        fetchLeaderboard(5)
            .then((d) => { if (!cancelled) setLeaderboard(d); })
            .catch((e) => console.error('Failed to load leaderboard', e))
            .finally(() => { if (!cancelled) setLoadingLeaderboard(false); });
        unsub = subscribeLeaderboard(5, (d) => { if (!cancelled) setLeaderboard(d); });
        syncUserXP(user.id).catch((e) => console.error('XP sync failed', e));
        return () => { cancelled = true; unsub?.(); };
    }, [user]);

    // Lessons for the selected language (for the continue strip)
    React.useEffect(() => {
        let cancelled = false;
        loadLessonsByLanguage(selectedLanguage)
            .then((l) => { if (!cancelled) setLangLessons(l); })
            .catch(() => { if (!cancelled) setLangLessons([]); });
        return () => { cancelled = true; };
    }, [selectedLanguage]);

    // ---- Landing for signed-out visitors ----
    if (!user) {
        return (
            <div className="cc-root">
                <Surface elevation={3} glow className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight" style={{ color: 'var(--cc-tx-1)' }}>
                        Master Coding.<br />
                        <span style={{ color: 'var(--cc-brand-1)' }}>Build Your Future.</span>
                    </h1>
                    <p className="text-lg max-w-2xl mb-8 leading-relaxed" style={{ color: 'var(--cc-tx-2)' }}>
                        Learn Python, JavaScript, and C++ with interactive lessons, hands-on
                        problems, and real-time AI mentorship.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/learn"><Button size="lg">Start Learning Free</Button></Link>
                        <Link to="/practice"><Button variant="secondary" size="lg">Explore Problems</Button></Link>
                    </div>
                </Surface>
            </div>
        );
    }

    // ---- Derived data ----
    const levelProgress = calculateLevelProgress(user.xp);
    const solvedCount = completedProblems.size;
    const total = langLessons?.length ?? 0;
    const done = langLessons ? langLessons.filter((l) => completedLessons.has(l.id)).length : 0;
    const coursePct = total > 0 ? Math.round((done / total) * 100) : 0;
    const nextLesson = langLessons?.find((l) => !completedLessons.has(l.id)) ?? langLessons?.[0] ?? null;
    const isFirstRun = user.xp === 0 && completedLessons.size === 0 && solvedCount === 0;
    const challenge = dailyProblem();

    return (
        <div className="cc-root space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--cc-tx-1)' }}>
                        Welcome back, {user.username}
                    </h1>
                    <p style={{ color: 'var(--cc-tx-2)' }}>
                        {isFirstRun ? 'Let’s write your first line of code today.' : 'Here’s what’s happening today.'}
                    </p>
                </div>
                <Link to="/practice" className="hidden md:block">
                    <Button variant="secondary" size="sm">
                        <HugeiconsIcon icon={CodeIcon} size={16} /> Daily Code
                    </Button>
                </Link>
            </header>

            {/* Continue-course strip */}
            <Surface elevation={2} glow className="p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-lg">
                        <Pill variant="brand" className="mb-3">
                            <HugeiconsIcon icon={BookOpen01Icon} size={13} /> Current Course
                        </Pill>
                        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--cc-tx-1)' }}>
                            {LANG_LABEL[selectedLanguage] ?? selectedLanguage} Fundamentals
                        </h2>
                        <p style={{ color: 'var(--cc-tx-2)' }}>
                            {isFirstRun || !nextLesson
                                ? 'Start your first lesson and begin your streak.'
                                : <>Up next: <span style={{ color: 'var(--cc-tx-1)', fontWeight: 600 }}>{nextLesson.title}</span></>}
                        </p>
                    </div>
                    <div className="md:w-72 w-full">
                        <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: 'var(--cc-tx-2)' }}>
                            <span>Progress</span>
                            <span className="cc-mono">{coursePct}% · {done}/{total || '—'}</span>
                        </div>
                        <Progress value={coursePct} className="h-2 mb-4" aria-label="Course progress" />
                        <Link to={nextLesson ? `/learn/${nextLesson.id}` : '/learn'}>
                            <Button fullWidth>
                                {isFirstRun ? 'Start learning' : 'Continue learning'}
                                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Surface>

            {/* Stat row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                    icon={EnergyIcon} accentClass="text-lime-300" label="Total XP"
                    value={formatXP(user.xp)} progress={levelProgress.percentage}
                    delta={isFirstRun ? undefined : `Lv ${user.level}`}
                    hint={`${levelProgress.required - levelProgress.current} XP to level ${user.level + 1}`}
                />
                <StatCard
                    icon={FireIcon} accentClass="text-orange-300" label="Day Streak"
                    value={user.streakCurrent}
                    hint={isFirstRun ? 'Complete a lesson to start it' : undefined}
                />
                <StatCard
                    icon={Target01Icon} accentClass="text-sky-300" label="Problems Solved"
                    value={solvedCount}
                    hint={isFirstRun ? 'Solve one to get +100 XP' : undefined}
                />
            </div>

            {/* Lower row: Daily Challenge + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Daily Challenge */}
                <Surface elevation={2} glow className="lg:col-span-2 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 cc-surface-3 text-lime-300"
                            style={{ boxShadow: 'var(--cc-e1)' }}
                        >
                            <HugeiconsIcon icon={SparklesIcon} size={28} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Pill variant="brand">DAILY</Pill>
                                <span className="text-xs" style={{ color: 'var(--cc-tx-3)' }}>Challenge</span>
                            </div>
                            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--cc-tx-1)' }}>
                                {challenge?.title ?? 'No challenge available'}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                                Solve it to earn <span className="cc-mono font-bold" style={{ color: 'var(--cc-brand-1)' }}>
                                    +{challenge?.xpReward ?? 100} XP
                                </span>.
                            </p>
                        </div>
                    </div>
                    {challenge && (
                        <Link to={`/practice/${challenge.id}`} className="w-full sm:w-auto">
                            <Button fullWidth>Solve now</Button>
                        </Link>
                    )}
                </Surface>

                {/* Leaderboard */}
                <Surface elevation={2} className="p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="p-1.5 rounded-lg cc-surface-3 text-amber-300">
                            <HugeiconsIcon icon={Trophy} size={18} />
                        </div>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--cc-tx-1)' }}>Leaderboard</h3>
                    </div>
                    <div className="space-y-1.5 flex-1">
                        {loadingLeaderboard ? (
                            [0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-2">
                                    <Skeleton className="w-6 h-6 rounded-full" />
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <Skeleton className="h-3 flex-1" />
                                </div>
                            ))
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-8" style={{ color: 'var(--cc-tx-3)' }}>
                                <HugeiconsIcon icon={Trophy} size={24} className="mx-auto mb-2 opacity-30" />
                                <p className="text-xs">No pioneers yet — be the first.</p>
                            </div>
                        ) : (
                            leaderboard.map((entry, i) => (
                                <LeaderboardRow
                                    key={entry.user.id}
                                    rank={i + 1}
                                    name={entry.user.username}
                                    xp={entry.score}
                                    avatarUrl={entry.user.avatarUrl}
                                    isCurrentUser={entry.user.id === user.id}
                                />
                            ))
                        )}
                    </div>
                    <Link
                        to="/compete"
                        className="mt-4 pt-3 text-center text-xs font-bold inline-flex items-center justify-center gap-1"
                        style={{ color: 'var(--cc-tx-2)', borderTop: '1px solid var(--cc-border)' }}
                    >
                        View full standings <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                    </Link>
                </Surface>
            </div>
        </div>
    );
};
