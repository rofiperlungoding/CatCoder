import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Search,
    Clock,
    Code,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    ChevronLeft,
    Play,
    Terminal,
    HelpCircle,
    Lightbulb
} from 'lucide-react';
import { Badge, Tabs, Button } from '../../components/ui';
import { CodeEditor } from '../../components/editor';
import { useUserStore, useProgressStore, useUIStore } from '../../stores';
import type { Lesson, Language, Tier } from '../../types';
import { lessons as lessonsData } from '../../data/lessons';

export const LearnPage: React.FC = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { selectedLanguage, setSelectedLanguage, addXP } = useUserStore();
    const { isCompleted, markComplete } = useProgressStore();
    const { addToast } = useUIStore();

    // List State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');

    // Detail State
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    // Editor State
    const [code, setCode] = useState('');
    const [output, setOutput] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [codeValidated, setCodeValidated] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Load lesson when lessonId changes
    useEffect(() => {
        if (lessonId) {
            const lesson = lessonsData.find(l => l.id === lessonId);
            if (lesson) {
                setActiveLesson(lesson);
                setCurrentStep(0);
            }
        } else {
            setActiveLesson(null);
        }
    }, [lessonId]);

    // Reset code when step changes to a code section
    useEffect(() => {
        if (activeLesson) {
            const currentSection = activeLesson.sections[currentStep];
            if (currentSection && (currentSection.type === 'code' || currentSection.type === 'challenge')) {
                const initialCode = currentSection.codeTemplate || getDefaultCode(activeLesson.language);
                setCode(initialCode);
                setOutput(null);
                setCodeValidated(false);
                setValidationError(null);
            }
        }
    }, [activeLesson, currentStep]);

    // Helper to get default code by language
    const getDefaultCode = (lang: string) => {
        const defaults: Record<string, string> = {
            python: '# Write your code here\n',
            javascript: '// Write your code here\n',
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}'
        };
        return defaults[lang] || '';
    };

    // Simulate code execution and validate output
    const handleRunCode = () => {
        setIsRunning(true);
        setOutput(null);
        setValidationError(null);

        const currentSection = activeLesson?.sections[currentStep];
        const expectedOutput = currentSection?.expectedOutput;

        setTimeout(() => {
            setIsRunning(false);
            const simulatedOutput = simulateCodeExecution(code, activeLesson?.language || 'python');
            setOutput(simulatedOutput);

            if (expectedOutput) {
                const normalizedExpected = expectedOutput.trim().toLowerCase();
                const normalizedActual = simulatedOutput.trim().toLowerCase();

                if (normalizedActual.includes(normalizedExpected) || normalizedExpected.includes(normalizedActual)) {
                    setCodeValidated(true);
                    setValidationError(null);
                    // addToast('success', 'Output matches expected result!');
                } else {
                    setCodeValidated(false);
                    setValidationError(`Expected: "${expectedOutput}" but got different output.`);
                    // addToast('error', 'Output does not match expected result.');
                }
            } else {
                setCodeValidated(true);
                // addToast('success', 'Code executed successfully');
            }
        }, 1200);
    };

    // Simple code execution simulator
    const simulateCodeExecution = (codeStr: string, lang: string): string => {
        try {
            if (lang === 'python') {
                const printMatch = codeStr.match(/print\(['"](.+?)['"]\)/g);
                if (printMatch) {
                    return printMatch.map(p => p.replace(/print\(['"]|['"]\)/g, '')).join('\n');
                }
            } else if (lang === 'javascript') {
                const logMatch = codeStr.match(/console\.log\(['"](.+?)['"]\)/g);
                if (logMatch) {
                    return logMatch.map(l => l.replace(/console\.log\(['"]|['"]\)/g, '')).join('\n');
                }
            } else if (lang === 'cpp') {
                const coutMatch = codeStr.match(/cout\s*<<\s*['"](.+?)['"]/g);
                if (coutMatch) {
                    return coutMatch.map(c => c.replace(/cout\s*<<\s*['"]/g, '').replace(/['"]$/g, '')).join('\n');
                }
            }
            return 'Executed successfully.';
        } catch {
            return 'Error executing code.';
        }
    };

    // Helper to render content with markdown (bold and code blocks)
    const renderMarkdown = (content: string) => (
        <div className="whitespace-pre-line">
            {content.split('```').map((part, i) => {
                if (i % 2 === 1) {
                    const lines = part.split('\n');
                    const codeContent = lines.slice(1).join('\n');
                    return (
                        <div key={i} className="not-prose my-12 rounded-xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl">
                            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2 opacity-20">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                </div>
                                <div className="ml-auto text-xs font-mono text-gray-500">code</div>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <code className="font-mono text-sm text-gray-300 leading-relaxed block whitespace-pre">{codeContent}</code>
                            </div>
                        </div>
                    );
                }
                return (
                    <span key={i}>
                        {part.split(/(\*\*.*?\*\*)/).map((chunk, j) => {
                            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                return <strong key={j} className="text-foreground font-black">{chunk.slice(2, -2)}</strong>;
                            }
                            return chunk;
                        })}
                    </span>
                );
            })}
        </div>
    );

    const handleCompleteLessonDisplay = () => {
        if (!activeLesson) return;

        if (!isCompleted('lesson', activeLesson.id)) {
            markComplete('lesson', activeLesson.id);
            addXP(activeLesson.xpReward);
            addToast('xp', `Completed "${activeLesson.title}"! +${activeLesson.xpReward} XP`);
        }
        navigate('/learn');
    };

    const handleStartLesson = (lesson: Lesson) => {
        navigate(`/learn/${lesson.id}`);
    };

    const languageTabs = [
        { id: 'python', label: 'Python', icon: <Code size={16} /> },
        { id: 'javascript', label: 'JavaScript', icon: <Code size={16} /> },
        { id: 'cpp', label: 'C++', icon: <Code size={16} /> }
    ];

    const filteredLessons = lessonsData.filter(lesson => {
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

    const completedCount = lessonsData.filter(l =>
        l.language === selectedLanguage && isCompleted('lesson', l.id)
    ).length;
    const totalCount = lessonsData.filter(l => l.language === selectedLanguage).length;

    // ========= RENDER DETAIL VIEW (CAROUSEL) =========
    if (activeLesson) {
        const totalSteps = activeLesson.sections.length;
        const currentSection = activeLesson.sections[currentStep];
        const isLastStep = currentStep === totalSteps - 1;
        const isCodeStep = currentSection.type === 'code' || currentSection.type === 'challenge';
        const canProceed = isCodeStep ? codeValidated : true;

        const handleNext = () => {
            if (isLastStep) {
                handleCompleteLessonDisplay();
            } else if (canProceed) {
                setCurrentStep(prev => prev + 1);
                window.scrollTo(0, 0);
            }
        };

        const handlePrev = () => {
            if (currentStep > 0) {
                setCurrentStep(prev => prev - 1);
            }
        };

        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-[#09090b] pb-24">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 mb-10">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent" onClick={() => navigate('/learn')}>
                            <ChevronLeft size={18} /> <span className="font-medium">Library</span>
                        </Button>

                        {/* Progress */}
                        <div className="flex-1 max-w-sm mx-auto px-4">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                <span>Part {currentStep + 1}</span>
                                <span>{totalSteps} Steps</span>
                            </div>
                            <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="w-[88px] flex justify-end">
                            {/* Placeholder for future tools */}
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6">
                    {/* Content Card */}
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

                        {/* Section Header */}
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 border border-border px-3 py-1 rounded-full">
                                    {currentSection.type}
                                </span>
                            </div>

                            {currentSection.title && (
                                <h1 className="text-4xl md:text-6xl font-black text-foreground mb-8 tracking-tighter leading-[1.1] text-left">
                                    {currentSection.title}
                                </h1>
                            )}
                        </div>

                        {/* Text Content */}
                        {currentSection.type === 'text' && (
                            <div className="prose prose-xl prose-stone dark:prose-invert max-w-none 
                                prose-headings:font-bold prose-headings:tracking-tight 
                                prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:text-lg
                                prose-strong:text-foreground prose-strong:font-bold
                                prose-code:text-foreground prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[0.9em]
                                ">
                                {renderMarkdown(currentSection.content)}
                            </div>
                        )}

                        {/* Code Practice Section */}
                        {currentSection.type === 'code' && (
                            <div className="grid grid-cols-1 gap-8">
                                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
                                    {renderMarkdown(currentSection.content)}
                                </div>

                                {currentSection.hints && currentSection.hints.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-5 rounded-r-lg">
                                        <h4 className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 mb-2 text-sm uppercase tracking-wide">
                                            <Lightbulb size={16} /> Hint
                                        </h4>
                                        <div className="text-blue-800 dark:text-blue-200/80 text-sm leading-relaxed">
                                            {currentSection.hints[0]}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
                                    {/* Editor */}
                                    <div className="flex flex-col rounded-xl overflow-hidden border border-border shadow-lg bg-[#1e1e1e]">
                                        <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-white/5">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Editor</span>
                                            <div className="flex gap-1.5 opacity-40">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-[400px]">
                                            <CodeEditor
                                                value={code || ''}
                                                onChange={(v) => setCode(v || '')}
                                                language={activeLesson.language}
                                            />
                                        </div>
                                        <div className="p-4 bg-[#1e1e1e] border-t border-white/5 flex justify-end">
                                            <Button
                                                onClick={handleRunCode}
                                                disabled={isRunning}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                                size="sm"
                                            >
                                                {isRunning ? <Sparkles className="animate-spin mr-2" size={14} /> : <Play className="mr-2" size={14} />}
                                                Run
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Output */}
                                    <div className="flex flex-col">
                                        {(output || validationError) ? (
                                            <div className={`h-full rounded-xl p-5 font-mono text-sm border flex flex-col animate-in fade-in zoom-in-95 duration-200 ${codeValidated
                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
                                                : validationError
                                                    ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50'
                                                    : 'bg-card border-border'
                                                }`}>
                                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5 dark:border-white/5">
                                                    <span className="font-bold text-xs uppercase tracking-wider opacity-70 flex items-center gap-2">
                                                        <Terminal size={14} />
                                                        {codeValidated ? 'Passed' : 'Console'}
                                                    </span>
                                                    {codeValidated && <CheckCircle2 size={16} className="text-emerald-500" />}
                                                </div>

                                                <div className={`flex-1 whitespace-pre-wrap ${codeValidated ? 'text-emerald-700 dark:text-emerald-300' : validationError ? 'text-red-700 dark:text-red-300' : 'text-foreground'}`}>
                                                    {validationError || output}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/30">
                                                <Terminal size={24} className="mb-3 opacity-30" />
                                                <p className="text-sm">Output will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Challenge Section */}
                        {currentSection.type === 'challenge' && (
                            <div className="bg-card dark:bg-card border border-border p-8 md:p-12 rounded-[2rem] shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <Sparkles size={20} className="text-primary" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest text-primary">Challenge</span>
                                    </div>

                                    <div className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                                        {renderMarkdown(currentSection.content)}
                                    </div>

                                    {currentSection.hints && (
                                        <div className="bg-muted/50 rounded-xl p-6 border border-border mb-8 inline-block">
                                            <p className="font-bold text-muted-foreground text-xs tracking-wider uppercase mb-2 flex items-center gap-2">
                                                <HelpCircle size={14} /> Hint
                                            </p>
                                            <p className="text-foreground/80">{currentSection.hints[0]}</p>
                                        </div>
                                    )}

                                    {/* Code Editor for Challenge */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                                        {/* Editor */}
                                        <div className="flex flex-col rounded-xl overflow-hidden border border-border shadow-lg bg-[#1e1e1e]">
                                            <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-white/5">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solution Editor</span>
                                            </div>
                                            <div className="flex-1 min-h-[300px]">
                                                <CodeEditor
                                                    value={code || ''}
                                                    onChange={(v) => setCode(v || '')}
                                                    language={activeLesson.language}
                                                />
                                            </div>
                                            <div className="p-4 bg-[#1e1e1e] border-t border-white/5 flex justify-end">
                                                <Button
                                                    onClick={handleRunCode}
                                                    disabled={isRunning}
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                                    size="sm"
                                                >
                                                    {isRunning ? <Sparkles className="animate-spin mr-2" size={14} /> : <Play className="mr-2" size={14} />}
                                                    Run Solution
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Output */}
                                        <div className="flex flex-col">
                                            {(output || validationError) ? (
                                                <div className={`h-full rounded-xl p-5 font-mono text-sm border flex flex-col animate-in fade-in zoom-in-95 duration-200 ${codeValidated
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
                                                    : validationError
                                                        ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50'
                                                        : 'bg-card border-border'
                                                    }`}>
                                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5 dark:border-white/5">
                                                        <span className="font-bold text-xs uppercase tracking-wider opacity-70 flex items-center gap-2">
                                                            <Terminal size={14} />
                                                            {codeValidated ? 'Passed' : 'Console'}
                                                        </span>
                                                        {codeValidated && <CheckCircle2 size={16} className="text-emerald-500" />}
                                                    </div>

                                                    <div className={`flex-1 whitespace-pre-wrap ${codeValidated ? 'text-emerald-700 dark:text-emerald-300' : validationError ? 'text-red-700 dark:text-red-300' : 'text-foreground'}`}>
                                                        {validationError || output}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/30">
                                                    <Terminal size={24} className="mb-3 opacity-30" />
                                                    <p className="text-sm">Run your code to see output</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-t border-gray-200 dark:border-white/5">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <Button
                            variant="secondary"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="rounded-full px-6 text-muted-foreground"
                        >
                            Previous
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!canProceed}
                            className={`rounded-full px-8 h-11 text-sm font-bold shadow-md transition-all ${canProceed
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <span>{isLastStep ? 'Complete' : 'Next Step'}</span>
                            {isLastStep ? <CheckCircle2 size={16} className="ml-2" /> : <ArrowRight size={16} className="ml-2" />}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ========= RENDER LIST VIEW =========
    return (
        <div className="space-y-8">
            {/* Header Bento */}
            <div className="relative overflow-hidden bg-black dark:bg-card text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 dark:shadow-black/20 border border-transparent dark:border-border">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6">
                            <Sparkles size={12} className="text-lime-400" />
                            <span>Interactive Curriculum</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4 flex items-center gap-4 text-white">
                            Learning Library
                        </h1>
                        <p className="text-white/70 max-w-lg text-lg leading-relaxed">
                            Structured paths to take you from beginner to expert. Master concepts one by one.
                        </p>
                    </div>

                    <div className="w-full md:w-auto min-w-[280px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-black/10 dark:border-white/5 shadow-xl shadow-black/10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-sm font-semibold text-white/60 tracking-wide">Course Progress</span>
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-4xl font-black text-lime-400 tracking-tight">{Math.round((completedCount / (totalCount || 1)) * 100)}</span>
                                <span className="text-lg font-bold text-lime-400/70">%</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-5">
                            <div
                                className="h-full bg-gradient-to-r from-lime-400 to-lime-300 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.round((completedCount / (totalCount || 1)) * 100)}%` }}
                            />
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3">
                            <div className="flex-1 bg-white/5 py-2.5 rounded-xl flex items-center justify-center gap-2 border border-black/10 dark:border-white/5">
                                <CheckCircle2 size={14} className="text-lime-400" />
                                <span className="text-xs font-semibold text-white/80">{completedCount} Done</span>
                            </div>
                            <div className="flex-1 bg-white/5 py-2.5 rounded-xl flex items-center justify-center gap-2 border border-black/10 dark:border-white/5">
                                <BookOpen size={14} className="text-white/40" />
                                <span className="text-xs font-semibold text-white/80">{totalCount} Total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Tabs
                    tabs={languageTabs}
                    activeTab={selectedLanguage}
                    onTabChange={(id) => setSelectedLanguage(id as Language)}
                />
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-6 py-3 bg-white dark:bg-card text-primary dark:text-white border border-gray-200 dark:border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-lime-100 dark:focus:ring-lime-900 focus:border-lime-500 transition-all font-sans shadow-sm"
                        />
                    </div>
                    <select
                        className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-full text-sm px-6 py-3 focus:outline-none focus:ring-2 focus:ring-lime-100 dark:focus:ring-lime-900 font-sans shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-muted text-primary dark:text-white transition-colors"
                        value={selectedTier.toString()}
                        onChange={(e) => setSelectedTier(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as Tier)}
                    >
                        <option value="all">All Tiers</option>
                        <option value="1">Tier 1: Seedling</option>
                        <option value="2">Tier 2: Sprout</option>
                        <option value="3">Tier 3: Growing</option>
                        <option value="4">Tier 4: Mature</option>
                        <option value="5">Tier 5: Expert</option>
                    </select>
                </div>
            </div>

            {/* Tiers & Lessons Grid */}
            <div className="space-y-12 pb-20">
                {Object.entries(groupedLessons).map(([tier, lessons]) => (
                    <div key={tier}>
                        <div className="flex items-center gap-4 mb-8">
                            <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-white dark:bg-card shadow-sm border border-gray-100 dark:border-border rounded-full">
                                Tier {tier}
                            </Badge>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-border"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lessons.map((lesson) => {
                                const completed = isCompleted('lesson', lesson.id);
                                return (
                                    <div
                                        key={lesson.id}
                                        onClick={() => handleStartLesson(lesson)}
                                        className={`
                                            group relative p-8 rounded-[2.5rem] border border-transparent transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[240px]
                                            ${completed
                                                ? 'bg-gray-50 dark:bg-muted/50 border-gray-100 dark:border-border'
                                                : 'bg-white dark:bg-card shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-lime-200 dark:hover:border-lime-900 hover:-translate-y-1'
                                            }
                                        `}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                                                    ${completed
                                                        ? 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400'
                                                        : 'bg-gray-100 dark:bg-muted text-primary dark:text-white group-hover:bg-primary group-hover:text-lime-400 dark:group-hover:bg-white dark:group-hover:text-black'
                                                    }
                                                `}>
                                                    {completed ? <CheckCircle2 size={24} /> : <Code size={24} />}
                                                </div>
                                                {completed && (
                                                    <Badge variant="success" size="sm" className="bg-lime-100 text-lime-700 border-lime-200">Completed</Badge>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-lg text-primary mb-3">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                {lesson.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-border">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                <Clock size={14} /> {lesson.estimatedTime} min
                                            </span>

                                            {!completed ? (
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:text-lime-600 transition-colors">
                                                    Start Lesson <ArrowRight size={14} />
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1 text-lime-600 text-xs font-bold">
                                                    +{lesson.xpReward} XP Earned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
