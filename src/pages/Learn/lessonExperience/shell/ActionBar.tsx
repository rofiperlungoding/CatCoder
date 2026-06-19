/**
 * Sticky bottom action bar (Req 4): ghost Previous + exactly one lime primary
 * action whose label is `Continue | Check | Run | Submit`. The primary is
 * disabled until the active step's Try interaction is attempted; Previous is
 * disabled on the first step. Enter-to-invoke is wired by the shell.
 */
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Icon } from '../../../../components/ui';
import type { PrimaryLabel } from '../state/lessonMachine';

interface ActionBarProps {
    primaryLabel: PrimaryLabel;
    primaryEnabled: boolean;
    canGoPrevious: boolean;
    onPrimary: () => void;
    onPrevious: () => void;
    /** Optional hint shown when the primary is gated (Req 4.4). */
    gatedHint?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({ primaryLabel, primaryEnabled, canGoPrevious, onPrimary, onPrevious, gatedHint }) => (
    <div
        className="sticky bottom-0 z-30 backdrop-blur-md"
        style={{ background: 'rgba(10,11,13,.85)', borderTop: '1px solid var(--cc-border)' }}
    >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-3 flex items-center gap-3">
            <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="cc-btn cc-btn-ghost h-11 px-5 text-sm disabled:opacity-40"
            >
                <Icon icon={ArrowLeft01Icon} size={16} /> Previous
            </button>

            <div className="flex-1 text-center">
                {!primaryEnabled && gatedHint && (
                    <span className="text-xs" style={{ color: 'var(--cc-tx-3)' }}>{gatedHint}</span>
                )}
            </div>

            <button
                type="button"
                onClick={onPrimary}
                disabled={!primaryEnabled}
                className="cc-btn cc-btn-primary h-11 px-7 text-sm disabled:opacity-50"
            >
                {primaryLabel} <Icon icon={ArrowRight01Icon} size={16} />
            </button>
        </div>
    </div>
);

export default ActionBar;
