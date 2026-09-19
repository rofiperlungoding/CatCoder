import { CheckmarkCircle02Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { Container, Reveal, Section } from '../primitives';
import { STEPS } from '../data';

const PanelState: React.FC<{ step: number }> = ({ step }) => {
    if (step === 0) {
        const rows: [string, string][] = [['Two Sum', 'Easy'], ['Valid Parentheses', 'Easy'], ['LRU Cache', 'Medium']];
        return (
            <div className="space-y-2">
                {rows.map((r, i) => (
                    <div key={r[0]} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: i === 0 ? 'var(--lp-veil)' : 'var(--lp-sunken)', border: `1px solid ${i === 0 ? 'rgba(159,230,92,.25)' : 'var(--lp-border)'}` }}>
                        <span className="cc-mono text-sm" style={{ color: 'var(--cc-tx-1)' }}>{r[0]}</span>
                        <span className="cc-mono text-[11px]" style={{ color: i === 0 ? 'var(--cc-brand-1)' : 'var(--cc-tx-3)' }}>{r[1]}</span>
                    </div>
                ))}
            </div>
        );
    }
    if (step === 1) {
        return (
            <div className="cc-mono text-[13px] leading-relaxed">
                <div><span style={{ color: '#9d7bd8' }}>print</span><span style={{ color: 'var(--cc-tx-1)' }}>(two_sum(nums, 9))</span></div>
                <div className="mt-2" style={{ color: 'var(--cc-tx-3)' }}>$ running…</div>
                <div style={{ color: 'var(--cc-tx-1)' }}>[0, 1]</div>
            </div>
        );
    }
    if (step === 2) {
        return (
            <div className="rounded-lg p-4 flex gap-3" style={{ background: 'var(--lp-veil)', border: '1px solid rgba(159,230,92,.2)' }}>
                <span style={{ color: 'var(--cc-brand-1)' }}><HugeiconsIcon icon={StarIcon} size={16} /></span>
                <p className="cc-mono text-[12px]" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>Correct and tidy. Your loop is <span style={{ color: 'var(--cc-tx-1)' }}>O(n²)</span> — a hash map gets you to <span style={{ color: 'var(--cc-brand-1)' }}>O(n)</span>.</p>
            </div>
        );
    }
    return (
        <div>
            <div className="flex items-center justify-between cc-mono text-xs mb-2" style={{ color: 'var(--cc-tx-3)' }}><span>Level 12</span><span style={{ color: 'var(--cc-brand-1)' }}>+50 XP</span></div>
            <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--lp-sunken)' }}>
                <div className="h-full rounded-full" style={{ width: '82%', background: 'var(--cc-brand-1)' }} />
            </div>
            <div className="flex items-center gap-2 cc-mono text-xs" style={{ color: 'var(--cc-brand-1)' }}>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} /> Rank up · #1,204 → #1,180
            </div>
        </div>
    );
};

const StepText: React.FC<{ i: number }> = ({ i }) => (
    <div>
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>{STEPS[i].title}</h3>
        <p className="mt-3 text-base max-w-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>{STEPS[i].blurb}</p>
    </div>
);

const Panel: React.FC<{ step: number }> = ({ step }) => (
    <div className="lp-e2 rounded-2xl overflow-hidden w-full max-w-md">
        <div className="p-5 min-h-[180px]" style={{ background: 'var(--lp-sunken)' }}>
            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                    <PanelState step={step} />
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
);

export const HowItWorks: React.FC = () => {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    const [active, setActive] = useState(0);

    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        setActive(Math.max(0, Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))));
    });

    return (
        <Section className="py-28" aria-label="How it works">
            <Container>
                <Reveal>
                    <h2 className="font-semibold tracking-[-0.02em]" style={{ fontFamily: 'var(--cc-font-display)', fontSize: 'clamp(2rem, 3.5vw, 3.25rem)', lineHeight: 1.1, color: 'var(--cc-tx-1)' }}>
                        One continuous product walkthrough.
                    </h2>
                </Reveal>
            </Container>

            {/* Mobile: stacked */}
            <Container className="lg:hidden mt-12 space-y-12">
                {STEPS.map((_, i) => (
                    <Reveal key={i}>
                        <StepText i={i} />
                        <div className="mt-5"><Panel step={i} /></div>
                    </Reveal>
                ))}
            </Container>

            {/* Desktop: pinned, panel transforms */}
            <div ref={ref} className="hidden lg:block relative" style={{ height: `${STEPS.length * 100}vh` }}>
                <div className="sticky top-0 h-screen flex items-center">
                    <Container>
                        <div className="flex items-center gap-10">
                            <div className="flex flex-col gap-3 py-2" aria-hidden="true">
                                {STEPS.map((_, i) => (
                                    <div key={i} className="w-1 h-14 rounded-full overflow-hidden" style={{ background: 'var(--lp-border)' }}>
                                        <motion.div className="w-full rounded-full" style={{ background: 'var(--cc-brand-1)' }} animate={{ height: i <= active ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-10 items-center">
                                <AnimatePresence mode="wait">
                                    <motion.div key={active} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
                                        <StepText i={active} />
                                    </motion.div>
                                </AnimatePresence>
                                <div className="flex justify-end"><Panel step={active} /></div>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </Section>
    );
};
