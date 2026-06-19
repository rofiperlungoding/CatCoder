/**
 * Single live XP counter (Req 2.4, 14.4). Mirrors the learner's server-owned XP
 * from {@link useUserStore} via {@link useLiveXp}; rendered in exactly one place
 * (the TopBar) so XP is never double-counted.
 */
import { FlashIcon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Icon } from '../../../../components/ui';
import { formatXP } from '../../../../lib/utils';
import { useLiveXp } from '../state/useLessonStore';

export const XpCounter: React.FC = () => {
    const xp = useLiveXp();
    return (
        <span className="cc-pill cc-mono text-xs" aria-label={`${xp} total XP`}>
            <span style={{ color: 'var(--cc-tx-3)' }}><Icon icon={FlashIcon} size={13} aria-hidden="true" /></span> {formatXP(xp)} XP
        </span>
    );
};

export default XpCounter;
