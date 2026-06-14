import React from 'react';
import { Avatar } from '../ui';

interface LeaderboardRowProps {
    rank: number;
    name: string;
    xp: number;
    avatarUrl?: string;
    isCurrentUser?: boolean;
}

const RANK_ACCENT: Record<number, string> = {
    1: 'text-amber-300',
    2: 'text-slate-300',
    3: 'text-orange-300',
};

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
    rank,
    name,
    xp,
    avatarUrl,
    isCurrentUser = false,
}) => (
    <div
        className="flex items-center gap-3 p-2 rounded-xl transition-colors"
        style={
            isCurrentUser
                ? {
                      backgroundColor: 'var(--cc-surface-3)',
                      border: '1px solid rgba(163,230,53,.25)',
                      boxShadow: 'var(--cc-e2), var(--cc-glow-brand)',
                  }
                : { border: '1px solid transparent' }
        }
    >
        <span
            className={`cc-mono w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${RANK_ACCENT[rank] ?? ''}`}
            style={{ color: RANK_ACCENT[rank] ? undefined : 'var(--cc-tx-3)' }}
        >
            {rank}
        </span>
        <div className="shrink-0 rounded-full" style={{ boxShadow: 'var(--cc-e1)' }}>
            <Avatar
                src={avatarUrl}
                fallback={name.charAt(0).toUpperCase()}
                size="sm"
                className="h-8 w-8 ring-1 ring-white/10"
            />
        </div>
        <div className="flex-1 min-w-0">
            <p
                className="text-sm font-bold truncate"
                style={{ color: isCurrentUser ? 'var(--cc-brand-1)' : 'var(--cc-tx-1)' }}
            >
                {isCurrentUser ? 'You' : name}
            </p>
            <p className="cc-mono text-[10px]" style={{ color: 'var(--cc-tx-3)' }}>
                {xp.toLocaleString()} XP
            </p>
        </div>
    </div>
);

export default LeaderboardRow;
