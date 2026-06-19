/**
 * Slim lesson outline (Pack #14). Collapses by PHASE: only the current phase is
 * expanded into a compact run of step dots/ticks (so six "Concept" steps read as
 * a single condensed row, not six full rows); every other phase shows a one-line
 * summary with a progress count (e.g. "Learn 6/8"). Read-only orientation aid —
 * navigation happens through the action bar.
 */
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react';
import type { LessonPlan, PhaseId } from '../engine/types';

const PHASE_LABEL: Record<PhaseId, string> = {
    PreFlight: 'Pre-flight',
    Learn: 'Learn',
    Practice: 'Practice',
    PostFlight: 'Post-flight',
    Recap: 'Recap',
};

interface OutlineRailProps {
    plan: LessonPlan;
    phaseIndex: number;
    stepIndex: number;
}

export const OutlineRail: React.FC<OutlineRailProps> = ({ plan, phaseIndex, stepIndex }) => {
    return (
        <nav className="cc-root p-4 space-y-1.5 h-full overflow-y-auto cc-scroll" aria-label="Lesson outline">
            <span className="cc-eyebrow block px-1 pb-1">Outline</span>
            {plan.phases.map((phase, pIdx) => {
                const total = phase.steps.length;
                const done = pIdx < phaseIndex ? total : pIdx === phaseIndex ? stepIndex : 0;
                const isActive = pIdx === phaseIndex;
                const isComplete = pIdx < phaseIndex;
                const color = isActive ? 'var(--cc-brand-1)' : isComplete ? 'var(--cc-ac)' : 'var(--cc-tx-3)';

                return (
                    <div key={phase.id} className="rounded-xl px-2 py-2" style={{ background: isActive ? 'rgba(163,230,53,.05)' : 'transparent' }}>
                        <div className="flex items-center justify-between gap-2" aria-current={isActive ? 'step' : undefined}>
                            <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color }}>
                                {isComplete && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />}
                                {PHASE_LABEL[phase.id]}
                            </span>
                            <span className="cc-mono text-[11px]" style={{ color: 'var(--cc-tx-3)' }}>{done}/{total}</span>
                        </div>

                        {/* Current phase expands into a condensed dot run + caption. */}
                        {isActive && (
                            <div className="mt-2 space-y-1.5">
                                <div className="flex flex-wrap gap-1.5">
                                    {phase.steps.map((step, sIdx) => {
                                        const stDone = sIdx < stepIndex;
                                        const stCurrent = sIdx === stepIndex;
                                        return (
                                            <span
                                                key={step.id}
                                                title={`Step ${sIdx + 1}`}
                                                className="rounded-full"
                                                style={{
                                                    width: 9, height: 9,
                                                    background: stDone ? 'var(--cc-ac)' : stCurrent ? 'var(--cc-brand-2)' : 'transparent',
                                                    border: stDone || stCurrent ? 'none' : '1.5px solid var(--cc-border)',
                                                    boxShadow: stCurrent ? '0 0 0 3px rgba(163,230,53,.18)' : 'none',
                                                }}
                                                aria-hidden="true"
                                            />
                                        );
                                    })}
                                </div>
                                <span className="cc-mono text-[11px] block" style={{ color: 'var(--cc-tx-3)' }}>
                                    Step {stepIndex + 1} of {total}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default OutlineRail;
