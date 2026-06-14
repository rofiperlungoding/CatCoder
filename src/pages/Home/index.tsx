import {
    EnergyIcon, FireIcon, Target01Icon, Trophy, ArrowRight01Icon,
    CodeIcon, BookOpen01Icon, Calendar01Icon,
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
import type { LeaderboardEntry, Lesson, Activity } from '../../types';

const LANG_LABEL: Record<string, string> = { python: 'Python', javascript: 'JavaScript', cpp: 'C++' };
const DIFF_MINUTES: Record<string, number> = { easy: 10, medium: 20, hard: 35 };
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function dailyProblem() {
    if (problems.length === 0) return null;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return problems[dayOfYear % problems.length];
}

/** Strip markdown markers (**, *, `, #) and a leading "Description" label for clean card text. */
function cleanDesc(md: string): string {
    return md
        .replace(/[*`#>]/g, '')
        .replace(/^\s*description[:\s-]*/i, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Activity count for each of the last 7 days (index 6 = today). */
function weeklyCounts(activities: Activity[]): number[] {
    const counts = new Array(7).fill(0);
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    for (const a of activities) {
        const t = new Date(a.timestamp).getTime();
        const dayDiff = Math.floor((startOfToday.getTime() - new Date(t).setHours(0, 0, 0, 0)) / 86400000);
        if (dayDiff >= 0 && dayDiff < 7) counts[6 - dayDiff] += 1;
    }
    return counts;
}

export const HomePage: React.FC = () => {
    const { user, selectedLanguage, recentActivities } = useUserStore();
    const { completedLessons, completedProblems } = useProgressStore();
    const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = React.useState(true);
    const [langLessons, setLangLessons] = React.useState<Lesson[] | null>(null);

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

    React.useEffect(() => {
        let cancelled = false;
        loadLessonsByLanguage(selectedLanguage)
            .then((l) => { if (!cancelled) setLangLessons(l); })
            .catch(() => { if (!cancelled) setLangLessons([]); });
        return () => { cancelled = true; };
    }, [selectedLanguage]);

    if (!user) {
        return (
            <div className="cc-root">
                <Surface elevation={3} glow className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12">
                    <span className="cc-eyebrow mb-4">CatCoder</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight" style={{ color: 'var(--cc-tx-1)' }}>
                        Master Coding.<br />
                        <span style={{ color: 'var(--cc-brand-1)' }}>Build Your Future.</span>
                    </h1>
                    <p className="text-lg max-w-2xl mb-8" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                        Learn Python, JavaScript, and C++ with interactive lessons, hands-on
                        problems, and real-time AI mentorship.
                    </p>
                    <div className="flex gap-3">
                        <Link to="/learn"><Button size="lg">Start learning free</Button></Link>
                        <Link to="/practice"><Button variant="secondary" size="lg">Explore problems</Button></Link>
                    </div>
                </Surface>
            </div>
        );
    }

    const levelProgress = calculateLevelProgress(user.xp);
    const solvedCount = completedProblems.size;
    const total = langLessons?.length ?? 0;
    const done = langLessons ? langLessons.filter((l) => completedLessons.has(l.id)).length : 0;
    const coursePct = total > 0 ? Math.round((done / total) * 100) : 0;
    const nextLesson = langLessons?.find((l) => !completedLessons.has(l.id)) ?? langLessons?.[0] ?? null;
    const isFirstRun = user.xp === 0 && completedLessons.size === 0 && solvedCount === 0;
    const challenge = dailyProblem();

    const week = weeklyCounts(recentActivities ?? []);
    const weekMax = Math.max(1, ...week);
    const weekSpark = week.map((c) => c / weekMax);
    const weekTotal = week.reduce((a, b) => a + b, 0);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    const estMinutes = challenge ? DIFF_MINUTES[challenge.difficulty] ?? 15 : 15;

    return (
        <div className="cc-root max-w-[1120px] mx-auto space-y-6">
            {/* Header with kicker */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="cc-eyebrow flex items-center gap-1.5 mb-1.5">
                        <HugeiconsIcon icon={Calendar01Icon} size={12} /> {today}
                    </span>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--cc-tx-2)' }}>
                        Welcome back, <span style={{ color: 'var(--cc-tx-1)' }}>{user.username}</span>
                    </h1>
                </div>
                <Link to="/practice" className="hidden md:block">
                    <Button variant="secondary" size="md">
                        <HugeiconsIcon icon={CodeIcon} size={16} /> Daily Code
                    </Button>
                </Link>
            </header>

            {/* Current Course hero */}
            <Surface elevation={2} glow className="p-7 md:p-8">
                <div className="flex items-center gap-4 mb-5">
                    <div className="cc-icon-well w-12 h-12 text-lime-300 shrink-0" aria-hidden="true">
                        <HugeiconsIcon icon={BookOpen01Icon} size={24} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <span className="cc-eyebrow">Current course</span>
                        <h2 className="text-2xl font-bold mt-1" style={{ color: 'var(--cc-tx-1)' }}>
                            {LANG_LABEL[selectedLanguage] ?? selectedLanguage} Fundamentals
                        </h2>
                    </div>
                </div>

                <p className="text-sm mb-6" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                    {isFirstRun || !nextLesson
                        ? 'Start your first lesson and begin your streak.'
                        : <>Up next — <span style={{ color: 'var(--cc-tx-1)', fontWeight: 600 }}>{nextLesson.title}</span></>}
                </p>

                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="cc-eyebrow">Progress</span>
                        <span className="cc-mono" style={{ color: 'var(--cc-tx-2)' }}>{coursePct}% · {done}/{total || '—'}</span>
                    </div>
                    <Progress value={coursePct} className="h-2" aria-label="Course progress" />
                </div>

                <Link to={nextLesson ? `/learn/${nextLesson.id}` : '/learn'} className="inline-block">
                    <Button size="lg">
                        {isFirstRun ? 'Start' : 'Continue'} <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                    </Button>
                </Link>
            </Surface>

            {/* Stat row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 cc-stagger">
                <StatCard
                    icon={EnergyIcon} accentClass="text-lime-300" eyebrow="Experience"
                    value={formatXP(user.xp)} delta={`Lv ${user.level}`}
                    progress={levelProgress.percentage}
                    meta={`${formatXP(levelProgress.required - levelProgress.current)} XP to level ${user.level + 1}`}
                />
                <StatCard
                    icon={FireIcon} accentClass="text-orange-300" eyebrow="Day Streak"
                    value={user.streakCurrent} spark={weekSpark}
                    meta={`Best ${user.streakBest} days`}
                />
                <StatCard
                    icon={Target01Icon} accentClass="text-sky-300" eyebrow="Solved"
                    value={solvedCount}
                    meta={isFirstRun ? 'Solve one for +100 XP' : `${done} lessons completed`}
                />
            </div>

            {/* Lower row: Daily Challenge · Leaderboard · This Week */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 cc-stagger">
                {/* Daily Challenge (dense) */}
                <Surface elevation={1} className="p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <span className="cc-eyebrow">Daily Challenge</span>
                        <Pill variant="brand" className="cc-mono">+{challenge?.xpReward ?? 100} XP</Pill>
                    </div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--cc-tx-1)' }}>
                        {challenge?.title ?? 'No challenge available'}
                    </h3>
                    {challenge && (
                        <>
                            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                                {cleanDesc(challenge.description)}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                <span
                                    className="cc-pill text-[11px] capitalize"
                                    style={{
                                        color: challenge.difficulty === 'easy' ? 'var(--cc-ac)'
                                            : challenge.difficulty === 'hard' ? 'var(--cc-wa)' : 'var(--cc-tle)',
                                    }}
                                >
                                    {challenge.difficulty}
                                </span>
                                {challenge.tags.slice(0, 2).map((t) => (
                                    <span key={t} className="cc-pill text-[11px]">{t}</span>
                                ))}
                                <span className="cc-pill cc-mono text-[11px]">~{estMinutes}m</span>
                            </div>
                        </>
                    )}
                    {challenge && (
                        <Link to={`/practice/${challenge.id}`} className="mt-auto">
                            <Button variant="secondary" size="md" fullWidth>Solve now</Button>
                        </Link>
                    )}
                </Surface>

                {/* Leaderboard */}
                <Surface elevation={1} className="p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="cc-icon-well w-7 h-7 text-amber-300"><HugeiconsIcon icon={Trophy} size={15} /></div>
                        <span className="cc-eyebrow">Leaderboard</span>
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
                                <HugeiconsIcon icon={Trophy} size={22} className="mx-auto mb-2 opacity-30" />
                                <p className="text-xs">No pioneers yet — be the first.</p>
                            </div>
                        ) : (
                            leaderboard.map((entry, i) => (
                                <LeaderboardRow
                                    key={entry.user.id} rank={i + 1} name={entry.user.username}
                                    xp={entry.score} avatarUrl={entry.user.avatarUrl}
                                    isCurrentUser={entry.user.id === user.id}
                                />
                            ))
                        )}
                    </div>
                    <hr className="cc-divider my-3" />
                    <Link to="/compete" className="block">
                        <Button variant="ghost" size="sm" fullWidth>
                            View full standings <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                        </Button>
                    </Link>
                </Surface>

                {/* This Week */}
                <Surface elevation={1} className="p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <span className="cc-eyebrow">This Week</span>
                        <Pill className="cc-mono">{weekTotal} actions</Pill>
                    </div>
                    <div className="flex items-end justify-between gap-2 flex-1 min-h-[120px]">
                        {weekSpark.map((v, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                <div className="w-full flex-1 flex items-end cc-icon-well rounded-md overflow-hidden" style={{ minHeight: '80px' }}>
                                    <div
                                        className="w-full rounded-md"
                                        style={{
                                            height: `${Math.max(6, v * 100)}%`,
                                            background: week[i] > 0 ? 'linear-gradient(180deg,#c8f56e,var(--cc-brand-2))' : 'transparent',
                                            boxShadow: week[i] > 0 ? 'inset 0 1px 0 rgba(255,255,255,.4)' : 'none',
                                        }}
                                    />
                                </div>
                                <span className="cc-eyebrow" style={{ color: i === 6 ? 'var(--cc-brand-1)' : 'var(--cc-tx-3)' }}>
                                    {DAY_LABELS[(new Date().getDay() - 6 + i + 7) % 7]}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs mt-3" style={{ color: 'var(--cc-tx-3)' }}>
                        {weekTotal === 0 ? 'No activity yet this week.' : 'Lessons & problems completed per day.'}
                    </p>
                </Surface>
            </div>
        </div>
    );
};
