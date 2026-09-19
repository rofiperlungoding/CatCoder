import { Globe, Server, CodeIcon, ArrowRight01Icon, SquareLock02Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Surface, Button as CcButton, Progress } from '../../components/ds';
import { useUserStore, useProgressStore } from '../../stores';
import { loadAllLessons } from '../../data/lessons';
import type { Lesson, Language } from '../../types';

const UNLOCK_LEVEL = 5;

const LANGS: Language[] = ['python', 'javascript', 'cpp'];
const LANG_LABEL: Record<string, string> = { python: 'Python', javascript: 'JavaScript', cpp: 'C++' };
const LANG_BLURB: Record<string, string> = {
    python: 'Syntax, control flow, and core data structures from the ground up.',
    javascript: 'The language of the web — variables, functions, and the DOM.',
    cpp: 'A strong foundation in C++ and systems-level thinking.',
};
const LANG_META: Record<string, { mono: string; accentClass: string; wm: string }> = {
    python: { mono: 'Py', accentClass: 'text-sky-300', wm: 'rgba(125,211,252,.08)' },
    javascript: { mono: 'JS', accentClass: 'text-amber-300', wm: 'rgba(252,211,77,.08)' },
    cpp: { mono: 'C++', accentClass: 'text-rose-300', wm: 'rgba(253,164,175,.08)' },
};

const TEASERS = [
    { icon: Globe, title: 'Python Fundamentals' },
    { icon: Server, title: 'JavaScript Fundamentals' },
    { icon: CodeIcon, title: 'C++ Fundamentals' },
];

/** Cumulative XP required to first reach `target` level (mirrors utils.calculateLevel). */
function xpToReachLevel(target: number): number {
    let total = 0;
    let req = 100;
    for (let lvl = 1; lvl < target; lvl++) {
        total += req;
        req = Math.floor(req * 1.5);
    }
    return total;
}

const GhostTrack: React.FC<{ icon: typeof Globe; title: string }> = ({ icon, title }) => (
    <div className="cc-card cc-e1 p-5 flex flex-col gap-4 select-none" style={{ background: 'var(--cc-surface-2)' }}>
        <div className="flex items-start justify-between">
            <span className="cc-icon-well w-11 h-11 text-lime-300"><HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} /></span>
            <HugeiconsIcon icon={SquareLock02Icon} size={16} style={{ color: 'var(--cc-tx-3)' }} />
        </div>
        <div>
            <div className="text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>{title}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--cc-tx-2)' }}>Structured path</div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
            {[0, 1, 2, 3, 4].map((n) => (
                <React.Fragment key={n}>
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: n === 0 ? 'var(--cc-brand-2)' : 'var(--cc-surface-3)' }} />
                    {n < 4 && <span className="flex-1" style={{ height: 2, background: 'var(--cc-surface-3)' }} />}
                </React.Fragment>
            ))}
        </div>
    </div>
);

interface TrackStat {
    lang: Language;
    total: number;
    done: number;
    units: number;
}

const TrackCard: React.FC<{ stat: TrackStat; onOpen: () => void }> = ({ stat, onOpen }) => {
    const meta = LANG_META[stat.lang];
    const pct = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
    const started = pct > 0;
    const complete = pct === 100;
    return (
        <Surface elevation={1} className="relative overflow-hidden p-6 flex flex-col gap-4">
            <span aria-hidden="true" className="cc-mono font-bold pointer-events-none select-none"
                style={{ position: 'absolute', right: 12, bottom: -14, fontSize: '4.5rem', lineHeight: 1, color: meta.wm }}>
                {meta.mono}
            </span>
            <div className="relative flex items-start justify-between">
                <span className={`cc-icon-well w-11 h-11 cc-mono text-sm font-bold ${meta.accentClass}`}>{meta.mono}</span>
                <span className="cc-pill text-[11px]" style={complete ? { color: 'var(--cc-brand-1)', borderColor: 'rgba(163,230,53,.25)', backgroundColor: 'rgba(163,230,53,.12)' } : undefined}>
                    {complete && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />}
                    {complete ? 'Completed' : started ? 'In progress' : 'Not started'}
                </span>
            </div>
            <div className="relative">
                <h3 className="text-[17px] font-bold" style={{ color: 'var(--cc-tx-1)' }}>{LANG_LABEL[stat.lang]} Fundamentals</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>{LANG_BLURB[stat.lang]}</p>
            </div>
            <div className="relative mt-auto space-y-2">
                {started && <Progress value={pct} className="h-1.5" aria-label={`${LANG_LABEL[stat.lang]}: ${pct}%`} />}
                <div className="flex items-center justify-between">
                    <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                        {stat.total > 0 ? `${stat.total} lessons · ${stat.units} stage${stat.units === 1 ? '' : 's'}` : 'Coming soon'}
                    </span>
                    <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-2)' }}>{started ? `${pct}%` : ''}</span>
                </div>
                <CcButton variant="secondary" size="sm" fullWidth onClick={onOpen} disabled={stat.total === 0}>
                    {complete ? 'Review' : started ? 'Continue' : 'Start'} <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </CcButton>
            </div>
        </Surface>
    );
};

