/**
 * Shared terminal/console renderer for code-bearing blocks. Reads the
 * {@link LogEntry} stream produced by {@link useCodeRunner} and renders it on
 * the design-system dark surface. Color is paired with a glyph/prefix so it is
 * never the sole signal.
 */
import { PlayIcon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Icon } from '../../../../components/ui';
import type { LogEntry } from '../../../../hooks/useCodeRunner';

interface ConsoleProps {
    logs: LogEntry[];
    isRunning: boolean;
    emptyHint?: string;
    className?: string;
}

export const Console: React.FC<ConsoleProps> = ({ logs, isRunning, emptyHint = 'Run your code to see the output here.', className = '' }) => (
    <div
        className={`font-mono text-xs overflow-y-auto custom-scrollbar p-4 space-y-1.5 ${className}`}
        style={{ background: 'var(--cc-bg)', color: 'var(--cc-tx-1)' }}
        aria-label="Program output"
    >
        {logs.length > 0 ? (
            <>
                {logs.map((log, i) => (
                    <div key={i} className="cc-reveal break-words">
                        {log.type === 'command' && <span style={{ color: 'var(--cc-info)' }} className="font-bold opacity-80 block mb-1">$ {log.message}</span>}
                        {log.type === 'system' && <span style={{ color: 'var(--cc-tx-3)' }} className="italic block py-0.5">{log.message}</span>}
                        {log.type === 'stdout' && <span className="block ml-2 pl-2" style={{ borderLeft: '2px solid rgba(163,230,53,.25)', color: 'var(--cc-tx-1)' }}>{log.message}</span>}
                        {log.type === 'stderr' && <span className="block p-2 rounded my-1" style={{ color: 'var(--cc-wa)', background: 'rgba(251,113,133,.10)', border: '1px solid rgba(251,113,133,.25)' }}>{log.message}</span>}
                        {log.type === 'success' && <span className="font-bold block mt-2 pt-2" style={{ color: 'var(--cc-ac)', borderTop: '1px solid var(--cc-border)' }}>{'\u279C'} {log.message}</span>}
                    </div>
                ))}
                {isRunning && <span className="inline-block w-2 h-4 align-middle ml-1 animate-pulse" style={{ background: 'rgba(163,230,53,.5)' }} />}
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center" style={{ color: 'var(--cc-tx-3)', opacity: 0.6 }}>
                <Icon icon={PlayIcon} size={22} className="mb-2" aria-hidden="true" />
                <p>{emptyHint}</p>
            </div>
        )}
    </div>
);

export default Console;
