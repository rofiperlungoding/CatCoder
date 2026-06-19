import {
    Clock01Icon, ArrowUp01Icon, ArrowDown01Icon, ArrowRight01Icon, Trophy,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Surface, Button, Progress } from '../../components/ds';
import { Avatar } from '../../components/ui';
import { useUserStore } from '../../stores';
import { fetchLeaderboard, fetchUserRank } from '../../lib/leaderboard';
import { getRankDisplayName, formatXP, getRank } from '../../lib/utils';
import type { LeaderboardEntry, Rank } from '../../types';

export { SpeedRunDetail } from './SpeedRunDetail';

const TIERS: { key: Rank; min: number; hex: string }[] = [
    { key: 'bronze', min: 0, hex: '#d8975a' },
    { key: 'silver', min: 1000, hex: '#cfd4da' },
    { key: 'gold', min: 5000, hex: '#ffd770' },
    { key: 'platinum', min: 15000, hex: '#a3e4d7' },
    { key: 'diamond', min: 30000, hex: '#b9f2ff' },
];
const PROMO = 3;
const DEMO = 3;

// Zone tints and podium medal colors centralized on design tokens
// (lime = brand, pink = warn, amber = streak/medal) — same tinted idiom
// used by tinted banners across the app.
const ZONE_PROMO_BG = 'rgba(163,230,53,.06)';
const ZONE_DEMO_BG = 'rgba(251,113,133,.06)';
const MEDAL_COLOR: Record<number, string> = {
    1: 'var(--cc-brand-2)', // gold
    2: 'var(--cc-tx-2)',    // silver
    3: 'var(--cc-tle)',     // bronze
};
const AVATAR_RING = { boxShadow: 'var(--cc-e1)' } as const;

/** Stable pseudo movement delta per user (no historical data in the model). */
function deltaOf(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return (h % 7) - 3; // -3..+3
}

function nextWeekReset(): Date {
    const n = new Date();
    const end = new Date(n);
    const add = ((1 - n.getDay()) + 7) % 7 || 7; // next Monday
    end.setDate(n.getDate() + add);
    end.setHours(0, 0, 0, 0);
    return end;
}
function formatCountdown(ms: number): string {
    if (ms <= 0) return '0h';
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;
}

const LeagueChip: React.FC<{ tier: Rank; className?: string }> = ({ tier, className = '' }) => (
    <span className={`cc-pill cc-league cc-league-${tier} text-[11px] ${className}`}>
        <HugeiconsIcon icon={Trophy} size={11} /> {getRankDisplayName(tier)}
    </span>
);

const Delta: React.FC<{ value: number }> = ({ value }) => {
    if (value === 0) return <span className="cc-mono text-[11px]" style={{ color: 'var(--cc-tx-3)' }} aria-label="no change">–</span>;
    const up = value > 0;
    return (
        <span className="cc-mono text-[11px] inline-flex items-center gap-0.5" style={{ color: up ? 'var(--cc-ac)' : 'var(--cc-wa)' }} aria-label={`${up ? 'up' : 'down'} ${Math.abs(value)} places`}>
            <HugeiconsIcon icon={up ? ArrowUp01Icon : ArrowDown01Icon} size={11} />{Math.abs(value)}
        </span>
    );
};

/** Rank medallion — tier-colored ring shows promotion progress, center shows current rank. */
const RankRing: React.FC<{ pct: number; color: string; rank: number | null; size?: number }> = ({ pct, color, rank, size = 112 }) => {
    const sw = size >= 100 ? 8 : 6;
    const r = size / 2 - sw;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, pct / 100)));
    const mid = size / 2;
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={mid} cy={mid} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={sw} />
                <circle
                    cx={mid} cy={mid} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
                    transform={`rotate(-90 ${mid} ${mid})`} style={{ transition: 'stroke-dashoffset 500ms var(--cc-ease)' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="cc-mono font-bold" style={{ color: 'var(--cc-tx-1)', fontSize: size >= 100 ? '1.5rem' : '1.125rem' }}>{rank ? `#${rank}` : '—'}</span>
                <span className="cc-eyebrow mt-1" style={{ fontSize: '0.5rem' }}>rank</span>
            </div>
        </div>
    );
};

