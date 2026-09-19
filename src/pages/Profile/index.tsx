import {
    ProgrammingFlagIcon, BookOpen01Icon, FireIcon, Trophy, Edit02Icon,
    CheckmarkBadge01Icon, ArrowRight01Icon, SparklesIcon, ArrowDown01Icon, Calendar01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Avatar } from '../../components/ui';
import { Button, Progress } from '../../components/ds';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ContributionGraph } from '../../components/profile/ContributionGraph';
import { VerificationSection } from '../../components/profile/VerificationSection';
import { useUserStore, useProgressStore, useUIStore } from '../../stores';
import { calculateLevelProgress, formatXP, getRankDisplayName } from '../../lib/utils';
import { loadAllLessons } from '../../data/lessons';
import { problems as allProblems } from '../../data/problems';
import { openaiClient } from '../../services/ai/openaiClient';
import type { Language, Lesson } from '../../types';

const LANGS: { id: Language; label: string; dot: string }[] = [
    { id: 'python', label: 'Python', dot: '#7dd3fc' },
    { id: 'javascript', label: 'JavaScript', dot: '#fcd34d' },
    { id: 'cpp', label: 'C++', dot: '#fda4af' },
];

export const ProfilePage: React.FC = () => {
    const { user, updateEmail } = useUserStore();
    const { completedLessons, completedProblems } = useProgressStore();
    const { addToast } = useUIStore();
    const [tab, setTab] = useState<'overview' | 'settings'>('overview');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [updating, setUpdating] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [allLessons, setAllLessons] = useState<Lesson[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadAllLessons().then((l) => { if (!cancelled) setAllLessons(l); }).catch(() => { if (!cancelled) setAllLessons([]); });
        return () => { cancelled = true; };
    }, []);

    const langData = useMemo(() => {
        if (!allLessons) return null;
        return LANGS.map((l) => {
            const lessons = allLessons.filter((x) => x.language === l.id);
            const probs = allProblems.filter((p) => p.languages.includes(l.id));
            const lDone = lessons.filter((x) => completedLessons.has(x.id)).length;
            const pDone = probs.filter((p) => completedProblems.has(p.id)).length;
            const total = lessons.length + probs.length;
            const done = lDone + pDone;
            return { ...l, lessonsTotal: lessons.length, lessonsDone: lDone, problemsTotal: probs.length, problemsDone: pDone, pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
        });
    }, [allLessons, completedLessons, completedProblems]);

    if (!user) return null;

    const lvl = calculateLevelProgress(user.xp);
    const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';
    const aiEnabled = openaiClient.isEnabled();

    const handleShare = () => {
        const url = `${window.location.origin}/catcoder/${user.username}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            addToast('success', 'Profile link copied!');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const onTabKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setTab((t) => (t === 'overview' ? 'settings' : 'overview'));
        }
    };

    return (
        <div className="cc-root max-w-[1120px] mx-auto relative">
            <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />

            {/* Calm aurora behind the glass (the single glow) */}
            <div aria-hidden="true" className="pointer-events-none absolute -z-0" style={{
                top: -40, right: -60, width: 460, height: 460,
                background: 'radial-gradient(circle, rgba(163,230,53,.16), transparent 70%)', filter: 'blur(40px)',
            }} />

            <div className="relative space-y-10 cc-stagger">
                {/* Identity header — glass banner */}
                <div className="cc-glass p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6" style={{ borderRadius: 'var(--cc-r-xl)' }}>
                    <div className="cc-glass p-1.5 shrink-0" style={{ borderRadius: 9999, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14), var(--cc-e1)' }}>
                        <Avatar src={user.avatarUrl} fallback={user.username[0]?.toUpperCase()} size="xl" className="!w-24 !h-24 !rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold truncate" style={{ color: 'var(--cc-tx-1)' }}>{user.username}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className={`cc-pill cc-league cc-league-${user.rank} text-[11px]`} style={{ textTransform: 'capitalize' }}>
                                <HugeiconsIcon icon={Trophy} size={12} /> {getRankDisplayName(user.rank)} League
                            </span>
                            <span className="cc-pill text-[11px]"><HugeiconsIcon icon={Calendar01Icon} size={12} /> Joined {joined}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <Button variant="secondary" size="md" onClick={handleShare}>
                            {copied ? <><HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} /> Copied</> : 'Share'}
                        </Button>
                        <Button size="md" onClick={() => setIsEditOpen(true)}>
                            <HugeiconsIcon icon={Edit02Icon} size={16} /> Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Segmented control — sliding spring indicator */}
                <div className="cc-glass relative inline-flex p-1" role="tablist" aria-label="Profile sections" style={{ borderRadius: 'var(--cc-r)' }} onKeyDown={onTabKey}>
                    {/* sliding thumb */}
                    <span
                        aria-hidden="true"
                        className="absolute top-1 bottom-1 w-28 rounded-xl"
                        style={{
                            position: 'absolute',
                            left: 4,
                            transform: tab === 'overview' ? 'translateX(0)' : 'translateX(100%)',
                            background: 'var(--cc-surface-3)',
                            boxShadow: 'var(--cc-e1)',
                            transition: 'transform var(--cc-dur-2) var(--cc-ease-spring)',
                            zIndex: 0,
                        }}
                    />
                    {(['overview', 'settings'] as const).map((t) => {
                        const active = tab === t;
                        return (
                            <button
                                key={t}
                                role="tab"
                                aria-selected={active}
                                tabIndex={active ? 0 : -1}
                                onClick={() => setTab(t)}
                                className="relative z-10 w-28 h-9 rounded-xl text-sm font-semibold capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                                style={{ color: active ? 'var(--cc-brand-1)' : 'var(--cc-tx-2)', transition: 'color var(--cc-dur-2) var(--cc-ease)' }}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>

                {tab === 'overview' ? (
                    <div key="overview" className="cc-stagger space-y-10">
                        {/* Stat panel — one glass card */}
                        <div className="cc-glass p-6 md:p-7" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold" style={{ color: 'var(--cc-tx-1)' }}>Level {user.level}</span>
                                <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>{formatXP(lvl.current)} / {formatXP(lvl.required)} XP · {formatXP(lvl.required - lvl.current)} to Level {user.level + 1}</span>
                            </div>
                            <Progress value={lvl.percentage} className="h-2.5" aria-label={`Level ${user.level}, ${lvl.percentage}% to next`} />

                            <div className="grid grid-cols-3 mt-6">
                                {[
                                    { icon: ProgrammingFlagIcon, label: 'Problems', value: completedProblems.size, color: 'text-sky-300' },
                                    { icon: BookOpen01Icon, label: 'Lessons', value: completedLessons.size, color: 'text-lime-300' },
                                    { icon: FireIcon, label: 'Streak', value: `${user.streakCurrent}d`, color: 'text-orange-300' },
                                ].map((s, i) => (
                                    <div key={s.label} className="flex items-center gap-3 px-2" style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--cc-border)' }}>
                                        <span className={`cc-icon-well w-9 h-9 shrink-0 ${s.color}`}><HugeiconsIcon icon={s.icon} size={18} strokeWidth={1.8} /></span>
                                        <div className="min-w-0">
                                            <div className="cc-mono text-xl font-bold leading-none" style={{ color: 'var(--cc-tx-1)' }}>{s.value}</div>
                                            <div className="cc-eyebrow mt-1">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verification rating + skill profile (Bug Arena) */}
                        <VerificationSection />

                        {/* Contribution graph */}
                        <div className="cc-glass p-6 md:p-7" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>Contribution graph</h2>
                                <span className="cc-eyebrow">Last 12 months</span>
                            </div>
                            <ContributionGraph />
                        </div>

                        {/* Language progress */}
                        <section className="space-y-4">
                            <h2 className="text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>Progress by language</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 cc-stagger">
                                {(langData ?? LANGS.map((l) => ({ ...l, pct: 0, done: 0, total: 0, lessonsDone: 0, lessonsTotal: 0, problemsDone: 0, problemsTotal: 0 }))).map((l) => (
                                    <div key={l.label} className="cc-glass cc-glass-interactive p-5 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>
                                                <span style={{ width: 9, height: 9, borderRadius: 999, background: l.dot }} /> {l.label}
                                            </span>
                                            <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>{l.done}/{l.total || '—'}</span>
                                        </div>
                                        <Progress value={l.pct} className="h-2" aria-label={`${l.label}: ${l.pct}%`} />
                                        <div className="flex items-center gap-4 cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                                            <span>Lessons {l.lessonsDone}/{l.lessonsTotal}</span>
                                            <span>Problems {l.problemsDone}/{l.problemsTotal}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div key="settings" className="cc-stagger space-y-10">
                        {/* Account */}
                        <div className="cc-glass p-6 md:p-7" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--cc-tx-1)' }}>Account</h2>
                            <p className="text-sm mb-4" style={{ color: 'var(--cc-tx-3)' }}>Change the email tied to your account.</p>
                            <div className="flex flex-col sm:flex-row gap-2.5 max-w-lg">
                                <div className="cc-search flex-1" style={{ height: 40 }}>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="new.email@example.com"
                                        aria-label="New email address"
                                        className="flex-1 bg-transparent outline-none text-sm"
                                        style={{ color: 'var(--cc-tx-1)' }}
                                    />
                                </div>
                                <Button
                                    size="md"
                                    disabled={updating || !newEmail}
                                    onClick={async () => { if (!newEmail) return; setUpdating(true); await updateEmail(newEmail); setUpdating(false); setNewEmail(''); }}
                                >
                                    {updating ? 'Updating…' : 'Update Email'}
                                </Button>
                            </div>
                            <p className="text-xs mt-2.5" style={{ color: 'var(--cc-tx-3)' }}>You’ll get a confirmation link at the new address.</p>
                        </div>

                        {/* AI features */}
                        <div className="cc-glass p-6 md:p-7" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--cc-tx-1)' }}>
                                    <HugeiconsIcon icon={SparklesIcon} size={16} /> AI features
                                </h2>
                                <span className="cc-pill text-[11px]" style={aiEnabled ? { color: 'var(--cc-ac)', borderColor: 'rgba(74,222,128,.25)', backgroundColor: 'rgba(74,222,128,.1)' } : { color: 'var(--cc-tx-3)' }}>
                                    {aiEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>

                            <button
                                onClick={() => setAiOpen((o) => !o)}
                                aria-expanded={aiOpen}
                                className="mt-4 w-full flex items-center justify-between text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 rounded-lg"
                                style={{ color: 'var(--cc-tx-2)' }}
                            >
                                What AI features are enabled?
                                <HugeiconsIcon icon={ArrowDown01Icon} size={16} style={{ transform: aiOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--cc-dur-1) var(--cc-ease)' }} />
                            </button>
                            <div className="cc-collapsible" data-open={aiOpen}>
                                <div className="cc-collapsible-inner">
                                    <ul className="pt-3 space-y-2">
                                        {['Smart Hint System — gentle nudges toward solutions', 'Intelligent Code Review — feedback on your solutions', 'Learning Analytics — insights into your progress'].map((f) => (
                                            <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                                                <span className="mt-1.5 shrink-0" style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--cc-brand-2)' }} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                            <button onClick={() => setTab('overview')} className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[var(--cc-tx-1)]">
                                <HugeiconsIcon icon={ArrowRight01Icon} size={14} style={{ transform: 'rotate(180deg)' }} /> Back to overview
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
