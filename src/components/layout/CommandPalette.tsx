import {
    Search01Icon, Home01Icon, BookOpen01Icon, ProgrammingFlagIcon, Trophy,
    MapsIcon, UserIcon, ArrowRight01Icon, ArrowTurnBackwardIcon,
} from '@hugeicons/core-free-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { useUIStore } from '../../stores';
import { Icon } from '../ui';

type Item = {
    id: string;
    label: string;
    hint?: string;
    icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
    path: string;
    group: 'Pages' | 'Problems';
};

const PAGES: Item[] = [
    { id: 'p-home', label: 'Home', icon: Home01Icon, path: '/home', group: 'Pages' },
    { id: 'p-learn', label: 'Learn', icon: BookOpen01Icon, path: '/learn', group: 'Pages' },
    { id: 'p-practice', label: 'Practice', icon: ProgrammingFlagIcon, path: '/practice', group: 'Pages' },
    { id: 'p-compete', label: 'Compete', icon: Trophy, path: '/compete', group: 'Pages' },
    { id: 'p-roadmap', label: 'Roadmap', icon: MapsIcon, path: '/roadmap', group: 'Pages' },
    { id: 'p-profile', label: 'Profile', icon: UserIcon, path: '/profile', group: 'Pages' },
];

export const CommandPalette: React.FC = () => {
    const navigate = useNavigate();
    const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
    const [query, setQuery] = React.useState('');
    const [active, setActive] = React.useState(0);
    const [problemItems, setProblemItems] = React.useState<Item[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    // Global Cmd/Ctrl+K to open, ESC to close.
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [setCommandPaletteOpen]);

    React.useEffect(() => {
        if (commandPaletteOpen) {
            setQuery('');
            setActive(0);
            requestAnimationFrame(() => inputRef.current?.focus());
            // Lazy-load the problems dataset on first open so it stays out of the initial bundle.
            if (problemItems.length === 0) {
                import('../../data/problems').then((m) => {
                    setProblemItems(
                        m.problems.map((p) => ({
                            id: `prob-${p.id}`,
                            label: p.title,
                            hint: p.difficulty,
                            icon: ProgrammingFlagIcon,
                            path: `/practice/${p.id}`,
                            group: 'Problems' as const,
                        })),
                    );
                }).catch(() => { /* ignore */ });
            }
        }
    }, [commandPaletteOpen, problemItems.length]);

    const all = React.useMemo(() => [...PAGES, ...problemItems], [problemItems]);

    const results = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return all.slice(0, 8);
        return all.filter((it) =>
            it.label.toLowerCase().includes(q) || it.hint?.toLowerCase().includes(q),
        ).slice(0, 20);
    }, [query, all]);

    React.useEffect(() => { setActive(0); }, [query]);

    if (!commandPaletteOpen) return null;

    const close = () => setCommandPaletteOpen(false);
    const select = (item: Item | undefined) => {
        if (!item) return;
        close();
        navigate(item.path);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); select(results[active]); }
    };

    // Group rendering with a single running index for active highlighting.
    let runningIndex = -1;
    const groups: Array<Item['group']> = ['Pages', 'Problems'];

    return (
        <div
            className="cc-root fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
        >
            {/* Scrim */}
            <button
                aria-label="Close command palette"
                className="absolute inset-0 cursor-default cc-fade-in"
                style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(2px)' }}
                onClick={close}
                tabIndex={-1}
            />

            {/* Panel */}
            <div
                className="relative w-full max-w-xl rounded-2xl overflow-hidden cc-pop-panel"
                style={{
                    background: 'var(--cc-surface-2)',
                    backgroundImage: 'var(--cc-surface-sheen)',
                    border: '1px solid var(--cc-edge-light)',
                    boxShadow: 'var(--cc-pop-elev)',
                }}
                onKeyDown={onKeyDown}
            >
                {/* Search row */}
                <div className="flex items-center gap-3 px-4 h-14 border-b" style={{ borderColor: 'var(--cc-border)' }}>
                    <Icon icon={Search01Icon} size={18} className="text-[var(--cc-tx-3)]" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search problems and pages…"
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: 'var(--cc-tx-1)' }}
                        aria-label="Search"
                    />
                    <span className="cc-kbd">ESC</span>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <div className="py-10 text-center text-sm" style={{ color: 'var(--cc-tx-3)' }}>
                            No results for “{query}”.
                        </div>
                    ) : (
                        groups.map((g) => {
                            const items = results.filter((r) => r.group === g);
                            if (items.length === 0) return null;
                            return (
                                <div key={g} className="mb-1">
                                    <div className="cc-eyebrow px-2 py-1.5">{g}</div>
                                    {items.map((item) => {
                                        runningIndex += 1;
                                        const idx = runningIndex;
                                        const isActive = idx === active;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => select(item)}
                                                onMouseMove={() => setActive(idx)}
                                                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors"
                                                style={{
                                                    background: isActive ? 'var(--cc-surface-3)' : 'transparent',
                                                    color: isActive ? 'var(--cc-tx-1)' : 'var(--cc-tx-2)',
                                                }}
                                            >
                                                <span
                                                    className="cc-icon-well w-7 h-7 shrink-0"
                                                    style={{ color: isActive ? 'var(--cc-brand-1)' : 'var(--cc-tx-3)' }}
                                                >
                                                    <HugeiconsIcon icon={item.icon} size={15} />
                                                </span>
                                                <span className="flex-1 text-sm truncate">{item.label}</span>
                                                {item.hint && (
                                                    <span className="cc-pill cc-mono text-[10px] capitalize">{item.hint}</span>
                                                )}
                                                {isActive && <HugeiconsIcon icon={ArrowRight01Icon} size={14} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer hint */}
                <div
                    className="flex items-center gap-4 px-4 h-10 border-t text-[11px]"
                    style={{ borderColor: 'var(--cc-border)', color: 'var(--cc-tx-3)' }}
                >
                    <span className="flex items-center gap-1.5"><span className="cc-kbd">↑</span><span className="cc-kbd">↓</span> navigate</span>
                    <span className="flex items-center gap-1.5">
                        <span className="cc-kbd"><HugeiconsIcon icon={ArrowTurnBackwardIcon} size={11} /></span> select
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
