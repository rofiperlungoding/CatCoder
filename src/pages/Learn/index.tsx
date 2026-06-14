import {
    CheckmarkCircle02Icon, ArrowRight01Icon, ArrowDown01Icon, BookOpen01Icon,
    Clock01Icon, SquareLock01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Surface, Button, Progress } from '../../components/ds';
import { LoadingSpinner } from '../../components/ui';
import { useUserStore, useProgressStore } from '../../stores';
import type { Lesson, Language } from '../../types';
import { loadLessonsByLanguage, loadLessonById, loadAllLessons } from '../../data/lessons';
import { LessonCarousel } from './LessonCarousel';

const LANG_LABEL: Record<string, string> = { python: 'Python', javascript: 'JavaScript', cpp: 'C++' };
const LANG_BLURB: Record<string, string> = {
    python: 'Syntax, control flow, and core data structures from the ground up.',
    javascript: 'The language of the web — variables, functions, and the DOM.',
    cpp: 'A strong foundation in C++ and systems-level thinking.',
};
const TIER_NAME: Record<number, string> = { 1: 'Seedling', 2: 'Sprout', 3: 'Growing', 4: 'Mature', 5: 'Expert' };
const LANGS: Language[] = ['python', 'javascript', 'cpp'];

/** Per-language identity for the track shelf (monogram + accent hue). */
const LANG_META: Record<string, { mono: string; accentClass: string; wm: string }> = {
    python: { mono: 'Py', accentClass: 'text-sky-300', wm: 'rgba(125,211,252,.08)' },
    javascript: { mono: 'JS', accentClass: 'text-amber-300', wm: 'rgba(252,211,77,.08)' },
    cpp: { mono: 'C++', accentClass: 'text-rose-300', wm: 'rgba(253,164,175,.08)' },
};

type Status = 'completed' | 'current' | 'upcoming' | 'locked';

// ── Track card ──────────────────────────────────────────────────────────────
const TrackCard: React.FC<{
    lang: Language; active: boolean; done: number; total: number; units: number; onSelect: () => void;
}> = ({ lang, active, done, total, units, onSelect }) => {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const started = pct > 0;
    const meta = LANG_META[lang];
    const tag = pct === 100 ? 'Completed' : started ? 'In progress' : 'Not started';

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={active}
            className="cc-card cc-e1 cc-lift relative overflow-hidden text-left p-6 flex flex-col gap-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
            style={{
                borderColor: active ? 'rgba(163,230,53,.25)' : undefined,
                boxShadow: active ? 'var(--cc-e1), var(--cc-glow-brand)' : undefined,
            }}
        >
            {/* Big language monogram watermark — the card's identity */}
            <span
                aria-hidden="true"
                className="cc-mono font-bold pointer-events-none select-none"
                style={{ position: 'absolute', right: 12, bottom: -14, fontSize: '4.5rem', lineHeight: 1, color: meta.wm }}
            >
                {meta.mono}
            </span>
            {active && (
                <span
                    aria-hidden="true"
                    style={{
                        position: 'absolute', left: 0, top: 16, bottom: 16, width: 3, borderRadius: 999,
                        background: 'linear-gradient(180deg,var(--cc-brand-1),var(--cc-brand-2))',
                        boxShadow: '0 0 8px rgba(163,230,53,.55)',
                    }}
                />
            )}

            <div className="relative flex items-start justify-between">
                <span className={`cc-icon-well w-11 h-11 cc-mono text-sm font-bold ${meta.accentClass}`}>{meta.mono}</span>
                <span
                    className="cc-pill text-[11px]"
                    style={started && active ? { color: 'var(--cc-brand-1)', borderColor: 'rgba(163,230,53,.25)', backgroundColor: 'rgba(163,230,53,.12)' } : undefined}
                >
                    {pct === 100 && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />}
                    {tag}
                </span>
            </div>

            <div className="relative">
                <h3 className="text-[17px] font-bold" style={{ color: 'var(--cc-tx-1)' }}>{LANG_LABEL[lang]} Fundamentals</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>{LANG_BLURB[lang]}</p>
            </div>

            <div className="relative mt-auto space-y-2">
                {started && <Progress value={pct} className="h-1.5" aria-label={`${LANG_LABEL[lang]}: ${done} of ${total} lessons, ${pct}%`} />}
                <div className="flex items-center justify-between">
                    <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                        {total > 0 ? `${total} lessons · ${units} unit${units === 1 ? '' : 's'}` : 'Coming soon'}
                    </span>
                    {started ? (
                        <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-2)' }}>{pct}%</span>
                    ) : total > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--cc-tx-2)' }}>
                            Start <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                        </span>
                    ) : null}
                </div>
            </div>
        </button>
    );
};

