/**
 * Code task — "the Build" (Req 9), unified into TWO clean zones (Pack #14):
 *
 *   Zone A — Task panel: one calm surface holding the task label, instructions,
 *            expected output, and an inline collapsible "Need a hint?" disclosure
 *            (progressive hint1 → hint2 → workedStep → solution) at the bottom.
 *   Zone B — Code workspace: one focal IDE-like surface holding a slim toolbar
 *            (filename + Run), the editor, a thin divider, and the output/test
 *            results — never two floating cards. Code/Output tab on mobile.
 *
 * Runs via {@link useCodeRunner} (single run, validated client-side against each
 * visible test to respect the hook's rate limit). Failing tests show supportive
 * feedback and never block further attempts. Run is a neutral (ghost) action so
 * the single lime primary stays in the bottom action bar.
 */
import { PlayIcon, CheckmarkCircle02Icon, AlertCircleIcon, Idea01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, LoadingSpinner } from '../../../../components/ui';
import { CodeEditor } from '../../../../components/editor';
import { useCodeRunner } from '../../../../hooks/useCodeRunner';
import MarkdownContent from '../../../../components/ui/MarkdownContent';
import { AWARD_XP, estimateXpAfterHints } from '../engine/xpRules';
import { HINT_ORDER } from '../state/lessonMachine';
import { Console } from './Console';
import type { BlockComponentProps } from './blockContract';

const norm = (s: string) => s.replace(/\r\n/g, '\n').trim().toLowerCase();

const FILENAME: Record<string, string> = { python: 'main.py', javascript: 'main.js', cpp: 'main.cpp' };

function actualFromLogs(logs: { type: string; message: string }[]): { output: string; error: boolean } {
    const err = logs.find((l) => l.type === 'stderr');
    if (err) return { output: err.message, error: true };
    return { output: logs.filter((l) => l.type === 'stdout').map((l) => l.message).join('\n'), error: false };
}

