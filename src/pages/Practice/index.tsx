import {
    SparklesIcon, CheckmarkCircle02Icon, Lightbulb, Search01Icon, Trophy, ArrowRight01Icon,
    CodeIcon, ComputerTerminal01Icon, PlayIcon, EnergyIcon, ArrowLeft01Icon, ArrowDown01Icon, FireIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui';
import { Surface, Button as CcButton, Pill } from '../../components/ds';
import { CodeEditor } from '../../components/editor';
import { useProgressStore, useUIStore, useUserStore } from '../../stores';
import { useCodeRunner } from '../../hooks';
import type { Problem, User } from '../../types';
import { problems as problemsData } from '../../data/problems';
import { analytics } from '../../services/analytics';
import AIUsageIndicator from '../../components/ai/AIUsageIndicator';

const LANG_LABEL: Record<string, string> = { python: 'Python', javascript: 'JavaScript', cpp: 'C++' };
const DIFF: Record<string, { label: string; color: string; tint: string }> = {
    easy: { label: 'Easy', color: 'var(--cc-ac)', tint: 'rgba(74,222,128,.12)' },
    medium: { label: 'Medium', color: 'var(--cc-tle)', tint: 'rgba(251,191,36,.12)' },
    hard: { label: 'Hard', color: 'var(--cc-wa)', tint: 'rgba(251,113,133,.12)' },
};
const DIFF_RANK: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const SORTS = [
    { id: 'difficulty', label: 'Difficulty' },
    { id: 'xp', label: 'XP reward' },
    { id: 'title', label: 'A–Z' },
] as const;
type SortId = typeof SORTS[number]['id'];
type RowStatus = 'solved' | 'todo';

function cleanDesc(md: string): string {
    return md.replace(/[*`#>]/g, '').replace(/^\s*description[:\s-]*/i, '').replace(/\s+/g, ' ').trim();
}

function dailyProblem(): Problem | null {
    if (problemsData.length === 0) return null;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return problemsData[dayOfYear % problemsData.length];
}

function starterFor(problem: Problem, language: string): string {
    const fallback = language === 'python' ? '# Write your code here\n' : '// Write your code here\n';
    return problem.starterCode?.[language as keyof typeof problem.starterCode] || fallback;
}

// ── Problem solver ────────────────────────────────────────────────────────
interface ChallengeSolverProps {
    problem: Problem;
    language: string;
    onLanguageChange: (lang: string) => void;
    onBack: () => void;
    user: User | null;
    addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
    isCompleted: (type: 'lesson' | 'problem' | 'challenge', id: string) => boolean;
    validateAndComplete: (
        contentType: 'problem' | 'lesson' | 'challenge',
        contentId: string,
        language: string,
        durationSeconds?: number
    ) => Promise<{ success: boolean; xp_awarded?: number; message?: string; error?: string }>;
}

function renderMarkdown(content: string): React.ReactNode {
    return (
        <div className="whitespace-pre-line">
            {content.split('```').map((part, i) => {
                if (i % 2 === 1) {
                    const lines = part.split('\n');
                    const codeContent = lines.slice(1).join('\n');
                    return (
                        <pre key={i} className="cc-mono text-sm my-4 p-4 rounded-xl overflow-x-auto" style={{ background: 'var(--cc-surface-1)', color: 'var(--cc-tx-2)', boxShadow: 'var(--cc-well)' }}>
                            {codeContent}
                        </pre>
                    );
                }
                return (
                    <span key={i}>
                        {part.split(/(\*\*.*?\*\*|`[^`]+`)/).map((chunk, j) => {
                            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                return <strong key={j} style={{ color: 'var(--cc-tx-1)', fontWeight: 700 }}>{chunk.slice(2, -2)}</strong>;
                            }
                            if (chunk.startsWith('`') && chunk.endsWith('`')) {
                                return <code key={j} className="cc-mono text-sm px-1.5 py-0.5 rounded mx-0.5" style={{ background: 'var(--cc-surface-3)', color: 'var(--cc-brand-1)' }}>{chunk.slice(1, -1)}</code>;
                            }
                            return chunk;
                        })}
                    </span>
                );
            })}
        </div>
    );
}

const ChallengeSolver: React.FC<ChallengeSolverProps> = ({
    problem, language, onLanguageChange, onBack, user, addToast, isCompleted, validateAndComplete,
}) => {
    const [code, setCode] = useState<string>(() => starterFor(problem, language));
    const [startTime] = useState<number>(() => Date.now());
    const [langOpen, setLangOpen] = useState(false);
    const { terminalLogs, isRunning, isValidated, validationError, runCode } = useCodeRunner();

    useEffect(() => {
        analytics.logEvent('problem_viewed', { problemId: problem.id, title: problem.title });
    }, [problem.id, problem.title]);

    const handleRunAndCheck = async () => {
        const langKey = language as 'python' | 'javascript' | 'cpp';
        const expectedOutput = problem.testCases[langKey]?.[0]?.expectedOutput;
        analytics.logEvent('code_run', { problemId: problem.id, language });

        const passed = await runCode(code, language, expectedOutput);
        if (!passed) return;

        const solveTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(solveTimeSeconds / 60);
        const s = solveTimeSeconds % 60;
        const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
        analytics.logEvent('problem_solved', { problemId: problem.id, language, duration: solveTimeSeconds });

        if (!user) { addToast('error', 'Sign in to save your progress.'); return; }
        if (isCompleted('problem', problem.id)) { addToast('success', `Solved again in ${timeStr}.`); return; }

        const result = await validateAndComplete('problem', problem.id, language, solveTimeSeconds);
        if (result.success) {
            if (result.xp_awarded && result.xp_awarded > 0) addToast('success', `Solved in ${timeStr}. +${result.xp_awarded} XP`);
            else addToast('success', `Solved in ${timeStr}.`);
        } else {
            addToast('warning', 'Solved locally, server verification pending.');
        }
    };

    const dm = DIFF[problem.difficulty] ?? DIFF.easy;

    return (
        <div className="cc-root min-h-screen pb-16">
            {/* Sticky header */}
            <div className="sticky top-0 z-30 mb-6" style={{ background: 'rgba(10,11,13,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--cc-border)' }}>
                <div className="max-w-[1180px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <CcButton variant="ghost" size="sm" onClick={onBack}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> All problems
                    </CcButton>
                    <h1 className="font-bold truncate" style={{ color: 'var(--cc-tx-1)' }}>{problem.title}</h1>
                    <div className="relative">
                        <CcButton variant="secondary" size="sm" onClick={() => setLangOpen((o) => !o)} aria-haspopup="menu" aria-expanded={langOpen}>
                            {LANG_LABEL[language] ?? language}
                            <HugeiconsIcon icon={ArrowDown01Icon} size={14} style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--cc-dur-1) var(--cc-ease)' }} />
                        </CcButton>
                        {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
                        <div className="cc-dropdown" data-open={langOpen} role="menu" style={{ minWidth: 150 }}>
                            <div className="cc-dropdown-inner">
                                {problem.languages.map((l) => (
                                    <button
                                        key={l}
                                        role="menuitem"
                                        tabIndex={langOpen ? 0 : -1}
                                        onClick={() => { setLangOpen(false); if (l !== language) onLanguageChange(l); }}
                                        className={`cc-subnav-item ${l === language ? 'cc-subnav-item-active' : ''}`}
                                        style={{ width: '100%', paddingLeft: '0.5rem' }}
                                    >
                                        <span className="cc-subnav-dot" />{LANG_LABEL[l] ?? l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: problem brief */}
                <div className="space-y-5">
                    <Surface elevation={2} className="p-7">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Pill><span style={{ color: dm.color }} className="capitalize">{problem.difficulty}</span></Pill>
                                <Pill>Tier {problem.tier}</Pill>
                            </div>
                            <Pill variant="brand" className="cc-mono"><HugeiconsIcon icon={Trophy} size={12} /> +{problem.xpReward} XP</Pill>
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--cc-tx-1)' }}>{problem.title}</h2>
                        <div className="text-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.7 }}>
                            {renderMarkdown(problem.description)}
                        </div>
                    </Surface>

                    <Surface elevation={1} className="p-6">
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--cc-tx-1)' }}>
                            <HugeiconsIcon icon={SparklesIcon} size={16} style={{ color: 'var(--cc-brand-1)' }} /> Examples
                        </h3>
                        <div className="space-y-3">
                            {problem.examples.map((ex, i) => (
                                <div key={i} className="rounded-xl p-4 cc-mono text-xs" style={{ background: 'var(--cc-surface-1)', boxShadow: 'var(--cc-well)' }}>
                                    <div className="mb-2">
                                        <span className="cc-eyebrow">Input</span>
                                        <div className="mt-1" style={{ color: 'var(--cc-tx-1)' }}>{ex.input}</div>
                                    </div>
                                    <div>
                                        <span className="cc-eyebrow">Output</span>
                                        <div className="mt-1" style={{ color: 'var(--cc-brand-1)' }}>{ex.output}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Surface>

                    {problem.hints.length > 0 && (
                        <Surface elevation={1} className="p-6">
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--cc-tle)' }}>
                                <HugeiconsIcon icon={Lightbulb} size={16} /> Hints
                            </h3>
                            <ul className="space-y-2">
                                {problem.hints.map((hint, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                                        <span className="mt-1.5 shrink-0" style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--cc-tle)' }} />
                                        {hint}
                                    </li>
                                ))}
                            </ul>
                        </Surface>
                    )}
                </div>

                {/* Right: editor + output */}
                <div className="flex flex-col gap-4 lg:h-[calc(100vh-7rem)] lg:sticky lg:top-20">
                    <Surface elevation={2} className="flex flex-col flex-1 min-h-[420px] overflow-hidden p-0">
                        <div className="flex items-center justify-between px-4 h-11" style={{ borderBottom: '1px solid var(--cc-border)' }}>
                            <span className="cc-eyebrow flex items-center gap-1.5"><HugeiconsIcon icon={CodeIcon} size={13} /> Editor</span>
                            <AIUsageIndicator challengeId={problem.id} className="shrink-0" />
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodeEditor value={code} onChange={(v) => setCode(v || '')} language={language} />
                        </div>
                        <div className="p-3 flex items-center justify-end" style={{ borderTop: '1px solid var(--cc-border)' }}>
                            <CcButton size="md" onClick={handleRunAndCheck} disabled={isRunning}>
                                {isRunning ? <LoadingSpinner size={16} /> : <HugeiconsIcon icon={PlayIcon} size={16} />}
                                Run code
                            </CcButton>
                        </div>
                    </Surface>

                    <Surface elevation={1} className="flex flex-col overflow-hidden p-0" style={{ minHeight: 160, maxHeight: 280 }}>
                        <div className="flex items-center justify-between px-4 h-10" style={{ borderBottom: '1px solid var(--cc-border)' }}>
                            <span className="cc-eyebrow flex items-center gap-1.5"><HugeiconsIcon icon={ComputerTerminal01Icon} size={13} /> Output</span>
                            {isValidated && <span className="cc-mono text-xs inline-flex items-center gap-1" style={{ color: 'var(--cc-ac)' }}><HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} /> Passed</span>}
                            {validationError && <span className="cc-mono text-xs inline-flex items-center gap-1" style={{ color: 'var(--cc-wa)' }}><HugeiconsIcon icon={EnergyIcon} size={13} /> Failed</span>}
                        </div>
                        <div className="flex-1 overflow-y-auto cc-scroll p-4 cc-mono text-sm space-y-1">
                            {terminalLogs.length === 0 ? (
                                <p style={{ color: 'var(--cc-tx-3)' }}>Run your code to see output.</p>
                            ) : (
                                terminalLogs.map((log, i) => (
                                    <div key={i}>
                                        {log.type === 'command' && <span style={{ color: 'var(--cc-info)' }}>$ {log.message}</span>}
                                        {log.type === 'system' && <span style={{ color: 'var(--cc-tx-3)', fontStyle: 'italic' }}>{log.message}</span>}
                                        {log.type === 'stdout' && <span className="block ml-3 pl-2" style={{ color: 'var(--cc-tx-1)', borderLeft: '2px solid var(--cc-border)' }}>{log.message}</span>}
                                        {log.type === 'stderr' && <span style={{ color: 'var(--cc-wa)' }}>{log.message}</span>}
                                        {log.type === 'success' && <span className="block mt-1" style={{ color: 'var(--cc-ac)' }}>{log.message}</span>}
                                    </div>
                                ))
                            )}
                        </div>
                    </Surface>
                </div>
            </div>
        </div>
    );
};

// ── List helpers ──────────────────────────────────────────────────────────
const DifficultyChip: React.FC<{ d: string }> = ({ d }) => {
    const m = DIFF[d] ?? DIFF.easy;
    return <span className="cc-pill text-[11px] capitalize" style={{ color: m.color, backgroundColor: m.tint, borderColor: 'transparent' }}>{m.label}</span>;
};

const StatusNode: React.FC<{ status: RowStatus }> = ({ status }) => {
    const label = status === 'solved' ? 'Solved' : 'Not started';
    return (
        <span
            className={`cc-node ${status === 'solved' ? 'cc-node-done' : 'cc-node-upcoming'}`}
            role="img" aria-label={label} title={label}
        >
            {status === 'solved' && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />}
        </span>
    );
};

const StatBar: React.FC<{ label: string; color: string; solved: number; total: number }> = ({ label, color, solved, total }) => {
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs w-14 shrink-0" style={{ color }}>{label}</span>
            <span className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(255,255,255,.06)' }}>
                <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.7 }} />
            </span>
            <span className="cc-mono text-xs w-12 text-right shrink-0" style={{ color: 'var(--cc-tx-2)' }}>{solved}/{total}</span>
        </div>
    );
};

export const PracticePage: React.FC = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const { isCompleted, validateAndComplete } = useProgressStore();
    const { user } = useUserStore();
    const { addToast } = useUIStore();

    const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
    const [searchQuery, setSearchQuery] = useState('');
    const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | RowStatus>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortId>('difficulty');
    const [sortOpen, setSortOpen] = useState(false);
    const [topicsOpen, setTopicsOpen] = useState(false);

    const activeProblem = useMemo(() => problemsData.find((p) => p.id === problemId) || null, [problemId]);

    const allTags = useMemo(() => {
        const freq = new Map<string, number>();
        problemsData.forEach((p) => p.tags.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1)));
        return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
    }, []);

    // Keep the chosen language valid for the active problem.
    useEffect(() => {
        if (activeProblem && !(activeProblem.languages as string[]).includes(selectedLanguage)) {
            setSelectedLanguage(activeProblem.languages[0] ?? 'python');
        }
    }, [activeProblem, selectedLanguage]);

    if (activeProblem) {
        const lang = (activeProblem.languages as string[]).includes(selectedLanguage) ? selectedLanguage : (activeProblem.languages[0] ?? 'python');
        return (
            <ChallengeSolver
                key={`${activeProblem.id}-${lang}`}
                problem={activeProblem}
                language={lang}
                onLanguageChange={setSelectedLanguage}
                onBack={() => navigate('/practice')}
                user={user}
                addToast={addToast}
                isCompleted={isCompleted}
                validateAndComplete={validateAndComplete}
            />
        );
    }

    const statusOf = (p: Problem): RowStatus => isCompleted('problem', p.id) ? 'solved' : 'todo';

    const q = searchQuery.trim().toLowerCase();
    let visible = problemsData.filter((p) => {
        const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesDiff = difficulty === 'all' || p.difficulty === difficulty;
        const matchesStatus = statusFilter === 'all' || statusOf(p) === statusFilter;
        const matchesTags = selectedTags.length === 0 || selectedTags.some((t) => p.tags.includes(t));
        return matchesSearch && matchesDiff && matchesStatus && matchesTags;
    });
    if (sortBy === 'xp') visible = [...visible].sort((a, b) => b.xpReward - a.xpReward);
    else if (sortBy === 'title') visible = [...visible].sort((a, b) => a.title.localeCompare(b.title));
    else visible = [...visible].sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty]);

    const recommendedId = visible.find((p) => statusOf(p) === 'todo' && p.difficulty !== 'hard')?.id ?? null;

    const diffStats = (['easy', 'medium', 'hard'] as const).map((d) => {
        const all = problemsData.filter((p) => p.difficulty === d);
        return { d, total: all.length, solved: all.filter((p) => isCompleted('problem', p.id)).length };
    });
    const totalSolved = problemsData.filter((p) => isCompleted('problem', p.id)).length;

    const daily = dailyProblem();
    const streak = user?.streakCurrent ?? 0;
    const clearFilters = () => { setDifficulty('all'); setStatusFilter('all'); setSelectedTags([]); setSearchQuery(''); };
    const toggleTag = (t: string) => setSelectedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
    const neutralActive = { backgroundColor: 'var(--cc-surface-3)', color: 'var(--cc-tx-1)', borderColor: 'var(--cc-edge-light)' };

    return (
        <div className="cc-root max-w-[1180px] mx-auto space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="cc-eyebrow">Practice</span>
                    <h1 className="text-3xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>Sharpen your skills</h1>
                </div>
                <div className="cc-search md:w-60" style={{ width: 240 }}>
                    <HugeiconsIcon icon={Search01Icon} size={16} />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search problems…"
                        aria-label="Search problems"
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: 'var(--cc-tx-1)' }}
                    />
                </div>
            </header>

            {/* Top row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {daily && (
                    <Surface elevation={2} glow className="p-6 flex flex-col">
                        <span className="cc-eyebrow">Daily Challenge</span>
                        <h2 className="text-xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>{daily.title}</h2>
                        <p className="text-sm mt-1 mb-4 line-clamp-2" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>{cleanDesc(daily.description)}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mb-5">
                            <DifficultyChip d={daily.difficulty} />
                            {daily.tags.slice(0, 2).map((t) => <span key={t} className="cc-pill text-[11px]" style={{ color: 'var(--cc-tx-2)' }}>{t}</span>)}
                            <span className="cc-pill cc-pill-brand cc-mono text-[11px]">+{daily.xpReward} XP</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3">
                            <CcButton size="md" onClick={() => navigate(`/practice/${daily.id}`)}>Solve <HugeiconsIcon icon={ArrowRight01Icon} size={16} /></CcButton>
                            <span className="cc-pill" style={{ color: 'var(--cc-tle)', borderColor: 'rgba(251,113,133,.25)' }}>
                                <HugeiconsIcon icon={FireIcon} size={13} /> {streak}-day streak
                            </span>
                        </div>
                    </Surface>
                )}

                <Surface elevation={1} className="p-6 flex flex-col">
                    <span className="cc-eyebrow">Your practice</span>
                    <div className="flex items-baseline gap-2 mt-1.5 mb-4">
                        <span className="cc-mono text-3xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>{totalSolved}</span>
                        <span className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>of {problemsData.length} problems solved</span>
                    </div>
                    {totalSolved === 0 ? (
                        <button
                            type="button"
                            onClick={() => daily && navigate(`/practice/${daily.id}`)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--cc-tx-1)] self-start"
                            style={{ color: 'var(--cc-tx-2)' }}
                        >
                            Solve your first problem <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                        </button>
                    ) : (
                        <div className="space-y-2.5 mt-auto">
                            {diffStats.map(({ d, total, solved }) => (
                                <StatBar key={d} label={DIFF[d].label} color={DIFF[d].color} solved={solved} total={total} />
                            ))}
                        </div>
                    )}
                </Surface>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-between">
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter problems">
                    {(['all', 'easy', 'medium', 'hard'] as const).map((d) => {
                        const active = difficulty === d;
                        const style = !active ? { color: 'var(--cc-tx-2)', cursor: 'pointer' as const }
                            : d === 'all' ? neutralActive
                                : { color: DIFF[d].color, backgroundColor: DIFF[d].tint, borderColor: 'transparent' };
                        return (
                            <button key={d} onClick={() => setDifficulty(d)} aria-pressed={active}
                                className="cc-pill text-xs capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60" style={style}>
                                {d === 'all' ? 'All' : DIFF[d].label}
                            </button>
                        );
                    })}
                    <span className="mx-1 hidden sm:inline" style={{ width: 1, height: 18, background: 'var(--cc-border)' }} aria-hidden="true" />
                    {(['all', 'solved', 'todo'] as const).map((s) => {
                        const active = statusFilter === s;
                        return (
                            <button key={s} onClick={() => setStatusFilter(s)} aria-pressed={active}
                                className="cc-pill text-xs capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                                style={active ? neutralActive : { color: 'var(--cc-tx-2)', cursor: 'pointer' }}>
                                {s === 'all' ? 'All status' : s === 'todo' ? 'Todo' : s}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <CcButton variant="secondary" size="sm" onClick={() => { setTopicsOpen((o) => !o); setSortOpen(false); }} aria-haspopup="menu" aria-expanded={topicsOpen}>
                            {selectedTags.length ? `Topics · ${selectedTags.length}` : 'Topics'} <HugeiconsIcon icon={ArrowDown01Icon} size={14} style={{ transform: topicsOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--cc-dur-1) var(--cc-ease)' }} />
                        </CcButton>
                        {topicsOpen && <div className="fixed inset-0 z-40" onClick={() => setTopicsOpen(false)} />}
                        <div className="cc-dropdown" data-open={topicsOpen} role="menu" style={{ minWidth: 190 }}>
                            <div className="cc-dropdown-inner">
                                <div className="flex items-center justify-between px-2 py-1">
                                    <span className="cc-eyebrow">Topics</span>
                                    {selectedTags.length > 0 && <button onClick={() => setSelectedTags([])} className="text-[11px]" style={{ color: 'var(--cc-tx-3)' }}>Clear</button>}
                                </div>
                                <div className="max-h-64 overflow-y-auto cc-scroll">
                                    {allTags.map((t) => {
                                        const active = selectedTags.includes(t);
                                        return (
                                            <button key={t} role="menuitemcheckbox" aria-checked={active} tabIndex={topicsOpen ? 0 : -1} onClick={() => toggleTag(t)}
                                                className={`cc-subnav-item ${active ? 'cc-subnav-item-active' : ''}`} style={{ width: '100%', paddingLeft: '0.5rem' }}>
                                                <span className="cc-subnav-dot" />{t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <CcButton variant="secondary" size="sm" onClick={() => { setSortOpen((o) => !o); setTopicsOpen(false); }} aria-haspopup="menu" aria-expanded={sortOpen}>
                            {SORTS.find((s) => s.id === sortBy)?.label} <HugeiconsIcon icon={ArrowDown01Icon} size={14} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--cc-dur-1) var(--cc-ease)' }} />
                        </CcButton>
                        {sortOpen && <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />}
                        <div className="cc-dropdown" data-open={sortOpen} role="menu" style={{ minWidth: 170 }}>
                            <div className="cc-dropdown-inner">
                                <div className="cc-eyebrow px-2 py-1">Sort by</div>
                                {SORTS.map((s) => (
                                    <button key={s.id} role="menuitem" tabIndex={sortOpen ? 0 : -1} onClick={() => { setSortBy(s.id); setSortOpen(false); }}
                                        className={`cc-subnav-item ${sortBy === s.id ? 'cc-subnav-item-active' : ''}`} style={{ width: '100%', paddingLeft: '0.5rem' }}>
                                        <span className="cc-subnav-dot" />{s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problem list */}
            <Surface elevation={1} className="overflow-hidden cc-stagger">
                <div className="hidden md:flex items-center gap-4 pl-5 pr-4 py-2.5 sticky top-0 z-10" style={{ borderBottom: '1px solid var(--cc-border)', background: 'var(--cc-surface-2)' }}>
                    <span className="cc-eyebrow w-7 text-center">·</span>
                    <span className="cc-eyebrow flex-1">Problem</span>
                    <span className="cc-eyebrow w-20">Difficulty</span>
                    <span className="cc-eyebrow w-40 hidden lg:block">Topics</span>
                    <span className="cc-eyebrow w-16 text-right">XP</span>
                    <span className="w-4" />
                </div>

                {visible.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-sm mb-3" style={{ color: 'var(--cc-tx-2)' }}>No problems match these filters.</p>
                        <CcButton variant="secondary" size="sm" onClick={clearFilters}>Clear filters</CcButton>
                    </div>
                ) : (
                    visible.map((p, i) => {
                        const st = statusOf(p);
                        const dm = DIFF[p.difficulty];
                        return (
                            <button
                                key={p.id}
                                onClick={() => navigate(`/practice/${p.id}`)}
                                className="group relative w-full flex items-center gap-4 pl-5 pr-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                                style={{ minHeight: 56, borderTop: i === 0 ? 'none' : '1px solid var(--cc-border)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--cc-surface-2)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 rounded-full" style={{ width: 3, background: dm.color, opacity: 0.5 }} />
                                <StatusNode status={st} />
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-center gap-2 min-w-0">
                                        <span className="text-sm font-medium truncate" style={{ color: st === 'todo' ? 'var(--cc-tx-2)' : 'var(--cc-tx-1)' }}>{p.title}</span>
                                        {p.id === recommendedId && (
                                            <span className="cc-pill text-[10px] shrink-0" style={{ color: 'var(--cc-info)', borderColor: 'rgba(96,165,250,.25)', backgroundColor: 'rgba(96,165,250,.10)' }}>
                                                <HugeiconsIcon icon={SparklesIcon} size={10} /> Recommended
                                            </span>
                                        )}
                                    </span>
                                    <span className="md:hidden mt-1 flex items-center gap-1.5">
                                        <DifficultyChip d={p.difficulty} />
                                        <span className="cc-pill cc-pill-brand cc-mono text-[10px]">+{p.xpReward}</span>
                                    </span>
                                </span>
                                <span className="hidden md:block w-20"><DifficultyChip d={p.difficulty} /></span>
                                <span className="hidden lg:flex w-40 items-center gap-1.5 overflow-hidden">
                                    {p.tags.slice(0, 2).map((t) => <span key={t} className="cc-pill text-[10px] shrink-0" style={{ color: 'var(--cc-tx-3)' }}>{t}</span>)}
                                    {p.tags.length > 2 && <span className="cc-mono text-[10px]" style={{ color: 'var(--cc-tx-3)' }}>+{p.tags.length - 2}</span>}
                                </span>
                                <span className="hidden md:block w-16 text-right">
                                    <span className="cc-pill cc-pill-brand cc-mono text-[11px]">+{p.xpReward}</span>
                                </span>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--cc-tx-3)' }} />
                            </button>
                        );
                    })
                )}
            </Surface>
        </div>
    );
};