export const CompetePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchLeaderboard(20)
            .then((d) => { if (!cancelled) setEntries(d); })
            .catch(() => { if (!cancelled) setEntries([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        if (user) fetchUserRank(user.id).then((r) => { if (!cancelled) setMyRank(r); }).catch(() => { });
        return () => { cancelled = true; };
    }, [user]);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(id);
    }, []);

    const countdown = formatCountdown(nextWeekReset().getTime() - now);

    const tier: Rank = user ? getRank(user.xp) : 'bronze';
    const tierIdx = TIERS.findIndex((t) => t.key === tier);
    const nextTier = TIERS[tierIdx + 1] ?? null;
    const curMin = TIERS[tierIdx]?.min ?? 0;
    const promoPct = nextTier ? Math.max(0, Math.min(100, Math.round((((user?.xp ?? 0) - curMin) / (nextTier.min - curMin)) * 100))) : 100;
    const meEntry = user ? entries.find((e) => e.user.id === user.id) ?? null : null;
    const isUnranked = !user || (user.xp === 0 && myRank === null);

    const podium = entries.slice(0, 3);
    const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) as LeaderboardEntry[];

    return (
        <div className="cc-root max-w-[1120px] mx-auto space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="cc-eyebrow">Compete</span>
                    <h1 className="text-3xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>Climb the ranks</h1>
                </div>
                <span className="cc-pill self-start md:self-auto" style={{ color: 'var(--cc-tx-2)' }} aria-live="polite">
                    <HugeiconsIcon icon={Clock01Icon} size={13} /> Season ends in {countdown}
                </span>
            </header>

            {/* League standing hero — glass banner: medallion + standing + action, progress full-width */}
            <div className="cc-glass p-6 md:p-8 flex flex-col gap-5" style={{ borderRadius: 'var(--cc-r-xl)' }}>
                <div className="flex items-center gap-5">
                    <RankRing size={88} pct={promoPct} color={isUnranked ? 'var(--cc-tx-3)' : (TIERS[tierIdx]?.hex ?? '#d8975a')} rank={isUnranked ? null : myRank} />
                    <div className="flex-1 min-w-0">
                        <span className="cc-eyebrow">Your league</span>
                        <div className="flex flex-wrap items-center gap-2.5 mt-1">
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>{getRankDisplayName(tier)}</h2>
                            <LeagueChip tier={tier} />
                        </div>
                        <p className="text-sm mt-1.5" style={{ color: 'var(--cc-tx-2)' }}>
                            {isUnranked
                                ? 'Solve a problem to enter this week’s league.'
                                : <>Rank <span className="cc-mono font-semibold" style={{ color: 'var(--cc-tx-1)' }}>#{myRank ?? '—'}</span> · <span className="cc-mono font-semibold" style={{ color: 'var(--cc-tx-1)' }}>{formatXP(user?.xp ?? 0)}</span> XP this season</>}
                        </p>
                    </div>
                    <Button size="lg" className="shrink-0" onClick={() => navigate('/practice')}>
                        Solve to climb <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                    </Button>
                </div>

                {nextTier ? (
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="cc-eyebrow">To {getRankDisplayName(nextTier.key)}</span>
                            <span className="cc-mono" style={{ color: 'var(--cc-tx-3)' }}>
                                {formatXP(user?.xp ?? 0)} / {formatXP(nextTier.min)} XP · {formatXP(Math.max(0, nextTier.min - (user?.xp ?? 0)))} to climb
                            </span>
                        </div>
                        <Progress value={promoPct} className="h-2" aria-label={`Progress to ${getRankDisplayName(nextTier.key)}: ${promoPct}%`} />
                    </div>
                ) : (
                    <p className="text-sm" style={{ color: 'var(--cc-brand-1)' }}>Top tier reached — defend your throne.</p>
                )}
            </div>

            {/* Weekly leaderboard */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>This week’s leaderboard</h2>

                {/* Podium */}
                {!loading && podiumOrder.length === 3 && (
                    <div className="grid grid-cols-3 gap-3 items-end cc-stagger">
                        {podiumOrder.map((e) => {
                            const place = e.rank;
                            const tall = place === 1;
                            return (
                                <Surface key={e.user.id} elevation={tall ? 2 : 1} className={`flex flex-col items-center text-center p-4 ${tall ? 'pt-6' : 'pt-4'}`}>
                                    <div className="rounded-full mb-2" style={AVATAR_RING}>
                                        <Avatar src={e.user.avatarUrl} fallback={e.user.username.charAt(0).toUpperCase()} size={tall ? 'lg' : 'md'} className="ring-1 ring-white/10" />
                                    </div>
                                    <span className="cc-mono text-xs" style={{ color: MEDAL_COLOR[place] ?? 'var(--cc-tx-3)' }}>#{place}</span>
                                    <span className="text-sm font-bold truncate max-w-full" style={{ color: 'var(--cc-tx-1)' }}>{e.user.username}</span>
                                    <span className="cc-mono text-xs mt-0.5" style={{ color: 'var(--cc-tx-3)' }}>{formatXP(e.score)} XP</span>
                                    <div className="mt-2"><LeagueChip tier={e.user.rank} /></div>
                                </Surface>
                            );
                        })}
                    </div>
                )}

                {/* Ranked list with promotion/demotion zones */}
                <Surface elevation={1} className="overflow-hidden">
                    <div className="hidden sm:flex items-center gap-4 px-4 py-2.5" style={{ borderBottom: '1px solid var(--cc-border)' }}>
                        <span className="cc-eyebrow w-8 text-center">#</span>
                        <span className="cc-eyebrow flex-1">Coder</span>
                        <span className="cc-eyebrow w-24">League</span>
                        <span className="cc-eyebrow w-20 text-right">XP</span>
                        <span className="cc-eyebrow w-12 text-right">±</span>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--cc-tx-3)' }}>Loading standings…</div>
                    ) : entries.length === 0 ? (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--cc-tx-2)' }}>No pioneers yet — be the first to earn XP.</div>
                    ) : (
                        entries.map((e, i) => {
                            const isMe = !!user && e.user.id === user.id;
                            const zone = i < PROMO ? 'promo' : (entries.length > PROMO + DEMO && i >= entries.length - DEMO) ? 'demo' : 'none';
                            const tick = zone === 'promo' ? 'var(--cc-brand-2)' : zone === 'demo' ? 'var(--cc-wa)' : 'transparent';
                            return (
                                <React.Fragment key={e.user.id}>
                                    {i === PROMO && entries.length > PROMO && (
                                        <div className="flex items-center gap-2 px-4 py-1" style={{ background: ZONE_PROMO_BG }}>
                                            <HugeiconsIcon icon={ArrowUp01Icon} size={12} style={{ color: 'var(--cc-brand-1)' }} />
                                            <span className="cc-eyebrow" style={{ color: 'var(--cc-brand-1)' }}>Promotion</span>
                                        </div>
                                    )}
                                    {entries.length > PROMO + DEMO && i === entries.length - DEMO && (
                                        <div className="flex items-center gap-2 px-4 py-1" style={{ background: ZONE_DEMO_BG }}>
                                            <HugeiconsIcon icon={ArrowDown01Icon} size={12} style={{ color: 'var(--cc-wa)' }} />
                                            <span className="cc-eyebrow" style={{ color: 'var(--cc-wa)' }}>Demotion</span>
                                        </div>
                                    )}
                                    <div
                                        className="relative flex items-center gap-4 px-4 py-3 transition-colors"
                                        style={{
                                            minHeight: 52,
                                            borderTop: i === 0 ? 'none' : '1px solid var(--cc-border)',
                                            background: isMe ? ZONE_PROMO_BG : 'transparent',
                                        }}
                                        onMouseEnter={(ev) => { if (!isMe) ev.currentTarget.style.background = 'var(--cc-surface-2)'; }}
                                        onMouseLeave={(ev) => { if (!isMe) ev.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 rounded-full" style={{ width: 3, background: tick }} />
                                        <span className="cc-mono text-sm w-8 text-center shrink-0" style={{ color: 'var(--cc-tx-3)' }}>{e.rank}</span>
                                        <div className="rounded-full shrink-0" style={AVATAR_RING}>
                                            <Avatar src={e.user.avatarUrl} fallback={e.user.username.charAt(0).toUpperCase()} size="sm" className="ring-1 ring-white/10" />
                                        </div>
                                        <span className="flex-1 min-w-0 flex items-center gap-2">
                                            <span className="text-sm font-semibold truncate" style={{ color: isMe ? 'var(--cc-brand-1)' : 'var(--cc-tx-1)' }}>
                                                {isMe ? 'You' : e.user.username}
                                            </span>
                                            {isMe && <span className="cc-pill cc-pill-brand text-[10px]">You</span>}
                                        </span>
                                        <span className="w-24 hidden sm:block"><LeagueChip tier={e.user.rank} /></span>
                                        <span className="w-20 text-right cc-mono text-sm" style={{ color: 'var(--cc-tx-2)' }}>{formatXP(e.score)}</span>
                                        <span className="w-12 text-right"><Delta value={deltaOf(e.user.username)} /></span>
                                    </div>
                                </React.Fragment>
                            );
                        })
                    )}

                    {/* Sticky "you" summary — stays visible while scrolling */}
                    {user && !meEntry && !loading && (
                        <div className="sticky bottom-0 flex items-center gap-4 px-4 py-3" style={{ borderTop: '1px solid var(--cc-border)', background: 'var(--cc-surface-3)', boxShadow: 'var(--cc-e2)' }}>
                            <span className="cc-mono text-sm w-8 text-center shrink-0" style={{ color: 'var(--cc-tx-2)' }}>{myRank ? `#${myRank}` : '—'}</span>
                            <div className="rounded-full shrink-0" style={AVATAR_RING}>
                                <Avatar src={user.avatarUrl} fallback={user.username.charAt(0).toUpperCase()} size="sm" className="ring-1 ring-white/10" />
                            </div>
                            <span className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="text-sm font-semibold" style={{ color: 'var(--cc-brand-1)' }}>You</span>
                                <span className="cc-pill cc-pill-brand text-[10px]">{isUnranked ? 'Unranked' : 'Your rank'}</span>
                            </span>
                            <span className="w-24 hidden sm:block"><LeagueChip tier={tier} /></span>
                            <span className="w-20 text-right cc-mono text-sm" style={{ color: 'var(--cc-tx-2)' }}>{formatXP(user.xp)}</span>
                            <span className="w-12" />
                        </div>
                    )}
                </Surface>
            </section>

            {/* Tier ladder cards */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>League tiers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 cc-stagger">
                    {TIERS.map((t, i) => {
                        const current = i === tierIdx;
                        return (
                            <Surface key={t.key} elevation={1} className="p-4 flex flex-col gap-2" style={current ? { borderColor: 'rgba(163,230,53,.25)', boxShadow: 'var(--cc-e1), var(--cc-glow-brand)' } : undefined}>
                                <div className="flex items-center justify-between">
                                    <span style={{ width: 12, height: 12, borderRadius: 999, background: t.hex }} />
                                    {current && <span className="cc-mono text-[10px]" style={{ color: 'var(--cc-brand-1)' }}>YOU</span>}
                                </div>
                                <span className="text-sm font-bold" style={{ color: current ? 'var(--cc-tx-1)' : 'var(--cc-tx-2)' }}>{getRankDisplayName(t.key)}</span>
                                <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>{t.min === 0 ? 'Start here' : `≥ ${formatXP(t.min)} XP`}</span>
                            </Surface>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};
