import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Play,
    X
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../components/ui';
import { CodeEditor } from '../../components/editor';
import { useProgressStore, useUIStore, useUserStore } from '../../stores';
import { useCodeRunner, type LogEntry } from '../../hooks/useCodeRunner';
import { useCodeReview } from '../../hooks/useCodeReview';
import { useAIHint } from '../../hooks/useAIHint';
import type { Lesson } from '../../types';
import AIHintPanel from '../../components/ai/AIHintPanel';
import AIReviewCard from '../../components/ai/AIReviewCard';
import MarkdownContent from '../../components/ui/MarkdownContent';

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

    const {
        hint: aiHint,
        loading: hintLoading,
        error: hintError,
        remainingHints,
        generateHint,
        clearHint
    } = useAIHint(activeLesson.id);

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
    const [isCompleting, setIsCompleting] = useState(false);

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
    }, [currentStep, activeLesson.id, activeLesson.language, clearLogs, currentSection]);

    const handleNext = async () => {
        if (isLastStep) {
            setIsCompleting(true);
            try {
                const user = useUserStore.getState().user;

                if (user) {
                    try {
                        const result = await useProgressStore.getState().validateAndComplete(
                            'lesson',
                            activeLesson.id,
                            activeLesson.language
                        );

                        if (result.success) {
                            addToast('success', `Lesson Completed! +${result.xp_awarded || activeLesson.xpReward} XP`);
                        } else {
                            if (result.message === 'Already completed') {
                                addToast('info', 'Lesson already completed.');
                            } else {
                                addToast('error', 'Failed to save progress. Please check your connection.');
                            }
                        }
                    } catch (error) {
                        console.error('Lesson completion error:', error);
                    }
                } else {
                    addToast("error", "You must be signed in to complete lessons.");
                }

                onComplete();
            } catch (err) {
                console.error('Error in completion flow:', err);
            } finally {
                setIsCompleting(false);
            }
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
        // Auto-close AI panels to show compiler output
        setShowHintPanel(false);
        setShowReviewPanel(false);

        const lang = activeLesson.language;
        const expectedOutput = currentSection.expectedOutput;
        await runCode(code, lang, expectedOutput);
    };

    const toggleHint = () => {
        setShowHintPanel(prev => !prev);
        if (!showHintPanel) setShowReviewPanel(false);
    };

    const handleAIReview = async () => {
        setShowReviewPanel(true);
        setShowHintPanel(false);
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
            testResults: inferredResults.length > 0 ? inferredResults : [{ passed: false, output: 'No execution output yet.' }]
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#09090b] pb-24">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 mb-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent" onClick={onBack}>
                        <ChevronLeft size={18} /> <span className="font-medium">Library</span>
                    </Button>

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

                    <div className="w-[88px] flex justify-end"></div>
                </div>
            </div>

            <div key={currentStep} className={`${['code', 'challenge'].includes(currentSection.type) ? 'max-w-[95vw] px-4 md:px-8' : 'max-w-3xl px-6'} mx-auto`}>
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 ease-out">
                    <div className="mb-8 text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 border border-border px-3 py-1 rounded-full">
                                {currentSection.type}
                            </span>
                        </div>

                        {currentSection.title && (
                            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-6 tracking-tighter leading-[1.1]">
                                {currentSection.title}
                            </h1>
                        )}
                    </div>

                    {currentSection.type === 'text' && (
                        <div className="prose prose-xl prose-stone dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-headings:tracking-tight 
                            prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:text-lg
                            prose-strong:text-foreground prose-strong:font-bold
                            prose-code:text-foreground prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[0.9em]
                            text-left">
                            <MarkdownContent content={currentSection.content} />
                        </div>
                    )}

                    {currentSection.type === 'code' && (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[600px]">
                            <div className="xl:col-span-3 border border-border rounded-xl bg-card max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col shadow-sm text-left relative">
                                <h1 className="text-lg font-bold sticky top-0 bg-card px-5 py-3 z-10 border-b border-border">Task</h1>
                                <div className="p-5 flex-1 flex flex-col pt-2">
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground flex-1">
                                        <MarkdownContent content={currentSection.content} />
                                    </div>

                                    {currentSection.hints && currentSection.hints.length > 0 && (
                                        <div className="mt-8 border-t border-border pt-4">
                                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl">
                                                <h4 className="font-bold text-amber-900 dark:text-amber-400 text-xs uppercase tracking-wide mb-2">Hint</h4>
                                                <div className="text-amber-900/80 dark:text-amber-200/90 text-sm font-medium">
                                                    {currentSection.hints[0]}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="xl:col-span-6 flex flex-col gap-4">
                                <div className="flex flex-col rounded-xl overflow-hidden border border-border shadow-lg bg-[#1e1e1e] flex-[2] min-h-[500px]">
                                    <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Editor</span>
                                    </div>
                                    <div className="flex-1">
                                        <CodeEditor
                                            value={code || ''}
                                            onChange={(v) => setCode(v || '')}
                                            language={activeLesson.language}
                                        />
                                    </div>
                                    <div className="p-4 bg-[#1e1e1e] border-t border-white/5 flex justify-between gap-3 items-center">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={toggleHint}
                                                className={`h-8 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 ${showHintPanel ? "bg-white/10 text-white" : ""}`}
                                            >
                                                Hint
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (showReviewPanel) setShowReviewPanel(false);
                                                    else handleAIReview();
                                                }}
                                                className={`h-8 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 ${showReviewPanel ? "bg-white/10 text-white" : ""}`}
                                            >
                                                Review
                                            </Button>
                                        </div>
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
                            </div>

                            <div className="xl:col-span-3 border border-border rounded-xl bg-card max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col shadow-sm relative text-left">
                                {showHintPanel && (
                                    <div className="absolute inset-0 z-20 bg-card overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between sticky top-0 bg-card px-5 py-3 z-10 border-b border-border shadow-sm">
                                            <h1 className="text-lg font-bold">Hint</h1>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => setShowHintPanel(false)}>
                                                <X size={14} />
                                            </Button>
                                        </div>
                                        <div className="p-5">
                                            <AIHintPanel
                                                challenge={{
                                                    id: activeLesson.id,
                                                    title: activeLesson.title,
                                                    language: activeLesson.language as 'python' | 'javascript' | 'cpp'
                                                }}
                                                userCode={code}
                                                onClose={() => setShowHintPanel(false)}
                                                hint={aiHint}
                                                loading={hintLoading}
                                                error={hintError}
                                                remainingHints={remainingHints}
                                                generateHint={generateHint}
                                                clearHint={clearHint}
                                            />
                                        </div>
                                    </div>
                                )}

                                {showReviewPanel && (
                                    <div className="absolute inset-0 z-20 bg-card overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between sticky top-0 bg-card px-5 py-3 z-10 border-b border-border shadow-sm">
                                            <h1 className="text-lg font-bold">Review</h1>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => setShowReviewPanel(false)}>
                                                <X size={14} />
                                            </Button>
                                        </div>
                                        <div className="p-5">
                                            {currentReview ? (
                                                <AIReviewCard review={currentReview} onClose={() => setShowReviewPanel(false)} />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse space-y-4">
                                                    <LoadingSpinner size={24} />
                                                    <p className="text-xs font-bold tracking-wide uppercase">Reviewing...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <h1 className="text-lg font-bold sticky top-0 bg-card px-5 py-3 z-10 border-b border-border shadow-sm">Output</h1>
                                <div className="p-5 flex-1 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2">
                                    {terminalLogs.length > 0 ? (
                                        <>
                                            {codeValidated && <div className="mb-4 flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 p-2 rounded border border-emerald-500/20"><CheckCircle2 size={14} /> Solution Passed!</div>}
                                            {terminalLogs.map((log, i) => (
                                                <div key={i} className="animate-in fade-in duration-200 break-words">
                                                    {log.type === 'command' && <span className="text-cyan-500 font-bold opacity-80 block mb-1">$ {log.message}</span>}
                                                    {log.type === 'system' && <span className="text-muted-foreground italic block py-1 opacity-70">{log.message}</span>}
                                                    {log.type === 'stdout' && <span className="text-foreground/90 block ml-2 pl-2 border-l-2 border-primary/20">{log.message}</span>}
                                                    {log.type === 'stderr' && <span className="text-red-400 block bg-red-500/10 p-2 rounded border border-red-500/20 my-1">Error: {log.message}</span>}
                                                    {log.type === 'success' && <span className="text-emerald-500 font-bold block mt-2 border-t border-border pt-2">➜ {log.message}</span>}
                                                </div>
                                            ))}
                                            {isRunning && <div className="w-2 h-4 bg-primary/50 animate-pulse inline-block align-middle ml-1"></div>}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-30 text-center">
                                            <Play size={24} className="mb-2 opacity-50" />
                                            <p className="text-sm">Run your code to see the output here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentSection.type === 'challenge' && (
                        <div className="bg-card border border-border p-8 md:p-12 rounded-[2rem] shadow-xl relative overflow-hidden text-left">
                            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-sm font-bold uppercase tracking-widest text-primary">Challenge</span>
                                </div>
                                <div className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                                    <MarkdownContent content={currentSection.content} />
                                </div>

                                {currentSection.hints && (
                                    <div className="w-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl relative overflow-hidden group mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="absolute top-0 left-0 w-1 bg-amber-500 h-full group-hover:w-1.5 transition-all"></div>
                                        <div className="space-y-1 pl-2">
                                            <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm uppercase tracking-wide">Hint</h4>
                                            <div className="text-amber-900/80 dark:text-amber-200/90 text-sm leading-relaxed font-medium">
                                                {currentSection.hints[0]}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                                    <div className="flex flex-col rounded-xl overflow-hidden border border-border shadow-lg bg-[#1e1e1e]">
                                        <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-white/5">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solution Editor</span>
                                        </div>
                                        <div className="flex-1 min-h-[300px]">
                                            <CodeEditor value={code || ''} onChange={(v) => setCode(v || '')} language={activeLesson.language} />
                                        </div>
                                        <div className="p-4 bg-[#1e1e1e] border-t border-white/5 flex justify-end">
                                            <Button onClick={handleRunCode} disabled={isRunning} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" size="sm">
                                                {isRunning ? <LoadingSpinner size={14} className="mr-2" /> : <Play className="mr-2" size={14} />}
                                                Run Solution
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="h-full rounded-xl overflow-hidden border bg-card/50 flex flex-col border-border shadow-inner">
                                        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
                                            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Test Runner</span>
                                        </div>
                                        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1">
                                            {terminalLogs.length > 0 ? (
                                                terminalLogs.map((log, i) => (
                                                    <div key={i} className="animate-in fade-in duration-200">
                                                        {log.type === 'command' && <span className="text-cyan-400 font-bold">$ {log.message}</span>}
                                                        {log.type === 'system' && <span className="text-gray-500 italic block py-1">{log.message}</span>}
                                                        {log.type === 'stdout' && <span className="text-gray-200 block ml-4">{log.message}</span>}
                                                        {log.type === 'stderr' && <span className="text-red-400">{log.message}</span>}
                                                        {log.type === 'success' && <span className="text-emerald-500 font-bold block mt-4">➜ {log.message}</span>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center opacity-30">
                                                    <p className="text-sm">Run solution to see results.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-8 pb-12">
                        <Button variant="secondary" onClick={handlePrev} disabled={currentStep === 0} className="rounded-full px-6 text-muted-foreground">
                            Previous
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!canProceed || isCompleting}
                            className={`rounded-full px-8 h-11 text-sm font-bold shadow-md transition-all ${canProceed && !isCompleting ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            {isCompleting ? (
                                <>
                                    <LoadingSpinner size={16} className="mr-2" />
                                    <span>Completing...</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLastStep ? 'Complete' : 'Next Step'}</span>
                                    {isLastStep ? <CheckCircle2 size={16} className="ml-2" /> : <ChevronRight size={16} className="ml-2" />}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
