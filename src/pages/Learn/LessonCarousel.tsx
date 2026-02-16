import React, { useState, useEffect, useCallback } from 'react';
import {
    BookOpen,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    ChevronLeft,
    Play,
    Terminal,
    Lightbulb,
    Brain
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../components/ui';
import { CodeEditor } from '../../components/editor';
import { useProgressStore, useUIStore, useUserStore } from '../../stores';
import { useCodeRunner, type LogEntry } from '../../hooks/useCodeRunner';
import { useCodeReview } from '../../hooks/useCodeReview';
import type { Lesson } from '../../types';
import AIHintPanel from '../../components/ai/AIHintPanel';
import AIReviewCard from '../../components/ai/AIReviewCard';

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

interface LessonCarouselProps {
    activeLesson: Lesson;
    onComplete: () => void;
    onBack: () => void;
}

// Helper to get default code by language
const getDefaultCode = (lang: string) => {
    const defaults: Record<string, string> = {
        python: '# Write your code here\n',
        javascript: '// Write your code here\n',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}'
    };
    return defaults[lang] || '';
};

export const LessonCarousel: React.FC<LessonCarouselProps> = ({ activeLesson, onComplete, onBack }) => {
    const { addXP } = useUserStore();
    const { markComplete } = useProgressStore();
    const { addToast } = useUIStore();
    const {
        isRunning,
        terminalLogs,
        isValidated: codeValidated,
        runCode,
        clearLogs
    } = useCodeRunner();

    const {
        review: currentReview,
        generateReview
    } = useCodeReview();

    // Initialize state
    const [currentStep, setCurrentStep] = useState(0);
    const currentSection = activeLesson.sections[currentStep];

    const getInitialCode = useCallback((step: number) => {
        const section = activeLesson.sections[step];
        if (section && (section.type === 'code' || section.type === 'challenge')) {
            return section.codeTemplate || getDefaultCode(activeLesson.language);
        }
        return '';
    }, [activeLesson]);

    const [code, setCode] = useState(() => getInitialCode(0));
    const [showHintPanel, setShowHintPanel] = useState(false);
    const [showReviewPanel, setShowReviewPanel] = useState(false);

    const totalSteps = activeLesson.sections.length;
    const isLastStep = currentStep === totalSteps - 1;
    const isCodeStep = currentSection.type === 'code' || currentSection.type === 'challenge';
    const canProceed = isCodeStep ? codeValidated : true;

    // Reset editor state when changing sections
    useEffect(() => {
        if (currentSection && (currentSection.type === 'code' || currentSection.type === 'challenge')) {
            const initialForStep = currentSection.codeTemplate || getDefaultCode(activeLesson.language);
            setCode(initialForStep);
            clearLogs();
        }
        // ESLint might complain about missing dependencies, but we ONLY want this to run when the step changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, activeLesson.id, activeLesson.language, clearLogs]);

    const handleNext = () => {
        if (isLastStep) {
            // Requirement 2.2, 2.3, 2.4, 2.5: Award XP and mark complete
            markComplete('lesson', activeLesson.id);
            addXP(activeLesson.xpReward);
            addToast("success", `Lesson Completed! You've earned ${activeLesson.xpReward} XP.`);
            onComplete();
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

    const handleRunCode = async () => {
        const lang = activeLesson.language;
        const expectedOutput = currentSection.expectedOutput;
        await runCode(code, lang, expectedOutput);
    };

    const handleAIReview = async () => {
        setShowReviewPanel(true);
        const inferredResults = terminalLogs
            .filter((log: LogEntry) => log.type === 'success' || log.type === 'stderr')
            .map((log: LogEntry) => ({
                passed: log.type === 'success',
                output: log.message,
                error: log.type === 'stderr' ? log.message : undefined
            }));

        await generateReview({
            challengeId: activeLesson.id,
            code: code,
            language: activeLesson.language as 'python' | 'javascript' | 'cpp',
            testResults: inferredResults
        });
    };

    const handleCloseHints = () => setShowHintPanel(false);
    const handleCloseReview = () => setShowReviewPanel(false);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#09090b] pb-24">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 mb-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent" onClick={onBack}>
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

            <div key={currentStep} className={`${['code', 'challenge'].includes(currentSection.type) ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-6`}>
                {/* Content Card */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 ease-out">

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
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
                            {/* Column 1: Description */}
                            <div className="lg:col-span-3 border border-border rounded-xl p-4 bg-card max-h-[700px] overflow-y-auto custom-scrollbar flex flex-col">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 sticky top-0 bg-card py-2 z-10 border-b border-border">
                                    <BookOpen size={20} className="text-primary" />
                                    Task
                                </h2>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground flex-1">
                                    {renderMarkdown(currentSection.content)}
                                </div>

                                {/* Static hints from lesson data */}
                                {currentSection.hints && currentSection.hints.length > 0 && (
                                    <div className="mt-8 border-t border-border pt-4">
                                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl">
                                            <h4 className="font-bold text-amber-900 dark:text-amber-400 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                                                <Lightbulb size={14} /> Lesson Hint
                                            </h4>
                                            <div className="text-amber-900/80 dark:text-amber-200/90 text-sm font-medium">
                                                {currentSection.hints[0]}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Column 2 & 3: Editor & Output & AI Integrated */}
                            <div className="lg:col-span-9 flex flex-col lg:flex-row gap-6">
                                {/* Editor & Terminal Area */}
                                <div className="flex flex-col gap-4 flex-1 min-w-0">
                                    {/* Editor */}
                                    <div className="flex flex-col rounded-xl overflow-hidden border border-border shadow-lg bg-[#1e1e1e] flex-[2] min-h-[400px]">
                                        <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-white/5">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Editor</span>
                                            <div className="flex gap-1.5 opacity-40">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <CodeEditor
                                                value={code || ''}
                                                onChange={(v) => setCode(v || '')}
                                                language={activeLesson.language}
                                            />
                                        </div>
                                        <div className="p-4 bg-[#1e1e1e] border-t border-white/5 flex justify-end gap-3">
                                            <Button
                                                onClick={handleRunCode}
                                                disabled={isRunning}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                                size="sm"
                                            >
                                                {isRunning ? <LoadingSpinner size={14} className="mr-2" /> : <Play className="mr-2" size={14} />}
                                                Run Code
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Output Terminal */}
                                    <div className="flex flex-col flex-1 min-h-[200px] border border-gray-800 rounded-xl overflow-hidden bg-[#1e1e1e]">
                                        {terminalLogs.length > 0 ? (
                                            <>
                                                <div className="px-4 py-2 bg-[#1e1e1e] border-b border-white/5 flex items-center justify-between sticky top-0">
                                                    <span className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                                        <Terminal size={14} /> Output
                                                    </span>
                                                    {codeValidated && <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in"><CheckCircle2 size={14} /> Passed</div>}
                                                </div>
                                                <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1 custom-scrollbar">
                                                    {terminalLogs.map((log, i) => (
                                                        <div key={i} className="animate-in fade-in duration-200">
                                                            {log.type === 'command' && <span className="text-cyan-400 font-bold">$ {log.message}</span>}
                                                            {log.type === 'system' && <span className="text-gray-500 italic block py-1">{log.message}</span>}
                                                            {log.type === 'stdout' && <span className="text-gray-200 block ml-4 whitespace-pre-wrap">{log.message}</span>}
                                                            {log.type === 'stderr' && <span className="text-red-400 block bg-red-950/20 p-2 rounded border border-red-900/50">Error: {log.message}</span>}
                                                            {log.type === 'success' && <span className="text-emerald-500 font-bold block mt-4 border-t border-white/10 pt-2">➜ {log.message}</span>}
                                                        </div>
                                                    ))}
                                                    {isRunning && <div className="w-2 h-4 bg-gray-500/50 animate-pulse inline-block align-middle ml-1"></div>}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center opacity-50">
                                                <Terminal size={24} className="mb-2" />
                                                <p className="text-xs">Run code to see output</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 4: AI Assistant (Integrated) */}
                                <div className="w-full lg:w-[38%] shrink-0 space-y-4">
                                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full flex flex-col">
                                        <div className="flex items-center gap-2 mb-4 font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                                            <Brain size={16} className="text-emerald-500" /> AI Assistant
                                        </div>

                                        <div className="flex gap-2 mb-6">
                                            <Button
                                                size="sm"
                                                onClick={() => setShowHintPanel(!showHintPanel)}
                                                variant={showHintPanel ? "primary" : "secondary"}
                                                className={`flex-1 ${showHintPanel ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                                            >
                                                <Lightbulb size={14} className="mr-2" /> Hint
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleAIReview}
                                                variant={showReviewPanel ? "primary" : "secondary"}
                                                className={`flex-1 ${showReviewPanel ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                                            >
                                                <Sparkles size={14} className="mr-2" /> Review
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                            {showHintPanel && activeLesson && (
                                                <AIHintPanel
                                                    challenge={{
                                                        id: activeLesson.id,
                                                        title: activeLesson.title,
                                                        language: activeLesson.language as 'python' | 'javascript' | 'cpp'
                                                    }}
                                                    userCode={code}
                                                    onClose={handleCloseHints}
                                                />
                                            )}

                                            {showReviewPanel && currentReview && (
                                                <AIReviewCard
                                                    review={currentReview}
                                                    onClose={handleCloseReview}
                                                />
                                            )}

                                            {showReviewPanel && !currentReview && (
                                                <div className="text-center py-8 text-muted-foreground animate-pulse">
                                                    <LoadingSpinner className="mx-auto mb-2 text-emerald-500" size={24} />
                                                    <p className="text-sm font-medium">Analyzing your code...</p>
                                                </div>
                                            )}

                                            {!showHintPanel && !showReviewPanel && (
                                                <div className="text-center py-12 text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-xl">
                                                    <Brain className="mx-auto mb-3 opacity-20" size={40} />
                                                    <p className="text-sm font-medium text-muted-foreground/80">AI Helper is Ready</p>
                                                    <p className="text-xs mt-1 max-w-[150px] mx-auto">Get hints or code reviews instantly.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                                    <div className="w-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl relative overflow-hidden group mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="absolute top-0 left-0 w-1 bg-amber-500 h-full group-hover:w-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.5)]"></div>
                                        <div className="flex gap-4">
                                            <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/20">
                                                <Lightbulb size={20} className="fill-amber-500/20" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm uppercase tracking-wide flex items-center gap-2">
                                                    Hint
                                                </h4>
                                                <div className="text-amber-900/80 dark:text-amber-200/90 text-sm leading-relaxed font-medium">
                                                    {currentSection.hints[0]}
                                                </div>
                                            </div>
                                        </div>
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
                                                {isRunning ? <LoadingSpinner size={14} className="mr-2" /> : <Play className="mr-2" size={14} />}
                                                Run Solution
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Output Terminal for Challenge */}
                                    <div className="flex flex-col">
                                        <div className={`h-full rounded-xl overflow-hidden border flex flex-col transition-all duration-300 ${terminalLogs.length > 0
                                            ? 'bg-[#1e1e1e] border-gray-800'
                                            : 'bg-muted/30 border-dashed border-border'
                                            }`}>
                                            {/* Terminal Header */}
                                            {terminalLogs.length > 0 ? (
                                                <div className="px-4 py-3 bg-[#1e1e1e] border-b border-white/5 flex items-center justify-between">
                                                    <span className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                                        <Terminal size={14} />
                                                        Test Runner
                                                    </span>
                                                </div>
                                            ) : null}

                                            {/* Terminal Body */}
                                            {terminalLogs.length > 0 ? (
                                                <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1">
                                                    {terminalLogs.map((log, i) => (
                                                        <div key={i} className="animate-in fade-in duration-200">
                                                            {log.type === 'command' && <span className="text-cyan-400 font-bold">$ {log.message}</span>}
                                                            {log.type === 'system' && <span className="text-gray-500 italic block py-1">{log.message}</span>}
                                                            {log.type === 'stdout' && <span className="text-gray-200 block ml-4">{log.message}</span>}
                                                            {log.type === 'stderr' && <span className="text-red-400">{log.message}</span>}
                                                            {log.type === 'success' && <span className="text-emerald-500 font-bold block mt-4">➜ {log.message}</span>}
                                                        </div>
                                                    ))}
                                                    {isRunning && <div className="w-2 h-4 bg-gray-500/50 animate-pulse inline-block align-middle ml-1"></div>}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                                                    <Terminal size={24} className="mb-3 opacity-30" />
                                                    <p className="text-sm">Run test cases.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Navigation Controls (Inline) */}
                <div className="flex justify-between items-center pt-8 pb-12">
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
};
