/**
 * Inline runnable playground (Req 12.4) — an editable Monaco snippet + Run +
 * output console embedded mid-explanation. Observation-only: it runs via
 * {@link useCodeRunner} with no expected output (success = ran without error).
 */
import { PlayIcon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { Icon, LoadingSpinner } from '../../../../components/ui';
import { CodeEditor } from '../../../../components/editor';
import { useCodeRunner } from '../../../../hooks/useCodeRunner';
import MarkdownContent from '../../../../components/ui/MarkdownContent';
import { Console } from './Console';
import type { BlockComponentProps } from './blockContract';

export const RunnablePlayground: React.FC<BlockComponentProps> = ({ block, language, onResult, announce }) => {
    const { terminalLogs, isRunning, runCode } = useCodeRunner();
    const [code, setCode] = useState(block.code ?? '');

    const run = async () => {
        announce?.('Running code');
        const ok = await runCode(code, language);
        onResult({ blockId: block.id, attempted: true, correct: ok, conceptId: block.conceptId });
        announce?.(ok ? 'Run finished.' : 'Run finished with an error.');
    };

    return (
        <div className="cc-reveal space-y-4">
            {block.content && (
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-0" style={{ color: 'var(--cc-tx-2)' }}>
                    <MarkdownContent content={block.content} />
                </div>
            )}

            <div className="cc-card cc-e1 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--cc-border)' }}>
                    <span className="cc-eyebrow">Playground</span>
                    <button type="button" onClick={run} disabled={isRunning} className="cc-btn cc-btn-secondary h-8 px-4 text-xs">
                        {isRunning ? <LoadingSpinner size={13} /> : <Icon icon={PlayIcon} size={13} />} Run
                    </button>
                </div>
                <div className="h-[220px]">
                    <CodeEditor value={code} onChange={(v) => setCode(v ?? '')} language={language} />
                </div>
                <div className="border-t" style={{ borderColor: 'var(--cc-border)' }}>
                    <Console logs={terminalLogs} isRunning={isRunning} className="max-h-[180px]" />
                </div>
            </div>
        </div>
    );
};

export default RunnablePlayground;
