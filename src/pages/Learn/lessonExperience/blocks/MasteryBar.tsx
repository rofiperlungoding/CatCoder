/**
 * Per-concept mastery indicator (Req 13.5). Uses the design-system Progress bar
 * and surfaces the "sure but wrong" calibration signal with icon + text so
 * color is never the only cue.
 */
import { AlertCircleIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Icon } from '../../../../components/ui';
import { Progress } from '../../../../components/ds';
import type { MasteryRecord } from '../engine/mastery';

interface MasteryBarProps {
    title: string;
    record: MasteryRecord;
}

export const MasteryBar: React.FC<MasteryBarProps> = ({ title, record }) => {
    const pct = Math.round(record.score * 100);
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--cc-tx-1)' }}>
                    {record.mastered ? (
                        <span style={{ color: 'var(--cc-ac)' }}><Icon icon={CheckmarkCircle02Icon} size={15} aria-hidden="true" /></span>
                    ) : (
                        <span style={{ color: 'var(--cc-tle)' }}><Icon icon={AlertCircleIcon} size={15} aria-hidden="true" /></span>
                    )}
                    {title}
                </span>
                <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                    {record.mastered ? 'Mastered' : 'Keep practicing'} · {pct}%
                </span>
            </div>
            <Progress value={pct} className="h-1.5" aria-label={`${title} mastery: ${pct}%`} />
            {record.sureButWrong && (
                <p className="text-xs mt-1" style={{ color: 'var(--cc-wa)' }}>
                    You were confident but missed this — worth revisiting.
                </p>
            )}
        </div>
    );
};

export default MasteryBar;
