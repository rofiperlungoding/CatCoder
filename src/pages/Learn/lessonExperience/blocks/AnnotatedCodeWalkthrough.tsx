/**
 * Annotated code walkthrough — syntax-plain code with step-through line
 * highlighting and a "play" control that animates line by line (Req 12.3,
 * 15.2). Honors reduced motion by revealing all lines at once.
 */
import { PlayIcon, PauseIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../../../../components/ui';
import MarkdownContent from '../../../../components/ui/MarkdownContent';
import type { BlockComponentProps } from './blockContract';

export const AnnotatedCodeWalkthrough: React.FC<BlockComponentProps> = ({ block, reducedMotion, announce }) => {
    const lines = (block.code ?? '').replace(/\n$/, '').split('\n');
    const [active, setActive] = useState<number>(reducedMotion ? lines.length - 1 : -1);
    const [playing, setPlaying] = useState(false);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

    const stop = () => {
        if (timer.current) { clearInterval(timer.current); timer.current = null; }
        setPlaying(false);
    };

    const play = () => {
        if (reducedMotion) { setActive(lines.length - 1); return; }
        stop();
        setActive(0);
        setPlaying(true);
        announce?.('Playing walkthrough');
        let i = 0;
        timer.current = setInterval(() => {
            i += 1;
            if (i >= lines.length) { setActive(lines.length - 1); stop(); return; }
            setActive(i);
        }, 900);
    };

    const reset = () => { stop(); setActive(reducedMotion ? lines.length - 1 : -1); };

    return (
        <div className="cc-reveal space-y-4">
            {block.content && (
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed" style={{ color: 'var(--cc-tx-2)' }}>
                    <MarkdownContent content={block.content} />
                </div>
            )}

            <div className="cc-card cc-e1 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--cc-border)' }}>
                    <span className="cc-eyebrow">Walkthrough</span>
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={playing ? stop : play} className="cc-btn cc-btn-ghost h-8 px-3 text-xs"
                            aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}>
                            <Icon icon={playing ? PauseIcon : PlayIcon} size={14} /> {playing ? 'Pause' : 'Play'}
                        </button>
                        <button type="button" onClick={reset} className="cc-btn cc-btn-ghost h-8 w-8" aria-label="Reset walkthrough">
                            <Icon icon={RefreshIcon} size={14} />
                        </button>
                    </div>
                </div>
                <pre className="m-0 p-4 overflow-x-auto cc-mono text-sm leading-relaxed" style={{ background: 'var(--cc-bg)' }}>
                    <code>
                        {lines.map((line, i) => {
                            const on = reducedMotion || i <= active;
                            const isActive = !reducedMotion && i === active;
                            return (
                                <span
                                    key={i}
                                    className="block px-2 -mx-2 rounded transition-all"
                                    style={{
                                        opacity: on ? 1 : 0.28,
                                        background: isActive ? 'rgba(163,230,53,.10)' : 'transparent',
                                        borderLeft: isActive ? '2px solid var(--cc-brand-2)' : '2px solid transparent',
                                        color: 'var(--cc-tx-1)',
                                    }}
                                >
                                    {line || '\u00A0'}
                                </span>
                            );
                        })}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default AnnotatedCodeWalkthrough;
