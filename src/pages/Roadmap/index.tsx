import { Globe, Server, CodeIcon, ArrowRight01Icon, SquareLock02Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, ProgressBar, Badge } from '../../components/ui';
import { Surface, Button as CcButton, Progress } from '../../components/ds';
import { useUserStore } from '../../stores';
import type { RoadmapPath } from '../../types';

const UNLOCK_LEVEL = 5;

// Career Roadmap Data (unlocked content — out of scope for the lock redesign)
const roadmaps: RoadmapPath[] = [
    { id: 'frontend', title: 'Frontend Developer', description: 'Master HTML, CSS, JS, and React to build beautiful user interfaces.', icon: 'Web', color: 'from-blue-500 to-cyan-400', nodes: [], requiredLevel: 5 },
    { id: 'backend', title: 'Backend Developer', description: 'Server-side logic, databases, APIs. Power the web from behind the scenes.', icon: 'Server', color: 'from-green-500 to-emerald-400', nodes: [], requiredLevel: 5 },
];

// Ghosted teaser cards behind the lock — decorative only.
const TEASERS = [
    { icon: Globe, title: 'Frontend Developer' },
    { icon: Server, title: 'Backend Developer' },
    { icon: CodeIcon, title: 'DSA Mastery' },
];

/** Cumulative XP required to first reach `target` level (mirrors utils.calculateLevel). */
function xpToReachLevel(target: number): number {
    let total = 0;
    let req = 100;
    for (let lvl = 1; lvl < target; lvl++) {
        total += req;
        req = Math.floor(req * 1.5);
    }
    return total;
}

const GhostTrack: React.FC<{ icon: typeof Globe; title: string }> = ({ icon, title }) => (
    <div className="cc-card cc-e1 p-5 flex flex-col gap-4 select-none" style={{ background: 'var(--cc-surface-2)' }}>
        <div className="flex items-start justify-between">
            <span className="cc-icon-well w-11 h-11 text-lime-300"><HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} /></span>
            <HugeiconsIcon icon={SquareLock02Icon} size={16} style={{ color: 'var(--cc-tx-3)' }} />
        </div>
        <div>
            <div className="text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>{title}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--cc-tx-2)' }}>Career path · 12 modules</div>
        </div>
        {/* node/path motif */}
        <div className="flex items-center gap-1.5 mt-1">
            {[0, 1, 2, 3, 4].map((n) => (
                <React.Fragment key={n}>
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: n === 0 ? 'var(--cc-brand-2)' : 'var(--cc-surface-3)' }} />
                    {n < 4 && <span className="flex-1" style={{ height: 2, background: 'var(--cc-surface-3)' }} />}
                </React.Fragment>
            ))}
        </div>
    </div>
);

