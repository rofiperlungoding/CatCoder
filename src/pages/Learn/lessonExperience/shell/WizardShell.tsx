/**
 * WizardShell — composes the TopBar (+ PhaseStepper + XpCounter), the optional
 * OutlineRail, the ContentArea (or RecapBlock), and the bottom ActionBar. It
 * dispatches reducer events, enforces the mastery gate before Recap, offers the
 * Pre-flight test-out path, and wires Enter-to-invoke for the primary action.
 *
 * State/plan come from the session {@link useLessonStore}; this component is
 * otherwise presentational.
 */
import { ArrowRight01Icon, AlertCircleIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '../../../../components/ui';
import { PHASE_ORDER, type PhaseId } from '../engine/types';
import { TESTOUT_THRESHOLD } from '../engine/mastery';
import { getActivePhaseId } from '../state/lessonMachine';
import {
    useActiveBlocks,
    useCanGoPrevious,
    useIsPrimaryEnabled,
    usePrimaryLabel,
    useSubProgress,
    useActivePhaseId,
    useLessonStore,
} from '../state/useLessonStore';
import { useReducedMotion } from '../useReducedMotion';
import { TopBar } from './TopBar';
import { ActionBar } from './ActionBar';
import { ContentArea } from './ContentArea';
import { OutlineRail } from './OutlineRail';
import { LiveRegion } from './LiveRegion';
import { RecapBlock, type RecapCompletion } from '../blocks/RecapBlock';
import type { BlockResult } from '../state/lessonMachine';

const PHASE_META: Record<PhaseId, { title: string; intro?: string }> = {
    PreFlight: { title: 'Pre-flight check', intro: "Let's see what you already know — no pressure." },
    Learn: { title: 'Learn' },
    Practice: { title: 'Practice — the Build', intro: 'Put the idea to work for real.' },
    PostFlight: { title: 'Post-flight check', intro: 'Show what stuck — rate how sure you are.' },
    Recap: { title: 'Recap' },
};

interface WizardShellProps {
    lessonTitle: string;
    streak: number;
    hasNext: boolean;
    completion: RecapCompletion;
    onBack: () => void;
    onNext: () => void;
    onAddToReview: () => void;
}

export const WizardShell: React.FC<WizardShellProps> = ({ lessonTitle, streak, hasNext, completion, onBack, onNext, onAddToReview }) => {
    const reducedMotion = useReducedMotion();
    const dispatch = useLessonStore((s) => s.dispatch);
    const plan = useLessonStore((s) => s.plan);
    const state = useLessonStore((s) => s.state);

    const activePhase = useActivePhaseId();
    const blocks = useActiveBlocks();
    const subProgress = useSubProgress();
    const canGoPrevious = useCanGoPrevious();
    const primaryEnabled = useIsPrimaryEnabled();
    const primaryLabel = usePrimaryLabel();

    const [outlineOpen, setOutlineOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [liveMsg, setLiveMsg] = useState('');

    const announce = useCallback((msg: string) => setLiveMsg(msg), []);

    // Screen-aware outline toggle: collapsible rail on desktop, drawer on <lg.
    const toggleOutline = useCallback(() => {
        const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
        if (isDesktop) setOutlineOpen((o) => !o);
        else setDrawerOpen((o) => !o);
    }, []);

    // Announce phase changes.
    useEffect(() => {
        if (activePhase) setLiveMsg(`${PHASE_META[activePhase].title}. Step ${subProgress.step} of ${subProgress.total}.`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePhase]);

    if (!plan || !state || !activePhase) return null;

    const onResult = (r: BlockResult) => dispatch({ t: 'ATTEMPT', result: r });
    const onRevealHint = (blockId: string) => { dispatch({ t: 'REVEAL_HINT', blockId }); announce('Hint revealed.'); };

    // --- Pre-flight test-out -------------------------------------------------
    const preEntries = Object.values(state.preFlight);
    const preRatio = preEntries.length ? preEntries.filter(Boolean).length / preEntries.length : 0;
    const canTestOut = activePhase === 'PreFlight' && preEntries.length > 0 && preRatio >= TESTOUT_THRESHOLD;

    const handleTestOut = () => {
        dispatch({ t: 'TEST_OUT' });
        if (!useLessonStore.getState().state?.testedOut) return;
        let guard = 0;
        while (guard < 50) {
            const s = useLessonStore.getState();
            if (!s.state || !s.plan) break;
            const phase = getActivePhaseId(s.state, s.plan);
            if (phase !== 'PreFlight') break;
            dispatch({ t: 'PRIMARY' });
            guard += 1;
        }
        announce('Skipped ahead to Practice. You can revisit Learn anytime.');
    };

    // --- Post-flight mastery gate -------------------------------------------
    const remediation = activePhase === 'PostFlight' ? state.remediationQueue : [];
    const showRemediation = remediation.length > 0;

    const handlePrimary = () => {
        if (!primaryEnabled) return;
        if (activePhase === 'PostFlight' && subProgress.step === subProgress.total) {
            dispatch({ t: 'EVALUATE_POSTFLIGHT' });
            const fresh = useLessonStore.getState().state?.remediationQueue ?? [];
            if (fresh.length > 0) {
                announce('A couple of concepts need another look before you finish.');
                return;
            }
        }
        dispatch({ t: 'PRIMARY' });
    };

    const handlePrevious = () => dispatch({ t: 'PREVIOUS' });

    const handleBackToLearn = () => {
        let guard = 0;
        while (guard < 50) {
            const s = useLessonStore.getState();
            if (!s.state || !s.plan) break;
            if (getActivePhaseId(s.state, s.plan) === 'Learn') break;
            dispatch({ t: 'PREVIOUS' });
            guard += 1;
        }
        announce('Back in the Learn phase for a refresher.');
    };

    // --- Enter-to-invoke -----------------------------------------------------
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' || e.shiftKey) return;
        const t = e.target as HTMLElement;
        const tag = t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable || t.closest('.monaco-editor')) return;
        if (activePhase === 'Recap') return;
        if (primaryEnabled) { e.preventDefault(); handlePrimary(); }
    };

    const isRecap = activePhase === 'Recap';

    const testOutBanner = canTestOut ? (
        <div className="rounded-2xl p-4 flex items-center gap-3 cc-reveal" style={{ background: 'rgba(163,230,53,.08)', border: '1px solid rgba(163,230,53,.28)' }}>
            <span className="flex-1 text-sm" style={{ color: 'var(--cc-tx-1)' }}>
                You've clearly got the basics. Want to jump straight to Practice?
            </span>
            <button type="button" onClick={handleTestOut} className="cc-btn cc-btn-secondary h-9 px-4 text-sm shrink-0">
                Skip ahead <Icon icon={ArrowRight01Icon} size={15} />
            </button>
        </div>
    ) : null;

    const remediationBanner = showRemediation ? (
        <div className="rounded-2xl p-4 cc-reveal" style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.28)' }} role="status">
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--cc-tx-1)' }}>
                <span style={{ color: 'var(--cc-tle)' }}><Icon icon={AlertCircleIcon} size={16} aria-hidden="true" /></span>
                Let's shore up {remediation.length} concept{remediation.length === 1 ? '' : 's'} first.
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>
                You're close. Revisit the Learn material for these, then retake the check — this isn't a fail, it's targeted practice.
            </p>
            <button type="button" onClick={handleBackToLearn} className="cc-btn cc-btn-secondary h-9 px-4 text-sm mt-3">
                Review Learn material
            </button>
        </div>
    ) : null;

    return (
        <div className="cc-root min-h-screen flex flex-col" style={{ background: 'var(--cc-bg)' }} onKeyDown={onKeyDown}>
            <TopBar
                title={lessonTitle}
                phases={PHASE_ORDER}
                activePhase={activePhase}
                completed={new Set(PHASE_ORDER.slice(0, PHASE_ORDER.indexOf(activePhase)))}
                subProgress={subProgress}
                onBack={onBack}
                onToggleOutline={toggleOutline}
            />

            <div className="flex-1 flex min-h-0">
                {outlineOpen && !isRecap && (
                    <aside className="hidden lg:block w-56 shrink-0" style={{ borderRight: '1px solid var(--cc-border)', background: 'var(--cc-surface-1)' }}>
                        {plan && <OutlineRail plan={plan} phaseIndex={state.phaseIndex} stepIndex={state.stepIndex} />}
                    </aside>
                )}

                <main className="flex-1 min-w-0 overflow-y-auto cc-scroll">
                    {isRecap ? (
                        <div className="mx-auto w-full max-w-[720px] px-4 lg:px-6 py-8">
                            <RecapBlock
                                block={blocks[0] ?? { id: 'recap', type: 'recap' }}
                                concepts={plan.concepts}
                                mastery={state.mastery}
                                completion={completion}
                                streak={streak}
                                hasNext={hasNext}
                                onNext={onNext}
                                onBackToPath={onBack}
                                onAddToReview={onAddToReview}
                            />
                        </div>
                    ) : (
                        <ContentArea
                            phase={activePhase}
                            phaseTitle={PHASE_META[activePhase].title}
                            intro={PHASE_META[activePhase].intro}
                            blocks={blocks}
                            language={plan.language}
                            results={state.results}
                            hintLevels={state.hintLevel}
                            reducedMotion={reducedMotion}
                            captureConfidence={activePhase === 'PostFlight'}
                            onResult={onResult}
                            onRevealHint={onRevealHint}
                            announce={announce}
                            banner={testOutBanner ?? remediationBanner ?? undefined}
                        />
                    )}
                </main>
            </div>

            {!isRecap && (
                <ActionBar
                    primaryLabel={primaryLabel}
                    primaryEnabled={primaryEnabled}
                    canGoPrevious={canGoPrevious}
                    onPrimary={handlePrimary}
                    onPrevious={handlePrevious}
                    gatedHint={!primaryEnabled ? 'Give the question a try to continue' : undefined}
                />
            )}

            <LiveRegion message={liveMsg} />

            {/* Tablet/mobile outline drawer */}
            {drawerOpen && !isRecap && (
                <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Lesson outline">
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.55)' }} onClick={() => setDrawerOpen(false)} />
                    <div
                        className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[300px] cc-pop-panel"
                        style={{ background: 'var(--cc-surface-1)', borderRight: '1px solid var(--cc-border)', boxShadow: 'var(--cc-e3)' }}
                    >
                        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--cc-border)' }}>
                            <span className="cc-eyebrow">Outline</span>
                            <button type="button" onClick={() => setDrawerOpen(false)} className="cc-btn cc-btn-ghost h-8 w-8" aria-label="Close outline">
                                <Icon icon={Cancel01Icon} size={16} />
                            </button>
                        </div>
                        <div className="h-[calc(100%-49px)]">
                            <OutlineRail plan={plan} phaseIndex={state.phaseIndex} stepIndex={state.stepIndex} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WizardShell;
