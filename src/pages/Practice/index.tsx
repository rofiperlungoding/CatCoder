import { SparklesIcon, CheckmarkCircle02Icon, Lightbulb, Search01Icon, Trophy, ArrowRight01Icon, CodeIcon, ComputerTerminal01Icon, PlayIcon, EnergyIcon, ArrowLeft01Icon, ArrowDown01Icon, FireIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon, Badge, Button, LoadingSpinner } from '../../components/ui';
import { Surface, Button as CcButton } from '../../components/ds';
import { CodeEditor } from '../../components/editor';
import { useProgressStore, useUIStore, useUserStore } from '../../stores';
import { useCodeRunner } from '../../hooks';
import type { Problem, User } from '../../types';
import { problems as problemsData } from '../../data/problems';
import { analytics } from '../../services/analytics';
import AIUsageIndicator from '../../components/ai/AIUsageIndicator';

interface ChallengeSolverProps {
    problem: Problem;
    selectedLanguage: string;
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

const ChallengeSolver: React.FC<ChallengeSolverProps> = ({
    problem,
    selectedLanguage,
    onBack,
    user,
    addToast,
    isCompleted,
    validateAndComplete
}) => {
    const [code, setCode] = useState<string>(() => {
        return problem.starterCode?.[selectedLanguage as keyof typeof problem.starterCode] ||
            (selectedLanguage === 'python' ? '# Write your code here\n' :
                selectedLanguage === 'javascript' ? '// Write your code here\n' :
                    '// Write your code here\n');
    });

    const [startTime] = useState<number>(() => Date.now());
    const [isLangOpen, setIsLangOpen] = useState(false);

    useEffect(() => {
        analytics.logEvent('problem_viewed', {
            problemId: problem.id,
            title: problem.title
        });
    }, [problem.id, problem.title]);

    const {
        terminalLogs,
        isRunning,
        isValidated,
        validationError,
        runCode
    } = useCodeRunner();

    const handleRunAndCheck = async () => {
        // Get per-language test case
        const langKey = selectedLanguage as 'python' | 'javascript' | 'cpp';
        const langTestCases = problem.testCases[langKey];
        const expectedOutput = langTestCases?.[0]?.expectedOutput;

        analytics.logEvent('code_run', {
            problemId: problem.id,
            language: selectedLanguage
        });

        // Run the code with expected output for validation
        const passed = await runCode(code, selectedLanguage, expectedOutput);

        if (passed) {
            const solveTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(solveTimeSeconds / 60);
            const seconds = solveTimeSeconds % 60;
            const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

            analytics.logEvent('problem_solved', {
                problemId: problem.id,
                language: selectedLanguage,
                duration: solveTimeSeconds
            });

            if (!user) {
                addToast('error', `You must be logged in to save progress.`);
                return;
            }

            if (isCompleted('problem', problem.id)) {
                addToast('success', `✓ Solved again in ${timeStr}!`);
                return;
            }

            const result = await validateAndComplete(
                'problem',
                problem.id,
                selectedLanguage,
                solveTimeSeconds
            );

            if (result.success) {
                if (result.xp_awarded && result.xp_awarded > 0) {
                    addToast('success', `✓ Solved in ${timeStr}! +${result.xp_awarded} XP`);
                } else if (result.message === 'Already completed') {
                    addToast('success', `✓ Solved again in ${timeStr}!`);
                } else {
                    addToast('success', `✓ Solved in ${timeStr}!`);
                }
            } else {
                console.error('Server validation failed:', result.error);
                addToast('warning', 'Solved locally, but server verification pending.');
            }
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-gray-500';
        }
    };

    const renderMarkdown = (content: string) => (
        <div className="whitespace-pre-line">
            {content.split('```').map((part, i) => {
                if (i % 2 === 1) {
                    const lines = part.split('\n');
                    const codeContent = lines.slice(1).join('\n');
                    return (
                        <div key={i} className="not-prose my-6 rounded-xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2 opacity-20">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                </div>
                                <div className="ml-auto text-xs font-mono text-gray-500">code</div>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <code className="font-mono text-sm text-gray-300 leading-relaxed block whitespace-pre">{codeContent}</code>
                            </div>
                        </div>
                    );
                }
                return (
                    <span key={i}>
                        {part.split(/(\*\*.*?\*\*|`[^`]+`)/).map((chunk, j) => {
                            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                return <strong key={j} className="text-foreground font-black">{chunk.slice(2, -2)}</strong>;
                            }
                            if (chunk.startsWith('`') && chunk.endsWith('`')) {
                                return (
                                    <code key={j} className="bg-secondary/50 border border-border px-1.5 py-0.5 rounded-md text-sm font-mono text-primary font-bold mx-0.5">
                                        {chunk.slice(1, -1)}
                                    </code>
                                );
                            }
                            return chunk;
                        })}
                    </span>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#09090b] pb-24">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 mb-6">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent" onClick={onBack}>
                        <Icon icon={ArrowLeft01Icon} size={18} /> <span className="font-medium">All Problems</span>
                    </Button>
                    <h1 className="font-bold text-lg truncate px-4">{problem.title}</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-40">
                            {/* Selector simplified for this component as it's passed from parent */}
                            <div className="relative min-w-[150px]">
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm px-4 py-2 flex items-center justify-between shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-foreground"
                                >
                                    <span className="font-medium truncate flex items-center gap-2">
                                        {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                                    </span>
                                    <Icon icon={ArrowDown01Icon} size={14} className={`text-muted-foreground transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {/* Language selection is effectively handled by remounting via key in parent */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
                <div className="overflow-y-auto space-y-8 pr-2">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex gap-2">
                                <Badge className={`${getDifficultyColor(problem.difficulty)} rounded-full capitalize`}>
                                    {problem.difficulty}
                                </Badge>
                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-full">
                                    Tier {problem.tier}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-xs">
                                <Icon icon={Trophy} size={14} />
                                +{problem.xpReward} XP
                            </div>
                        </div>

                        <h2 className="text-3xl font-black mb-4">{problem.title}</h2>
                        <div className="text-lg text-muted-foreground leading-relaxed">
                            {renderMarkdown(problem.description)}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Icon icon={SparklesIcon} size={18} className="text-primary" /> Examples
                        </h3>
                        {problem.examples.map((ex, i) => (
                            <div key={i} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 font-mono text-sm">
                                <div className="mb-3">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Input</span>
                                    <div className="bg-gray-50 dark:bg-black/20 p-2 rounded-lg text-foreground px-3">
                                        {ex.input}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Output</span>
                                    <div className="bg-gray-50 dark:bg-black/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold px-3">
                                        {ex.output}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {problem.hints.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-6 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500 font-bold">
                                <Icon icon={Lightbulb} size={20} />
                                <span>Hints</span>
                            </div>
                            <ul className="list-disc list-inside space-y-2 text-amber-900/70 dark:text-amber-200/70 text-sm">
                                {problem.hints.map((hint, i) => (
                                    <li key={i}>{hint}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 h-full min-h-[500px]">
                    <div className="flex flex-col flex-1 rounded-2xl overflow-hidden border border-border shadow-2xl bg-[#1e1e1e]">
                        <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-white/5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Icon icon={CodeIcon} size={14} /> Code Editor
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodeEditor
                                value={code}
                                onChange={(v) => setCode(v || '')}
                                language={selectedLanguage}
                            />
                        </div>
                        <div className="p-4 bg-[#1e1e1e] border-t border-white/5 flex items-center justify-between gap-3 flex-wrap">
                            {problem && (
                                <AIUsageIndicator challengeId={problem.id} className="shrink-0" />
                            )}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleRunAndCheck}
                                disabled={isRunning}
                                className="rounded-full font-semibold ml-auto"
                            >
                                {isRunning ? <LoadingSpinner size={16} className="mr-2" /> : <Icon icon={PlayIcon} size={16} className="mr-2" />}
                                Run Code
                            </Button>
                        </div>
                    </div>

                    <div className={`h-1/3 rounded-2xl overflow-hidden border flex flex-col transition-all duration-300 ${terminalLogs.length > 0 ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white dark:bg-card border-dashed border-gray-200 dark:border-border'
                        }`}>
                        {terminalLogs.length > 0 ? (
                            <>
                                <div className="px-4 py-3 bg-[#1e1e1e] border-b border-white/5 flex items-center justify-between">
                                    <span className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <Icon icon={ComputerTerminal01Icon} size={14} /> Output
                                    </span>
                                    {isValidated && (
                                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                            <Icon icon={CheckmarkCircle02Icon} size={14} /> Passed
                                        </span>
                                    )}
                                    {validationError && (
                                        <span className="text-rose-400 text-xs font-bold flex items-center gap-1">
                                            <Icon icon={EnergyIcon} size={14} /> Failed
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1">
                                    {terminalLogs.map((log, i) => (
                                        <div key={i} className="animate-in fade-in slide-in-from-left-1 duration-200">
                                            {log.type === 'command' && <span className="text-cyan-400 font-bold">$ {log.message}</span>}
                                            {log.type === 'system' && <span className="text-gray-500 italic block py-1">{log.message}</span>}
                                            {log.type === 'stdout' && <span className="text-gray-200 block ml-4 border-l-2 border-white/10 pl-2">{log.message}</span>}
                                            {log.type === 'stderr' && <span className="text-red-400 bg-red-950/20 p-1 rounded">{log.message}</span>}
                                            {log.type === 'success' && <span className="text-emerald-500 font-bold block mt-2">➜ {log.message}</span>}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Icon icon={ComputerTerminal01Icon} size={24} className="mb-2 opacity-20" />
                                <p className="text-xs">Run your code to see output</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Practice list helpers ─────────────────────────────────────────────────
const DIFF: Record<string, { label: string; color: string; tint: string }> = {
    easy: { label: 'Easy', color: 'var(--cc-ac)', tint: 'rgba(74,222,128,.12)' },
    medium: { label: 'Medium', color: 'var(--cc-tle)', tint: 'rgba(251,191,36,.12)' },
    hard: { label: 'Hard', color: 'var(--cc-wa)', tint: 'rgba(251,113,133,.12)' },
};
const DIFF_RANK: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const SORTS = [
    { id: 'difficulty', label: 'Difficulty' },
    { id: 'acceptance', label: 'Acceptance' },
    { id: 'xp', label: 'XP reward' },
    { id: 'title', label: 'A–Z' },
] as const;
type SortId = typeof SORTS[number]['id'];
type RowStatus = 'solved' | 'attempted' | 'todo';

/** Stable pseudo "acceptance" — the data model has no real acceptance field (placeholder, deterministic per id). */
function acceptanceOf(p: Problem): number {
    let h = 0;
    for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
    const base = p.difficulty === 'easy' ? 60 : p.difficulty === 'medium' ? 42 : 28;
    return base + (h % 26);
}

/** Strip markdown markers + a leading "Description" label for clean panel copy. */
function cleanDesc(md: string): string {
    return md.replace(/[*`#>]/g, '').replace(/^\s*description[:\s-]*/i, '').replace(/\s+/g, ' ').trim();
}

function dailyProblem(): Problem | null {
    if (problemsData.length === 0) return null;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return problemsData[dayOfYear % problemsData.length];
}

const DifficultyChip: React.FC<{ d: string }> = ({ d }) => {
    const m = DIFF[d] ?? DIFF.easy;
    return (
        <span className="cc-pill text-[11px] capitalize" style={{ color: m.color, backgroundColor: m.tint, borderColor: 'transparent' }}>
            {m.label}
        </span>
    );
};

const StatusNode: React.FC<{ status: RowStatus }> = ({ status }) => {
    const label = status === 'solved' ? 'Solved' : status === 'attempted' ? 'Attempted' : 'Not started';
    return (
        <span
            className={`cc-node ${status === 'solved' ? 'cc-node-done' : status === 'todo' ? 'cc-node-upcoming' : ''}`}
            style={status === 'attempted' ? { border: '2px solid var(--cc-tle)' } : undefined}
            role="img"
            aria-label={label}
            title={label}
        >
            {status === 'solved' && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />}
            {status === 'attempted' && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--cc-tle)' }} />}
        </span>
    );
};

/** Decorative faint code motif for the daily-challenge panel's right zone. */
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
    const { isCompleted, validateAndComplete, getProgress } = useProgressStore();
    const { user } = useUserStore();
    const { addToast } = useUIStore();

    const [selectedLanguage] = useState<string>('python');
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

    if (activeProblem) {
        return (
            <ChallengeSolver
                key={`${activeProblem.id}-${selectedLanguage}`}
                problem={activeProblem}
                selectedLanguage={selectedLanguage}
                onBack={() => navigate('/practice')}
                user={user}
                addToast={addToast}
                isCompleted={isCompleted}
                validateAndComplete={validateAndComplete}
            />
        );
    }

    const statusOf = (p: Problem): RowStatus =>
        isCompleted('problem', p.id) ? 'solved'
            : getProgress('problem', p.id)?.status === 'started' ? 'attempted'
                : 'todo';

    const q = searchQuery.trim().toLowerCase();
    let visible = problemsData.filter((p) => {
        const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesDiff = difficulty === 'all' || p.difficulty === difficulty;
        const matchesStatus = statusFilter === 'all' || statusOf(p) === statusFilter;
        const matchesTags = selectedTags.length === 0 || selectedTags.some((t) => p.tags.includes(t));
        return matchesSearch && matchesDiff && matchesStatus && matchesTags;
    });
    if (sortBy === 'acceptance') visible = [...visible].sort((a, b) => acceptanceOf(b) - acceptanceOf(a));
    else if (sortBy === 'xp') visible = [...visible].sort((a, b) => b.xpReward - a.xpReward);
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

            {/* Top row — compact Daily Challenge + your practice stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Daily Challenge (compact, the one focal) */}
                {daily && (
                    <Surface elevation={2} glow className="p-6 flex flex-col">
                        <span className="cc-eyebrow">Daily Challenge</span>
                        <h2 className="text-xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>{daily.title}</h2>
                        <p className="text-sm mt-1 mb-4 line-clamp-2" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                            {cleanDesc(daily.description)}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mb-5">
                            <DifficultyChip d={daily.difficulty} />
                            {daily.tags.slice(0, 2).map((t) => (
                                <span key={t} className="cc-pill text-[11px]" style={{ color: 'var(--cc-tx-2)' }}>{t}</span>
                            ))}
                            <span className="cc-pill cc-pill-brand cc-mono text-[11px]">+150 XP</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3">
                            <CcButton size="md" onClick={() => navigate(`/practice/${daily.id}`)}>
                                Solve <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                            </CcButton>
                            <span className="cc-pill" style={{ color: 'var(--cc-tle)', borderColor: 'rgba(251,113,133,.25)' }}>
                                <HugeiconsIcon icon={FireIcon} size={13} /> {streak}-day streak
                            </span>
                        </div>
                    </Surface>
                )}

                {/* Your practice stats */}
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

            {/* Filter toolbar — one tidy row: difficulty + status (left), topics + sort (right) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-between">
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter problems">
                    {(['all', 'easy', 'medium', 'hard'] as const).map((d) => {
                        const active = difficulty === d;
                        const style = !active ? { color: 'var(--cc-tx-2)', cursor: 'pointer' as const }
                            : d === 'all' ? neutralActive
                                : { color: DIFF[d].color, backgroundColor: DIFF[d].tint, borderColor: 'transparent' };
                        return (
                            <button key={d} onClick={() => setDifficulty(d)} aria-pressed={active}
                                className="cc-pill text-xs capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                                style={style}>
                                {d === 'all' ? 'All' : DIFF[d].label}
                            </button>
                        );
                    })}
                    <span className="mx-1 hidden sm:inline" style={{ width: 1, height: 18, background: 'var(--cc-border)' }} aria-hidden="true" />
                    {(['all', 'solved', 'attempted', 'todo'] as const).map((s) => {
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
                    {/* Topics dropdown (multi-select) */}
                    <div className="relative">
                        <CcButton variant="secondary" size="sm" onClick={() => { setTopicsOpen((o) => !o); setSortOpen(false); }} aria-haspopup="menu" aria-expanded={topicsOpen}>
                            {selectedTags.length ? `Topics · ${selectedTags.length}` : 'Topics'} <HugeiconsIcon icon={ArrowDown01Icon} size={14} style={{ transform: topicsOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--cc-dur-1) var(--cc-ease)' }} />
                        </CcButton>
                        {topicsOpen && <div className="fixed inset-0 z-40" onClick={() => setTopicsOpen(false)} />}
                        <div className="cc-dropdown" data-open={topicsOpen} role="menu" style={{ minWidth: 190 }}>
                            <div className="cc-dropdown-inner">
                                <div className="flex items-center justify-between px-2 py-1">
                                    <span className="cc-eyebrow">Topics</span>
                                    {selectedTags.length > 0 && (
                                        <button onClick={() => setSelectedTags([])} className="text-[11px]" style={{ color: 'var(--cc-tx-3)' }}>Clear</button>
                                    )}
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
                    {/* Sort dropdown */}
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

            {/* Problem list (signature) */}
            <Surface elevation={1} className="overflow-hidden cc-stagger">
                {/* Column header (sticky) */}
                <div className="hidden md:flex items-center gap-4 pl-5 pr-4 py-2.5 sticky top-0 z-10" style={{ borderBottom: '1px solid var(--cc-border)', background: 'var(--cc-surface-2)' }}>
                    <span className="cc-eyebrow w-7 text-center">·</span>
                    <span className="cc-eyebrow flex-1">Problem</span>
                    <span className="cc-eyebrow w-20">Difficulty</span>
                    <span className="cc-eyebrow w-40 hidden lg:block">Topics</span>
                    <span className="cc-eyebrow w-24 text-right">Acceptance</span>
                    <span className="cc-eyebrow w-12 text-right">XP</span>
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
                                {/* difficulty status rail */}
                                <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 rounded-full" style={{ width: 3, background: dm.color, opacity: 0.5 }} />
                                <StatusNode status={st} />
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-center gap-2 min-w-0">
                                        <span className="text-sm font-medium truncate" style={{ color: st === 'todo' ? 'var(--cc-tx-2)' : 'var(--cc-tx-1)' }}>
                                            {p.title}
                                        </span>
                                        {p.id === recommendedId && (
                                            <span className="cc-pill text-[10px] shrink-0" style={{ color: 'var(--cc-info)', borderColor: 'rgba(96,165,250,.25)', backgroundColor: 'rgba(96,165,250,.10)' }}>
                                                <HugeiconsIcon icon={SparklesIcon} size={10} /> Recommended
                                            </span>
                                        )}
                                    </span>
                                    {/* mobile-only meta */}
                                    <span className="md:hidden mt-1 flex items-center gap-1.5">
                                        <DifficultyChip d={p.difficulty} />
                                        <span className="cc-pill cc-pill-brand cc-mono text-[10px]">+{p.xpReward}</span>
                                    </span>
                                </span>
                                <span className="hidden md:block w-20"><DifficultyChip d={p.difficulty} /></span>
                                <span className="hidden lg:flex w-40 items-center gap-1.5 overflow-hidden">
                                    {p.tags.slice(0, 2).map((t) => (
                                        <span key={t} className="cc-pill text-[10px] shrink-0" style={{ color: 'var(--cc-tx-3)' }}>{t}</span>
                                    ))}
                                    {p.tags.length > 2 && <span className="cc-mono text-[10px]" style={{ color: 'var(--cc-tx-3)' }}>+{p.tags.length - 2}</span>}
                                </span>
                                <span className="hidden md:flex w-24 flex-col items-end gap-1">
                                    <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-2)' }}>{acceptanceOf(p)}%</span>
                                    <span className="w-full rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,.06)' }}>
                                        <span className="block h-full" style={{ width: `${acceptanceOf(p)}%`, background: 'var(--cc-tx-3)' }} />
                                    </span>
                                </span>
                                <span className="hidden md:block w-12 text-right">
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