export const RoadmapPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const userLevel = user?.level || 1;
    const isUnlocked = userLevel >= UNLOCK_LEVEL;

    const levelsToGo = Math.max(0, UNLOCK_LEVEL - userLevel);
    const xpRemaining = Math.max(0, xpToReachLevel(UNLOCK_LEVEL) - (user?.xp ?? 0));

    return (
        <div className="cc-root max-w-[1120px] mx-auto space-y-10">
            {/* Header */}
            <header>
                <span className="cc-eyebrow">Roadmap</span>
                <h1 className="text-3xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>Career Roadmaps</h1>
                <p className="text-sm mt-1.5" style={{ color: 'var(--cc-tx-2)' }}>Structured paths to guide your learning journey.</p>
            </header>

            {!isUnlocked ? (
                /* ── Locked stage: blurred teaser + centered glass unlock panel ── */
                <div className="relative overflow-hidden" style={{ borderRadius: 'var(--cc-r-xl)', minHeight: 540 }}>
                    {/* Blurred ghosted tracks (decorative) */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 content-start"
                        style={{ filter: 'blur(7px)', opacity: 0.4, pointerEvents: 'none' }}
                    >
                        {TEASERS.map((t) => <GhostTrack key={t.title} icon={t.icon} title={t.title} />)}
                    </div>
                    {/* Scrim for AA contrast over the blur */}
                    <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 42%, rgba(10,11,13,.55), rgba(10,11,13,.92) 75%)' }} />

                    {/* Glass unlock panel (the single focal) */}
                    <div className="relative z-10 flex items-center justify-center p-6" style={{ minHeight: 540 }}>
                        <Surface
                            elevation={2}
                            glow
                            className="cc-pop-panel w-full max-w-[520px] p-8 text-center"
                            style={{ background: 'rgba(24,26,30,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                        >
                            {/* Lock badge */}
                            <div
                                className="cc-icon-well w-16 h-16 mx-auto text-lime-300"
                                style={{ background: 'var(--cc-surface-3)', boxShadow: 'var(--cc-e1)', border: '1px solid rgba(163,230,53,.22)' }}
                                aria-hidden="true"
                            >
                                <HugeiconsIcon icon={SquareLock02Icon} size={28} />
                            </div>

                            <h2 className="text-2xl font-bold mt-5" style={{ color: 'var(--cc-tx-1)' }}>Unlock Roadmaps at Level {UNLOCK_LEVEL}</h2>
                            <p className="text-sm mt-2 mb-6 mx-auto max-w-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                                Career roadmaps are advanced paths. Reach Level {UNLOCK_LEVEL} to unlock specialized tracks.
                            </p>

                            {/* Unlock progress */}
                            <div className="text-left">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="cc-eyebrow" style={{ color: 'var(--cc-brand-1)' }}>Current · Level {userLevel}</span>
                                    <span className="cc-eyebrow">Target · Level {UNLOCK_LEVEL}</span>
                                </div>
                                <Progress value={userLevel} max={UNLOCK_LEVEL} className="h-2.5" aria-label={`Level ${userLevel} of ${UNLOCK_LEVEL}`} />
                                <p className="cc-mono text-xs mt-2 text-center" style={{ color: 'var(--cc-tx-3)' }}>
                                    {levelsToGo} level{levelsToGo === 1 ? '' : 's'} to go · ~{xpRemaining.toLocaleString()} XP
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-6">
                                <CcButton size="lg" onClick={() => navigate('/learn')}>
                                    Keep learning <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                                </CcButton>
                                <CcButton variant="secondary" size="lg" onClick={() => navigate('/practice')}>
                                    Solve problems
                                </CcButton>
                            </div>

                            {/* How-to-level helper */}
                            <p className="text-xs mt-5" style={{ color: 'var(--cc-tx-3)', lineHeight: 1.6 }}>
                                Earn XP from lessons <span style={{ color: 'var(--cc-tx-2)' }}>+50</span>, problems <span style={{ color: 'var(--cc-tx-2)' }}>+100</span>, and daily challenges <span style={{ color: 'var(--cc-tx-2)' }}>+150</span>.
                            </p>
                        </Surface>
                    </div>
                </div>
            ) : (
                /* ── Unlocked content (out of scope for this pass) ── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {roadmaps.map((map) => (
                        <div key={map.id} className="group bg-white dark:bg-card p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 border border-gray-100 dark:border-border transition-all flex flex-col justify-between cursor-pointer hover:-translate-y-1">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-muted flex items-center justify-center text-primary dark:text-white group-hover:bg-lime-400 group-hover:text-black dark:group-hover:text-black transition-all duration-300 shadow-inner">
                                        {map.icon === 'Web' ? <Icon icon={Globe} size={32} strokeWidth={1.5} /> : <Icon icon={Server} size={32} strokeWidth={1.5} />}
                                    </div>
                                    <Badge variant="secondary" className="bg-gray-50 dark:bg-muted text-muted-foreground">Career Path</Badge>
                                </div>
                                <h3 className="text-2xl font-bold text-primary dark:text-white mb-3">{map.title}</h3>
                                <p className="text-muted-foreground mb-8 leading-relaxed">{map.description}</p>
                            </div>
                            <div className="pt-8 border-t border-gray-100 dark:border-border">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-primary dark:text-white">0% Complete</span>
                                    <span className="text-xs font-medium text-muted-foreground">0/12 Modules</span>
                                </div>
                                <ProgressBar value={0} max={12} size="sm" className="mb-6" />
                                <Button className="w-full rounded-full">
                                    Start Journey <Icon icon={ArrowUpRight01Icon} size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