// ── Lesson row ───────────────────────────────────────────────────────────────
const LessonRow: React.FC<{ lesson: Lesson; status: Status; onOpen: () => void }> = ({ lesson, status, onOpen }) => {
    const locked = status === 'locked';
    const type = lesson.sections?.[0]?.type ?? 'Lesson';
    const node = (
        <span className={`cc-node ${status === 'completed' ? 'cc-node-done' : status === 'current' ? 'cc-node-current' : status === 'locked' ? 'cc-node-locked' : 'cc-node-upcoming'}`}>
            {status === 'completed' && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />}
            {status === 'current' && <span className="cc-node-dot" />}
            {status === 'locked' && <HugeiconsIcon icon={SquareLock01Icon} size={13} />}
        </span>
    );
    return (
        <button
            type="button"
            onClick={locked ? undefined : onOpen}
            disabled={locked}
            aria-disabled={locked}
            aria-label={locked ? `${lesson.title} — locked, complete previous lessons to unlock` : lesson.title}
            className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 disabled:cursor-not-allowed"
            style={{
                opacity: locked ? 0.55 : 1,
                backgroundColor: status === 'current' ? 'rgba(163,230,53,.06)' : 'transparent',
            }}
            onMouseEnter={(e) => { if (!locked && status !== 'current') e.currentTarget.style.backgroundColor = 'var(--cc-surface-2)'; }}
            onMouseLeave={(e) => { if (status !== 'current') e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
            {node}
            <span className="flex-1 min-w-0 text-sm truncate" style={{ color: status === 'upcoming' || locked ? 'var(--cc-tx-2)' : 'var(--cc-tx-1)', fontWeight: status === 'current' ? 600 : 400 }}>
                {lesson.title}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-xs cc-mono" style={{ color: 'var(--cc-tx-3)' }}>
                <HugeiconsIcon icon={Clock01Icon} size={13} /> ~{lesson.estimatedTime}m
            </span>
            <span className="cc-pill cc-mono text-[11px]">+{lesson.xpReward}</span>
            <span className="cc-pill text-[11px] capitalize hidden md:inline-flex">{type}</span>
        </button>
    );
};

// ── Unit block (accordion) ─────────────────────────────────────────────────
const UnitBlock: React.FC<{
    index: number; tier: number; lessons: Lesson[]; statusOf: (id: string) => Status;
    open: boolean; onToggle: () => void; onOpenLesson: (id: string) => void;
}> = ({ index, tier, lessons, statusOf, open, onToggle, onOpenLesson }) => {
    const done = lessons.filter((l) => statusOf(l.id) === 'completed').length;
    return (
        <Surface elevation={1} className="overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="w-full flex items-center gap-3 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
            >
                <span className="cc-icon-well w-9 h-9 cc-mono text-sm font-bold shrink-0" style={{ color: 'var(--cc-tx-2)' }}>
                    {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <span className="cc-eyebrow">Unit {index + 1}</span>
                    <h3 className="text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>{TIER_NAME[tier]}</h3>
                </div>
                <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>{done}/{lessons.length}</span>
                <HugeiconsIcon
                    icon={ArrowDown01Icon} size={18}
                    style={{ color: 'var(--cc-tx-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease-out' }}
                />
            </button>

            <div className="cc-collapsible" data-open={open}>
                <div className="cc-collapsible-inner">
                    <div className="cc-lessonpath px-3 pb-4 pt-0 space-y-0.5">
                        {lessons.map((l) => (
                            <LessonRow key={l.id} lesson={l} status={statusOf(l.id)} onOpen={() => onOpenLesson(l.id)} />
                        ))}
                    </div>
                </div>
            </div>
        </Surface>
    );
};

export const LearnPage: React.FC = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { selectedLanguage, setSelectedLanguage } = useUserStore();
    const { isCompleted } = useProgressStore();

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loadingLessons, setLoadingLessons] = useState(true);
    const [allLessons, setAllLessons] = useState<Lesson[] | null>(null);
    const [openTiers, setOpenTiers] = useState<Record<number, boolean>>({});

    useEffect(() => {
        let mounted = true;
        const fetchLessons = async () => {
            setLoadingLessons(true);
            try {
                if (lessonId) {
                    const specificLesson = await loadLessonById(lessonId);
                    if (specificLesson && mounted && selectedLanguage !== specificLesson.language) {
                        setSelectedLanguage(specificLesson.language as Language);
                    }
                }
                const loaded = await loadLessonsByLanguage(selectedLanguage);
                if (mounted) setLessons(loaded);
            } catch (error) {
                console.error('Failed to load lessons', error);
            } finally {
                if (mounted) setLoadingLessons(false);
            }
        };
        fetchLessons();
        return () => { mounted = false; };
    }, [selectedLanguage, lessonId, setSelectedLanguage]);

    useEffect(() => {
        let mounted = true;
        loadAllLessons().then((a) => { if (mounted) setAllLessons(a); }).catch(() => { if (mounted) setAllLessons([]); });
        return () => { mounted = false; };
    }, []);

    const activeLesson = useMemo(
        () => (lessonId ? lessons.find((l) => l.id === lessonId) || null : null),
        [lessonId, lessons],
    );

    // Ordered lessons (tier asc, authored order within tier) + status map.
    const ordered = useMemo(() => [...lessons].sort((a, b) => a.tier - b.tier), [lessons]);
    const { statusMap, currentLesson } = useMemo(() => {
        const completed = new Set(ordered.filter((l) => isCompleted('lesson', l.id)).map((l) => l.id));
        const map: Record<string, Status> = {};
        let currentAssigned = false;
        let current: Lesson | null = null;
        for (const l of ordered) {
            if (completed.has(l.id)) { map[l.id] = 'completed'; continue; }
            const locked = (l.prerequisites ?? []).some((p) => !completed.has(p));
            if (locked) { map[l.id] = 'locked'; continue; }
            if (!currentAssigned) { map[l.id] = 'current'; currentAssigned = true; current = l; continue; }
            map[l.id] = 'upcoming';
        }
        return { statusMap: map, currentLesson: current };
    }, [ordered, isCompleted]);

    const units = useMemo(() => {
        const byTier = new Map<number, Lesson[]>();
        for (const l of ordered) {
            if (!byTier.has(l.tier)) byTier.set(l.tier, []);
            byTier.get(l.tier)!.push(l);
        }
        return [...byTier.entries()].sort(([a], [b]) => a - b).map(([tier, ls]) => ({ tier, lessons: ls }));
    }, [ordered]);

    // Default-open the unit containing the current lesson (or the first unit).
    useEffect(() => {
        if (units.length === 0) return;
        const focalTier = currentLesson?.tier ?? units[0].tier;
        setOpenTiers((prev) => (Object.keys(prev).length ? prev : { [focalTier]: true }));
    }, [units, currentLesson]);

    const doneCount = ordered.filter((l) => statusMap[l.id] === 'completed').length;
    const totalCount = ordered.length;
    const coursePct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const heroNext = currentLesson ?? ordered[0] ?? null;

    const langStats = (lang: Language) => {
        const ls = (allLessons ?? []).filter((l) => l.language === lang);
        return {
            done: ls.filter((l) => isCompleted('lesson', l.id)).length,
            total: ls.length,
            units: new Set(ls.map((l) => l.tier)).size,
        };
    };

    // ── Branches: loading / 404 / lesson detail ──────────────────────────────
    if (loadingLessons && lessonId) {
        return (
            <div className="cc-root flex min-h-[70vh] items-center justify-center">
                <LoadingSpinner size={48} className="text-lime-400" />
            </div>
        );
    }

    if (lessonId && !loadingLessons && !activeLesson) {
        return (
            <div className="cc-root flex flex-col items-center justify-center min-h-[70vh] gap-5 text-center px-6 max-w-[1120px] mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>Lesson not found</h1>
                <p className="max-w-md" style={{ color: 'var(--cc-tx-2)' }}>
                    We couldn&apos;t find a lesson with id{' '}
                    <code className="cc-mono text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--cc-surface-3)' }}>{lessonId}</code>.
                </p>
                <Button onClick={() => navigate('/learn', { replace: true })}>Browse all lessons</Button>
            </div>
        );
    }

    if (activeLesson) {
        return (
            <LessonCarousel
                key={activeLesson.id}
                activeLesson={activeLesson}
                onComplete={() => navigate('/learn')}
                onBack={() => navigate('/learn')}
            />
        );
    }

    // ── List view ─────────────────────────────────────────────────────────────
    return (
        <div className="cc-root max-w-[1120px] mx-auto space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="cc-eyebrow">Learn</span>
                    <h1 className="text-3xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>Keep learning</h1>
                </div>
                {/* Language segmented control (ghost chips) */}
                <div className="flex items-center gap-1.5" role="group" aria-label="Choose language">
                    {LANGS.map((lang) => {
                        const active = selectedLanguage === lang;
                        return (
                            <Button
                                key={lang}
                                variant={active ? 'secondary' : 'ghost'}
                                size="sm"
                                aria-pressed={active}
                                onClick={() => setSelectedLanguage(lang)}
                                style={active ? { color: 'var(--cc-brand-1)' } : undefined}
                            >
                                {LANG_LABEL[lang]}
                            </Button>
                        );
                    })}
                </div>
            </header>

            {/* Continue-learning hero (matches the live Dashboard hero) */}
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
                    {doneCount === 0 || !heroNext
                        ? 'Start your first lesson and begin your streak.'
                        : <>Up next — <span style={{ color: 'var(--cc-tx-1)', fontWeight: 600 }}>{heroNext.title}</span></>}
                </p>

                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="cc-eyebrow">Progress</span>
                        <span className="cc-mono" style={{ color: 'var(--cc-tx-2)' }}>{coursePct}% · {doneCount}/{totalCount || '—'}</span>
                    </div>
                    <Progress value={coursePct} className="h-2" aria-label={`Course progress: ${doneCount} of ${totalCount} lessons, ${coursePct}%`} />
                </div>

                <Button size="lg" onClick={() => heroNext && navigate(`/learn/${heroNext.id}`)} disabled={!heroNext}>
                    {doneCount === 0 ? 'Start' : 'Resume'} <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </Button>
            </Surface>

            {/* Tracks */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>Tracks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 cc-stagger">
                    {LANGS.map((lang) => {
                        const { done, total, units } = langStats(lang);
                        return (
                            <TrackCard
                                key={lang}
                                lang={lang}
                                active={selectedLanguage === lang}
                                done={done}
                                total={total}
                                units={units}
                                onSelect={() => setSelectedLanguage(lang)}
                            />
                        );
                    })}
                </div>
            </section>

            {/* Lesson path */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                    {LANG_LABEL[selectedLanguage] ?? selectedLanguage} Fundamentals
                    <span style={{ color: 'var(--cc-tx-3)', fontWeight: 400 }}> · Path</span>
                </h2>

                {loadingLessons ? (
                    <Surface elevation={1} className="p-8 text-center text-sm" >
                        <span style={{ color: 'var(--cc-tx-3)' }}>Loading lessons…</span>
                    </Surface>
                ) : units.length === 0 ? (
                    <Surface elevation={1} className="p-8 text-center">
                        <p className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>No lessons here yet — check back soon.</p>
                    </Surface>
                ) : (
                    <div className="space-y-4 cc-stagger">
                        {units.map((u, i) => (
                            <UnitBlock
                                key={u.tier}
                                index={i}
                                tier={u.tier}
                                lessons={u.lessons}
                                statusOf={(id) => statusMap[id] ?? 'upcoming'}
                                open={!!openTiers[u.tier]}
                                onToggle={() => setOpenTiers((p) => ({ ...p, [u.tier]: !p[u.tier] }))}
                                onOpenLesson={(id) => navigate(`/learn/${id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