export const CodeTaskBuild: React.FC<BlockComponentProps> = ({ block, language, phase, result, onResult, announce, hintLevel = 0, onRevealHint }) => {
    const { terminalLogs, isRunning, runCode } = useCodeRunner();
    const [code, setCode] = useState(block.code ?? '');
    const [testStates, setTestStates] = useState<boolean[] | null>(null);
    const [ranWithError, setRanWithError] = useState(false);
    const [tab, setTab] = useState<'code' | 'output'>('code');
    const [hintOpen, setHintOpen] = useState(false);
    const awaiting = useRef(false);
    const tests = useMemo(() => block.tests ?? [], [block.tests]);

    const allPassed = result?.correct === true;
    const taskLabel = phase === 'PostFlight' ? 'Transfer task' : 'Your task';

    useEffect(() => {
        if (awaiting.current && !isRunning) {
            awaiting.current = false;
            const { output, error } = actualFromLogs(terminalLogs);
            setRanWithError(error);
            setTab('output');
            if (tests.length === 0) {
                const ok = !error;
                setTestStates(ok ? [] : null);
                onResult({ blockId: block.id, attempted: true, correct: ok, conceptId: block.conceptId });
                announce?.(ok ? 'Your code ran successfully.' : 'Your code raised an error.');
                return;
            }
            const states = tests.map((t) => !error && norm(output).includes(norm(t.expectedOutput)));
            setTestStates(states);
            const passed = states.every(Boolean);
            onResult({ blockId: block.id, attempted: true, correct: passed, conceptId: block.conceptId });
            announce?.(passed ? `All ${states.length} tests passed.` : `${states.filter(Boolean).length} of ${states.length} tests passed.`);
        }
    }, [isRunning, terminalLogs, tests, block.id, block.conceptId, onResult, announce]);

    const run = async () => {
        awaiting.current = true;
        announce?.('Running your solution against the tests');
        await runCode(code, language);
    };

    const xpEstimate = useMemo(() => Math.round(estimateXpAfterHints(AWARD_XP.practice, hintLevel)), [hintLevel]);

    const assistance = useMemo(() => {
        const items: { label: string; body: React.ReactNode }[] = [];
        const expected = block.expectedOutput;
        if (hintLevel >= 1) items.push({ label: 'Hint 1', body: 'Re-read the task and identify the single thing the output must show.' });
        if (hintLevel >= 2) items.push({ label: 'Hint 2', body: expected ? `Your program needs to produce output containing "${expected}".` : 'Make sure your program prints its result, not just computes it.' });
        if (hintLevel >= 3) items.push({ label: 'Worked step', body: 'Start from the provided template, then add the one statement that prints the required value. Run often.' });
        if (hintLevel >= 4) items.push({ label: 'Solution', body: <pre className="m-0 cc-mono text-xs whitespace-pre-wrap mt-1" style={{ color: 'var(--cc-tx-1)' }}>{block.code || '# Build from the template and print the expected output.'}</pre> });
        return items;
    }, [hintLevel, block.expectedOutput, block.code]);

    const passedCount = testStates ? testStates.filter(Boolean).length : 0;
    const statusPill = allPassed
        ? { text: 'Passed', color: 'var(--cc-ac)' }
        : testStates !== null && tests.length > 0
            ? { text: `${passedCount}/${testStates.length} tests`, color: 'var(--cc-tle)' }
            : ranWithError
                ? { text: 'Error', color: 'var(--cc-wa)' }
                : null;

    return (
        <div className="lg:grid lg:grid-cols-[42fr_58fr] lg:gap-5 lg:items-stretch space-y-4 lg:space-y-0">
            {/* ── Zone A — Task panel (one surface, no nested boxes) ───────────── */}
            <section className="cc-card cc-e1 p-6 flex flex-col lg:min-h-[480px]">
                <span className="cc-eyebrow">{taskLabel}</span>
                <div className="prose prose-invert prose-sm max-w-none mt-2" style={{ color: 'var(--cc-tx-2)' }}>
                    <MarkdownContent content={block.content ?? 'Apply what you learned to complete this task.'} />
                </div>

                {tests.length > 0 && (
                    <div className="mt-5">
                        <span className="cc-eyebrow block mb-2">Expected output</span>
                        <div className="space-y-1.5">
                            {tests.map((t, i) => {
                                const st = testStates?.[i];
                                const color = st === undefined ? 'var(--cc-tx-3)' : st ? 'var(--cc-ac)' : 'var(--cc-wa)';
                                return (
                                    <div key={t.id} className="flex items-center gap-2 text-xs">
                                        <span style={{ color }}><Icon icon={st === false ? AlertCircleIcon : CheckmarkCircle02Icon} size={14} aria-hidden="true" /></span>
                                        <code className="cc-mono" style={{ color: 'var(--cc-tx-1)' }}>{t.expectedOutput}</code>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Inline collapsible hint disclosure — bottom of the same panel */}
                <div className="mt-auto pt-5" style={{ borderTop: '1px solid var(--cc-border)' }}>
                    <button
                        type="button"
                        onClick={() => setHintOpen((o) => !o)}
                        aria-expanded={hintOpen}
                        className="flex items-center justify-between w-full text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 rounded-lg"
                        style={{ color: 'var(--cc-tx-1)' }}
                    >
                        <span className="flex items-center gap-1.5">
                            <span style={{ color: 'var(--cc-tle)' }}><Icon icon={Idea01Icon} size={15} aria-hidden="true" /></span>
                            Need a hint?
                        </span>
                        <span className="flex items-center gap-2 cc-mono text-[11px]" style={{ color: 'var(--cc-tx-3)' }}>
                            ~{xpEstimate} XP
                            <Icon icon={ArrowDown01Icon} size={14} style={{ transform: hintOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease-out' }} aria-hidden="true" />
                        </span>
                    </button>

                    {hintOpen && (
                        <div className="mt-3 space-y-3 cc-reveal">
                            {assistance.map((a, i) => (
                                <div key={i}>
                                    <span className="cc-eyebrow block" style={{ color: 'var(--cc-tle)' }}>{a.label}</span>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>{a.body}</div>
                                </div>
                            ))}
                            {hintLevel < HINT_ORDER.length && (
                                <button type="button" onClick={() => onRevealHint?.(block.id)} className="cc-btn cc-btn-ghost h-8 px-3 text-xs" style={{ color: 'var(--cc-tx-2)' }}>
                                    {hintLevel === 0 ? 'Reveal a hint' : hintLevel < 3 ? 'Next hint' : 'Show the solution'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Zone B — Code workspace (one focal IDE-like surface) ─────────── */}
            <section className="cc-card cc-e2 overflow-hidden flex flex-col lg:min-h-[480px]">
                {/* Slim toolbar */}
                <div className="flex items-center justify-between gap-3 px-4 h-12 shrink-0" style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    {/* Mobile: Code/Output tabs · Desktop: filename */}
                    <div className="flex items-center gap-1 lg:hidden" role="tablist" aria-label="Workspace panels">
                        {(['code', 'output'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                role="tab"
                                aria-selected={tab === t}
                                onClick={() => setTab(t)}
                                className="h-8 px-3 rounded-lg text-xs font-semibold capitalize transition-colors"
                                style={tab === t ? { background: 'var(--cc-surface-3)', color: 'var(--cc-tx-1)' } : { color: 'var(--cc-tx-3)' }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <span className="hidden lg:flex items-center gap-2 cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--cc-tx-3)' }} aria-hidden="true" />
                        {FILENAME[language] ?? 'main'}
                    </span>

                    <button type="button" onClick={run} disabled={isRunning} className="cc-btn cc-btn-secondary h-8 px-4 text-xs">
                        {isRunning ? <LoadingSpinner size={13} /> : <Icon icon={PlayIcon} size={13} />} Run
                    </button>
                </div>

                {/* Editor */}
                <div className={`${tab === 'output' ? 'hidden' : ''} lg:block flex-1 min-h-[280px]`}>
                    <CodeEditor value={code} onChange={(v) => setCode(v ?? '')} language={language} />
                </div>

                {/* Output (same surface, thin internal divider on desktop) */}
                <div className={`${tab === 'code' ? 'hidden' : ''} lg:block shrink-0`} style={{ borderTop: '1px solid var(--cc-border)' }}>
                    <div className="flex items-center justify-between px-4 h-9" style={{ borderBottom: '1px solid var(--cc-border)' }}>
                        <span className="cc-eyebrow">Output</span>
                        {statusPill && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: statusPill.color }}>
                                <Icon icon={allPassed ? CheckmarkCircle02Icon : AlertCircleIcon} size={13} aria-hidden="true" />
                                {statusPill.text}
                            </span>
                        )}
                    </div>
                    <Console logs={terminalLogs} isRunning={isRunning} emptyHint="Run your solution to check the tests." className="h-[180px]" />
                    {(allPassed || testStates !== null || ranWithError) && (
                        <p className="px-4 py-2.5 text-xs" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5, borderTop: '1px solid var(--cc-border)' }}>
                            {allPassed
                                ? 'Solved — all tests pass. Your XP is added once when you finish the lesson.'
                                : 'Not all tests pass yet — compare against the expected output and adjust. Reveal a hint if you\u2019d like a nudge; you can run as many times as you need.'}
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CodeTaskBuild;
