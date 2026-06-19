/**
 * Predict → Run → Reveal (Req 6) — CatCoder's signature interaction.
 *
 * The learner must submit a prediction before the Run action unlocks; after the
 * code runs via {@link useCodeRunner}, the actual output is compared with the
 * prediction via {@link comparePrediction} and the reveal shows both with
 * reasoning ("You predicted X — it's actually Y, because…"). Execution errors
 * are revealed as the actual output with an explanation, still completing the
 * Reveal.
 */
import { PlayIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Icon, LoadingSpinner } from '../../../../components/ui';
import { CodeEditor } from '../../../../components/editor';
import { useCodeRunner } from '../../../../hooks/useCodeRunner';
import MarkdownContent from '../../../../components/ui/MarkdownContent';
import { comparePrediction, type PredictionVerdict } from '../engine/prediction';
import type { BlockComponentProps } from './blockContract';

function actualFromLogs(logs: { type: string; message: string }[]): string {
    const err = logs.find((l) => l.type === 'stderr');
    if (err) return err.message.startsWith('Error:') ? err.message : `Error: ${err.message}`;
    return logs.filter((l) => l.type === 'stdout').map((l) => l.message).join('\n');
}

const VERDICT_META: Record<PredictionVerdict['classification'], { label: string; color: string; bg: string }> = {
    match: { label: 'Spot on', color: 'var(--cc-ac)', bg: 'rgba(74,222,128,.10)' },
    mismatch: { label: 'Not quite', color: 'var(--cc-tle)', bg: 'rgba(251,191,36,.10)' },
    error: { label: 'It errored', color: 'var(--cc-wa)', bg: 'rgba(251,113,133,.10)' },
};

export const PredictOutput: React.FC<BlockComponentProps> = ({ block, language, onResult, announce }) => {
    const { terminalLogs, isRunning, runCode } = useCodeRunner();
    const [prediction, setPrediction] = useState('');
    const [locked, setLocked] = useState(false); // prediction submitted
    const [verdict, setVerdict] = useState<PredictionVerdict | null>(null);
    const awaiting = useRef(false);

    useEffect(() => {
        if (awaiting.current && !isRunning) {
            awaiting.current = false;
            const actual = actualFromLogs(terminalLogs);
            const v = comparePrediction(prediction, actual);
            setVerdict(v);
            onResult({ blockId: block.id, attempted: true, correct: v.classification === 'match', predicted: prediction, conceptId: block.conceptId });
            announce?.(`You predicted ${prediction || 'nothing'}. It's actually: ${actual || 'no output'}. ${VERDICT_META[v.classification].label}.`);
        }
    }, [isRunning, terminalLogs, prediction, block.id, block.conceptId, onResult, announce]);

    const run = async () => {
        awaiting.current = true;
        announce?.('Running code to reveal the actual output');
        await runCode(block.code ?? '', language);
    };

    const meta = verdict ? VERDICT_META[verdict.classification] : null;

    return (
        <div className="cc-reveal space-y-4">
            {block.content && (
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-0" style={{ color: 'var(--cc-tx-2)' }}>
                    <MarkdownContent content={block.content} />
                </div>
            )}

            <div className="cc-card cc-e1 overflow-hidden">
                <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--cc-border)' }}>
                    <span className="cc-pill cc-pill-brand text-[11px]">Predict → Run → Reveal</span>
                </div>
                <div className="h-[180px]">
                    <CodeEditor value={block.code ?? ''} onChange={() => { /* read-only sample */ }} language={language} readOnly />
                </div>
            </div>

            {/* Step 1 — Predict */}
            <div className="space-y-2">
                <label htmlFor={`${block.id}-predict`} className="cc-eyebrow block">What will this output?</label>
                <div className="flex gap-2">
                    <input
                        id={`${block.id}-predict`}
                        type="text"
                        value={prediction}
                        disabled={locked}
                        onChange={(e) => setPrediction(e.target.value)}
                        placeholder="Type your prediction…"
                        className="flex-1 rounded-xl px-3.5 h-10 text-sm cc-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                        style={{ background: 'var(--cc-surface-1)', border: '1px solid var(--cc-border)', color: 'var(--cc-tx-1)' }}
                    />
                    {!locked && (
                        <button type="button" onClick={() => prediction.trim() && setLocked(true)} disabled={!prediction.trim()} className="cc-btn cc-btn-secondary h-10 px-4 text-sm disabled:opacity-50">
                            Lock in <Icon icon={ArrowRight01Icon} size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Step 2 — Run (gated on prediction) */}
            {locked && !verdict && (
                <button type="button" onClick={run} disabled={isRunning} className="cc-btn cc-btn-secondary h-10 px-5 text-sm">
                    {isRunning ? <LoadingSpinner size={14} /> : <Icon icon={PlayIcon} size={14} />} Run to reveal
                </button>
            )}

            {/* Step 3 — Reveal */}
            {verdict && meta && (
                <div className="rounded-2xl p-4 cc-reveal" style={{ background: meta.bg, border: `1px solid ${meta.color}40` }} role="status">
                    <p className="text-sm font-bold mb-3" style={{ color: meta.color }}>{meta.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <span className="cc-eyebrow block mb-1">You predicted</span>
                            <pre className="m-0 cc-mono text-xs p-2.5 rounded-lg whitespace-pre-wrap" style={{ background: 'var(--cc-surface-1)', color: 'var(--cc-tx-2)' }}>{verdict.predicted || '(empty)'}</pre>
                        </div>
                        <div>
                            <span className="cc-eyebrow block mb-1">Actual output</span>
                            <pre className="m-0 cc-mono text-xs p-2.5 rounded-lg whitespace-pre-wrap" style={{ background: 'var(--cc-surface-1)', color: 'var(--cc-tx-1)' }}>{verdict.actual || '(no output)'}</pre>
                        </div>
                    </div>
                    <p className="text-xs mt-3" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                        {verdict.classification === 'match'
                            ? 'Your mental model matches what the code does. Nice.'
                            : verdict.classification === 'error'
                                ? 'The code raised an error before producing output — read the message above to see which line and why.'
                                : 'Your prediction differed from the real output. Trace the code line by line to see where your model and the runtime diverged.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PredictOutput;
