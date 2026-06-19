/**
 * Phase stepper (Req 1.2, 1.3, 1.6) — replaces the legacy "PART 1 · 8 STEPS"
 * indicator. Renders the five canonical phases with the active one
 * distinguished via the lime brand, completed phases checked, and upcoming
 * phases muted; plus the "step x of n" sub-progress for the active phase.
 */
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Icon } from '../../../../components/ui';
import type { PhaseId } from '../engine/types';

const PHASE_LABEL: Record<PhaseId, string> = {
    PreFlight: 'Pre',
    Learn: 'Learn',
    Practice: 'Practice',
    PostFlight: 'Post',
    Recap: 'Recap',
};

interface PhaseStepperProps {
    phases: PhaseId[];
    activePhase: PhaseId;
    completed: Set<PhaseId>;
    subProgress: { step: number; total: number };
}

export const PhaseStepper: React.FC<PhaseStepperProps> = ({ phases, activePhase, completed, subProgress }) => {
    const activeIndex = phases.indexOf(activePhase);
    return (
        <div className="flex flex-col gap-1.5 w-full" aria-label={`Lesson phase: ${PHASE_LABEL[activePhase]}, step ${subProgress.step} of ${subProgress.total}`}>
            <ol className="flex items-center gap-1.5 w-full" role="list">
                {phases.map((phase, i) => {
                    const isActive = phase === activePhase;
                    const isDone = completed.has(phase) || i < activeIndex;
                    const color = isActive ? 'var(--cc-brand-1)' : isDone ? 'var(--cc-ac)' : 'var(--cc-tx-3)';
                    return (
                        <li key={phase} className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span
                                className="flex items-center gap-1.5 min-w-0"
                                aria-current={isActive ? 'step' : undefined}
                            >
                                <span
                                    className="flex items-center justify-center rounded-full shrink-0 cc-mono text-[10px] font-bold"
                                    style={{
                                        width: 18, height: 18,
                                        color: isActive ? '#14310a' : color,
                                        background: isActive ? 'var(--cc-brand-2)' : 'transparent',
                                        border: isActive ? 'none' : `1.5px solid ${isDone ? 'var(--cc-ac)' : 'var(--cc-border)'}`,
                                    }}
                                >
                                    {isDone && !isActive ? <Icon icon={CheckmarkCircle02Icon} size={12} aria-hidden="true" /> : i + 1}
                                </span>
                                <span className="text-xs font-semibold truncate hidden sm:block" style={{ color }}>{PHASE_LABEL[phase]}</span>
                            </span>
                            {i < phases.length - 1 && (
                                <span className="h-px flex-1 min-w-[8px]" style={{ background: i < activeIndex ? 'var(--cc-ac)' : 'var(--cc-border)' }} aria-hidden="true" />
                            )}
                        </li>
                    );
                })}
            </ol>
            <span className="cc-mono text-[11px]" style={{ color: 'var(--cc-tx-3)' }}>
                Step {subProgress.step} of {subProgress.total}
            </span>
        </div>
    );
};

export default PhaseStepper;
