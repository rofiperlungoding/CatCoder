import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Surface, LeaderboardRow } from '../ds';
import { getLeaderboard, getSessionToken, type LeaderboardEntry } from '../../lib/api';

function currentUserId(): string | null {
    try {
        const raw = localStorage.getItem('cc_turso_session');
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { user?: { id?: string } };
        return parsed?.user?.id ?? null;
    } catch {
        return null;
    }
}

export function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const meId = getSessionToken() ? currentUserId() : null;

    useEffect(() => {
        let cancelled = false;
        getLeaderboard()
            .then((data) => {
                if (!cancelled) setEntries(data);
            })
            .catch((err) => {
                if (!cancelled) setError((err as Error).message);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Surface elevation={2} className="p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>
                    Top verifiers
                </h3>
                <span className="cc-eyebrow">By rating</span>
            </div>

            {error && (
                <p className="text-sm" style={{ color: 'var(--cc-tx-3)' }}>
                    {error}
                </p>
            )}

            {!error && !entries && (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="cc-skeleton h-12 rounded-xl" />
                    ))}
                </div>
            )}

            {!error && entries && entries.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--cc-tx-3)' }}>
                    No ranked players yet. Be the first to earn a rating.
                </p>
            )}

            {!error && entries && entries.length > 0 && (
                <div className="cc-stagger flex flex-col gap-1.5">
                    {entries.map((e) => (
                        <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <LeaderboardRow
                                rank={e.rank}
                                name={e.username}
                                xp={e.xp}
                                metricValue={e.verificationRating}
                                metricLabel="rating"
                                isCurrentUser={meId !== null && meId === e.id}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </Surface>
    );
}

export default Leaderboard;
