/**
 * Lesson top bar (Req 2.1–2.4): back-to-path control, lesson title, the phase
 * stepper, a single live XP counter, and an exit control. Both back and exit
 * call `onBack`. Sticky, on the design-system dark surface.
 */
import { ArrowLeft01Icon, Cancel01Icon, SidebarLeftIcon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Icon } from '../../../../components/ui';
import type { PhaseId } from '../engine/types';
import { PhaseStepper } from './PhaseStepper';
import { XpCounter } from './XpCounter';

interface TopBarProps {
    title: string;
    phases: PhaseId[];
    activePhase: PhaseId;
    completed: Set<PhaseId>;
    subProgress: { step: number; total: number };
    onBack: () => void;
    onToggleOutline: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, phases, activePhase, completed, subProgress, onBack, onToggleOutline }) => (
    <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{ background: 'rgba(10,11,13,.85)', borderBottom: '1px solid var(--cc-border)' }}
    >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-3 flex items-center gap-3 lg:gap-5">
            <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={onToggleOutline} className="cc-btn cc-btn-ghost h-9 w-9" aria-label="Toggle lesson outline">
                    <Icon icon={SidebarLeftIcon} size={18} />
                </button>
                <button type="button" onClick={onBack} className="cc-btn cc-btn-ghost h-9 px-3 text-sm gap-1.5" aria-label="Back to path">
                    <Icon icon={ArrowLeft01Icon} size={17} />
                    <span className="hidden md:inline">Path</span>
                </button>
            </div>

            <div className="hidden md:block min-w-0 max-w-[200px] lg:max-w-[260px] shrink-0">
                <span className="cc-eyebrow block leading-none">Lesson</span>
                <h1 className="text-sm font-bold truncate" style={{ color: 'var(--cc-tx-1)' }} title={title}>{title}</h1>
            </div>

            <div className="flex-1 min-w-0 max-w-2xl">
                <PhaseStepper phases={phases} activePhase={activePhase} completed={completed} subProgress={subProgress} />
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
                <XpCounter />
                <button type="button" onClick={onBack} className="cc-btn cc-btn-ghost h-9 w-9" aria-label="Exit lesson">
                    <Icon icon={Cancel01Icon} size={18} />
                </button>
            </div>
        </div>
    </header>
);

export default TopBar;