export const RoadmapPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, setSelectedLanguage } = useUserStore();
    const { isCompleted } = useProgressStore();
    const userLevel = user?.level || 1;
    const isUnlocked = userLevel >= UNLOCK_LEVEL;

    const [allLessons, setAllLessons] = useState<Lesson[] | null>(null);
    useEffect(() => {
        let mounted = true;
        loadAllLessons().then((l) => { if (mounted) setAllLessons(l); }).catch(() => { if (mounted) setAllLessons([]); });
        return () => { mounted = false; };
    }, []);

    const tracks: TrackStat[] = useMemo(() => {
        const ls = allLessons ?? [];
        return LANGS.map((lang) => {
            const forLang = ls.filter((l) => l.language === lang);
            return {
                lang,
                total: forLang.length,
                done: forLang.filter((l) => isCompleted('lesson', l.id)).length,
                units: new Set(forLang.map((l) => l.tier)).size,
            };
        });
    }, [allLessons, isCompleted]);

    const openTrack = (lang: Language) => {
        setSelectedLanguage(lang);
        navigate('/learn');
    };

    const levelsToGo = Math.max(0, UNLOCK_LEVEL - userLevel);
    const xpRemaining = Math.max(0, xpToReachLevel(UNLOCK_LEVEL) - (user?.xp ?? 0));

    return (
        <div className="cc-root max-w-[1120px] mx-auto space-y-10">
            <header>
                <span className="cc-eyebrow">Roadmap</span>
                <h1 className="text-3xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>Learning paths</h1>
                <p className="text-sm mt-1.5" style={{ color: 'var(--cc-tx-2)' }}>Structured paths to guide your learning journey.</p>
            </header>

            {!isUnlocked ? (
                <div className="relative overflow-hidden" style={{ borderRadius: 'var(--cc-r-xl)', minHeight: 540 }}>
                    <div aria-hidden="true" className="absolute inset-0 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 content-start" style={{ filter: 'blur(7px)', opacity: 0.4, pointerEvents: 'none' }}>
                        {TEASERS.map((t) => <GhostTrack key={t.title} icon={t.icon} title={t.title} />)}
                    </div>
                    <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 42%, rgba(10,11,13,.55), rgba(10,11,13,.92) 75%)' }} />

                    <div className="relative z-10 flex items-center justify-center p-6" style={{ minHeight: 540 }}>
                        <Surface elevation={2} glow className="cc-pop-panel w-full max-w-[520px] p-8 text-center" style={{ background: 'rgba(24,26,30,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                            <div className="cc-icon-well w-16 h-16 mx-auto text-lime-300" style={{ background: 'var(--cc-surface-3)', boxShadow: 'var(--cc-e1)', border: '1px solid rgba(163,230,53,.22)' }} aria-hidden="true">
                                <HugeiconsIcon icon={SquareLock02Icon} size={28} />
                            </div>
                            <h2 className="text-2xl font-bold mt-5" style={{ color: 'var(--cc-tx-1)' }}>Unlock paths at Level {UNLOCK_LEVEL}</h2>
                            <p className="text-sm mt-2 mb-6 mx-auto max-w-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                                Reach Level {UNLOCK_LEVEL} to open the full structured learning paths.
                            </p>
                            <div className="text-left">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="cc-eyebrow" style={{ color: 'var(--cc-brand-1)' }}>Current · Level {userLevel}</span>
                                    <span className="cc-eyebrow">Target · Level {UNLOCK_LEVEL}</span>
                                </div>
                                <Progress value={userLevel} max={UNLOCK_LEVEL} className="h-2.5" aria-label={`Level ${userLevel} of ${UNLOCK_LEVEL}`} />
                                <p className="cc-mono text-xs mt-2 text-center" style={{ color: 'var(--cc-tx-3)' }}>
                                    {levelsToGo} level{levelsToGo === 1 ? '' : 's'} to go · ~{xpRemaining.toLocaleString()} XP
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-6">
                                <CcButton size="lg" onClick={() => navigate('/learn')}>Keep learning <HugeiconsIcon icon={ArrowRight01Icon} size={18} /></CcButton>
                                <CcButton variant="secondary" size="lg" onClick={() => navigate('/practice')}>Solve problems</CcButton>
                            </div>
                            <p className="text-xs mt-5" style={{ color: 'var(--cc-tx-3)', lineHeight: 1.6 }}>
                                Earn XP from lessons <span style={{ color: 'var(--cc-tx-2)' }}>+50</span>, problems <span style={{ color: 'var(--cc-tx-2)' }}>+100</span>, and daily challenges <span style={{ color: 'var(--cc-tx-2)' }}>+150</span>.
                            </p>
                        </Surface>
                    </div>
                </div>
            ) : (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 cc-stagger">
                    {tracks.map((stat) => (
                        <TrackCard key={stat.lang} stat={stat} onOpen={() => openTrack(stat.lang)} />
                    ))}
                </section>
            )}
        </div>
    );
};
