import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Search,
    Trophy,
    ArrowRight,
    CheckCircle2,
    Code,
    Terminal,
    Play,
    Zap,
    ChevronLeft,
    Lightbulb,
    ChevronDown,
    RotateCw
} from 'lucide-react';
import { Badge, Button, Input } from '../../components/ui';
import { CodeEditor } from '../../components/editor';
import { useProgressStore, useUIStore } from '../../stores';
import { useCodeRunner } from '../../hooks';
import type { Problem } from '../../types';
import { problems as problemsData } from '../../data/problems';

export const PracticePage: React.FC = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const { isCompleted, markComplete } = useProgressStore();
    const { addToast } = useUIStore();

    // List State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    // Detail State
    const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
    const [code, setCode] = useState<string>('');
    const [startTime, setStartTime] = useState<number | null>(null); // Track when user started
    const {
        terminalLogs,
        isRunning,
        isValidated,
        validationError,
        runCode,
        clearLogs
    } = useCodeRunner();

    // Load problem when problemId changes
    useEffect(() => {
        if (problemId) {
            const problem = problemsData.find(p => p.id === problemId);
            if (problem) {
                setActiveProblem(problem);
                setCode(getDefaultCode(selectedLanguage));
                clearLogs();
                setStartTime(Date.now()); // Start the timer!
            }
        } else {
            setActiveProblem(null);
            setStartTime(null);
        }
    }, [problemId, selectedLanguage]);

    const getDefaultCode = (lang: string): string => {
        // Use per-language starter code from problem data
        if (activeProblem?.starterCode?.[lang as keyof typeof activeProblem.starterCode]) {
            return activeProblem.starterCode[lang as keyof typeof activeProblem.starterCode] || '';
        }
        // Fallback
        const defaults: Record<string, string> = {
            python: '# Write your code here\n',
            javascript: '// Write your code here\n',
            cpp: '// Write your code here\n'
        };
        return defaults[lang] || '';
    };

    const handleSolveProblem = (e: React.MouseEvent, problem: Problem) => {
        e.stopPropagation();
        navigate(`/practice/${problem.id}`);
    };

    const handleRunAndCheck = async () => {
        if (!activeProblem) return;

        // Get per-language test case
        const langKey = selectedLanguage as 'python' | 'javascript' | 'cpp';
        const langTestCases = activeProblem.testCases[langKey];
        const expectedOutput = langTestCases?.[0]?.expectedOutput;

        // Run the code with expected output for validation
        const passed = await runCode(code, selectedLanguage, expectedOutput);

        // Auto-submit if passed
        if (passed) {
            const solveTimeSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
            const minutes = Math.floor(solveTimeSeconds / 60);
            const seconds = solveTimeSeconds % 60;
            const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

            if (!isCompleted('problem', activeProblem.id)) {
                markComplete('problem', activeProblem.id, undefined, solveTimeSeconds);
                addToast('success', `✓ Solved in ${timeStr}!`);
            } else {
                addToast('success', `✓ Solved again in ${timeStr}!`);
            }
        }
    };

    const filteredProblems = problemsData.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-gray-500';
        }
    };

    const getTierName = (tier: number) => {
        switch (tier) {
            case 1: return 'Beginner';
            case 2: return 'Basic';
            case 3: return 'Intermediate';
            case 4: return 'Advanced';
            case 5: return 'Expert';
            default: return 'Unknown';
        }
    };

    const groupedProblems = filteredProblems.reduce((acc, problem) => {
        const tier = problem.tier;
        if (!acc[tier]) acc[tier] = [];
        acc[tier].push(problem);
        return acc;
    }, {} as Record<number, Problem[]>);

    const languageTabs = [
        { id: 'python', label: 'Python', icon: <Code size={16} /> },
        { id: 'javascript', label: 'JavaScript', icon: <Code size={16} /> },
        { id: 'cpp', label: 'C++', icon: <Code size={16} /> }
    ];

    // Helper to render content with markdown (bold and code blocks)
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

    if (activeProblem) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-[#09090b] pb-24">
                <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 mb-6">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent" onClick={() => navigate('/practice')}>
                            <ChevronLeft size={18} /> <span className="font-medium">All Problems</span>
                        </Button>
                        <h1 className="font-bold text-lg truncate px-4">{activeProblem.title}</h1>
                        <div className="flex items-center gap-4">
                            <div className="w-40">
                                {/* Custom Language Dropdown */}
                                <div className="relative min-w-[150px]">
                                    <button
                                        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm px-4 py-2 flex items-center justify-between shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-foreground"
                                    >
                                        <span className="font-medium truncate flex items-center gap-2">
                                            {languageTabs.find(t => t.id === selectedLanguage)?.label}
                                        </span>
                                        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isLanguageOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-full min-w-[180px] bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200 z-50">
                                            {languageTabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setSelectedLanguage(tab.id);
                                                        setIsLanguageOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between
                                                        ${selectedLanguage === tab.id
                                                            ? 'bg-primary/5 text-primary font-bold'
                                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                                        }
                                                    `}
                                                >
                                                    <span>{tab.label}</span>
                                                    {selectedLanguage === tab.id && (
                                                        <CheckCircle2 size={14} className="text-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Backdrop */}
                                    {isLanguageOpen && (
                                        <div
                                            className="fixed inset-0 z-40 bg-transparent"
                                            onClick={() => setIsLanguageOpen(false)}
                                        />
                                    )}
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
                                    <Badge className={`${getDifficultyColor(activeProblem.difficulty)} rounded-full capitalize`}>
                                        {activeProblem.difficulty}
                                    </Badge>
                                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-full">
                                        Tier {activeProblem.tier}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-xs">
                                    <Trophy size={14} />
                                    +{activeProblem.xpReward} XP
                                </div>
                            </div>

                            <h2 className="text-3xl font-black mb-4">{activeProblem.title}</h2>
                            <div className="text-lg text-muted-foreground leading-relaxed">
                                {renderMarkdown(activeProblem.description)}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles size={18} className="text-primary" /> Examples
                            </h3>
                            {activeProblem.examples.map((ex, i) => (
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

                        {activeProblem.hints.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-6 rounded-3xl">
                                <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500 font-bold">
                                    <Lightbulb size={20} />
                                    <span>Hints</span>
                                </div>
                                <ul className="list-disc list-inside space-y-2 text-amber-900/70 dark:text-amber-200/70 text-sm">
                                    {activeProblem.hints.map((hint, i) => (
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
                                    <Code size={14} /> Code Editor
                                </span>
                            </div>
                            <div className="flex-1 min-h-0">
                                <CodeEditor
                                    value={code}
                                    onChange={(v) => setCode(v || '')}
                                    language={selectedLanguage}
                                />
                            </div>
                            <div className="p-4 bg-[#1e1e1e] border-t border-white/5 flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleRunAndCheck}
                                    disabled={isRunning}
                                    className="rounded-full font-semibold"
                                >
                                    {isRunning ? <Sparkles size={16} className="mr-2 animate-spin" /> : <Play size={16} className="mr-2" />}
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
                                            <Terminal size={14} /> Output
                                        </span>
                                        {isValidated && (
                                            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                                <CheckCircle2 size={14} /> Passed
                                            </span>
                                        )}
                                        {validationError && (
                                            <span className="text-rose-400 text-xs font-bold flex items-center gap-1">
                                                <Zap size={14} /> Failed
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
                                    <Terminal size={24} className="mb-2 opacity-20" />
                                    <p className="text-xs">Run your code to see output</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 space-y-12">
            <div className="relative pt-12 pb-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-3">
                            Practice Arena
                            <Sparkles className="text-lime-500 ml-2" strokeWidth={2.5} size={32} />
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Master your skills with <span className="text-foreground font-semibold">interactive challenges</span>.
                            From basic algorithms to complex system design.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-16">
                <div className="relative max-w-xl">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-muted-foreground" />
                    </div>
                    <Input
                        placeholder="Search problems by title or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 py-6 rounded-full text-base border-gray-200 dark:border-white/10 dark:bg-white/5 focus:ring-2 focus:ring-lime-500/20"
                    />
                </div>

                {[1, 2, 3, 4, 5].map((tier) => {
                    const problemsInTier = groupedProblems[tier] || [];
                    if (problemsInTier.length === 0) return null;

                    return (
                        <div key={tier} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg
                                    ${tier === 1 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                                    ${tier === 2 ? 'bg-lime-100 text-lime-600 dark:bg-lime-500/10 dark:text-lime-400' : ''}
                                    ${tier === 3 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                                    ${tier === 4 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' : ''}
                                    ${tier === 5 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : ''}
                                `}>
                                    T{tier}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{getTierName(tier)}</h2>
                                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                        {problemsInTier.length} Challenges
                                    </p>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-white/5 flex-1 ml-4" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {problemsInTier.map((problem) => {
                                    const completed = isCompleted('problem', problem.id);
                                    return (
                                        <div
                                            key={problem.id}
                                            onClick={(e) => handleSolveProblem(e, problem)}
                                            className={`
                                            group relative overflow-hidden
                                            bg-white dark:bg-[#0e0e0e] 
                                            border-2 border-gray-100 dark:border-white/5 
                                            p-0 rounded-[1.5rem]
                                            hover:-translate-y-1 transition-all duration-300 cursor-pointer
                                            flex flex-col h-full min-h-[220px]
                                            ${completed ? 'border-emerald-500/50 dark:border-emerald-500/30' : 'hover:border-primary/50'}
                                            `}
                                        >
                                            {/* Main Subtle Gradient Background */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${problem.difficulty === 'easy' ? 'from-emerald-500/10 dark:from-emerald-500/20' :
                                                    problem.difficulty === 'medium' ? 'from-amber-500/10 dark:from-amber-500/20' :
                                                        'from-rose-500/10 dark:from-rose-500/20'
                                                } via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />

                                            {/* Top Right Glow Blob (Retained for accent) */}
                                            <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${problem.difficulty === 'easy' ? 'from-emerald-500/30' :
                                                    problem.difficulty === 'medium' ? 'from-amber-500/30' :
                                                        'from-rose-500/30'
                                                } to-transparent blur-3xl rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100`} />

                                            {/* Content Container */}
                                            <div className="relative z-10 flex flex-col h-full p-6">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <Badge className={`${getDifficultyColor(problem.difficulty)} border bg-opacity-50 backdrop-blur-sm`}>
                                                        {problem.difficulty}
                                                    </Badge>
                                                    {completed && (
                                                        <div className="bg-emerald-500/10 p-1.5 rounded-full ring-1 ring-emerald-500/20">
                                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Title & Tags */}
                                                <div className="flex-1 mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors leading-tight">
                                                        {problem.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {problem.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md border border-transparent dark:border-white/5">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Footer: Languages & Action */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                                    <div className="flex gap-2">
                                                        {['Py', 'JS', 'C++'].map(lang => (
                                                            <span key={lang} className="text-[10px] font-mono font-medium text-muted-foreground/60 bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                                                {lang}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className={`
                                                        rounded-full w-8 h-8 p-0 
                                                        ${completed ? 'bg-emerald-500/10 text-emerald-500 opacity-100' : 'opacity-0 group-hover:opacity-100'} 
                                                        transition-all -mr-2
                                                    `}
                                                    >
                                                        {completed ? <RotateCw size={14} /> : <ArrowRight size={16} />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {filteredProblems.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Trophy size={48} className="mx-auto mb-4" />
                        <p className="text-xl font-bold">No challenges found</p>
                        <p>Try adjusting your search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
