import { CheckmarkCircle02Icon, StarIcon, Trophy } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, MagneticButton } from '../primitives';
import { useTilt } from '../hooks';

const CODE = [
    [{ t: 'def ', c: '#9d7bd8' }, { t: 'two_sum', c: '#d8c879' }, { t: '(nums, target):', c: 'var(--cc-tx-1)' }],
    [{ t: '    seen = {}', c: 'var(--cc-tx-1)' }],
    [{ t: '    for ', c: '#9d7bd8' }, { t: 'i, n ', c: 'var(--cc-tx-1)' }, { t: 'in ', c: '#9d7bd8' }, { t: 'enumerate(nums):', c: 'var(--cc-tx-1)' }],
    [{ t: '        if ', c: '#9d7bd8' }, { t: 'target - n ', c: 'var(--cc-tx-1)' }, { t: 'in ', c: '#9d7bd8' }, { t: 'seen:', c: 'var(--cc-tx-1)' }],
    [{ t: '            return ', c: '#9d7bd8' }, { t: '[seen[target - n], i]', c: 'var(--cc-tx-1)' }],
    [{ t: '        seen[n] = i', c: 'var(--cc-tx-1)' }],
];

const HeroDemo: React.FC = () => {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { margin: '-20%' });
    const tilt = useTilt({ max: 6, restX: 6, restY: -9 });
    const [phase, setPhase] = useState(reduced ? 4 : 0);

    useEffect(() => {
        if (reduced || !inView) return;
        const timings = [1400, 1200, 1600, 1200, 2200];
        let t = 0;
        const advance = () => {
            setPhase((p) => {
                const next = (p + 1) % 5;
                t = window.setTimeout(advance, timings[next]);
                return next;
            });
        };
        t = window.setTimeout(advance, timings[0]);
        return () => clearTimeout(t);
    }, [reduced, inView]);

    return (
        <div ref={ref} className="lp-stage relative">
            <div className="lp-ambient absolute -inset-10 -z-10" aria-hidden="true" />
            <motion.div
                onPointerMove={tilt.onMove}
                onPointerLeave={tilt.onLeave}
                style={{ ...tilt.style, transformStyle: 'preserve-3d' }}
                className="relative"
            >
                {/* Editor panel */}
                <div className="lp-e3 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 h-10" style={{ borderBottom: '1px solid var(--lp-border)' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f46' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f46' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f46' }} />
                        <span className="ml-2 cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>two_sum.py</span>
                    </div>
                    <div className="p-5 cc-mono text-[13px] leading-relaxed" style={{ background: 'var(--lp-sunken)' }}>
                        {CODE.map((line, i) => (
                            <div key={i} className="whitespace-pre">
                                {line.map((seg, j) => <span key={j} style={{ color: seg.c }}>{seg.t}</span>)}
                                {i === CODE.length - 1 && phase === 0 && <span className="lp-cursor" style={{ color: 'var(--cc-brand-1)' }}>▍</span>}
                            </div>
                        ))}
                        <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--lp-border)' }}>
                            <AnimatePresence>
                                {phase >= 1 && (
                                    <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--cc-tx-3)' }}>$ pytest -q</motion.div>
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                {phase >= 3 && (
                                    <motion.div key="pass" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2" style={{ color: 'var(--cc-brand-1)' }}>
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} /> 24 passed in 0.08s
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Floating AI review bubble — pops off the top edge */}
                <AnimatePresence>
                    {phase >= 2 && (
                        <motion.div
                            key="ai"
                            initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                            className="absolute -top-8 left-4 sm:-left-8 max-w-[240px] rounded-xl p-3.5 lp-e2"
                            style={{ transform: 'translateZ(50px)' }}
                        >
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span style={{ color: 'var(--cc-brand-1)' }}><HugeiconsIcon icon={StarIcon} size={13} /></span>
                                <span className="cc-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--cc-tx-3)' }}>AI review</span>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.5 }}>Clean one-pass solution. <span style={{ color: 'var(--cc-tx-1)' }}>O(n)</span> time, O(n) space — optimal here.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Level ring + XP chip — float off the bottom-right */}
                <motion.div
                    className="absolute -bottom-7 -right-3 sm:-right-7 flex items-center gap-2.5 rounded-xl px-3.5 py-3 lp-e2"
                    style={{ transform: 'translateZ(70px)' }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0" style={{ background: 'var(--lp-sunken)', color: 'var(--cc-tle, #e0b341)' }}>
                        <HugeiconsIcon icon={Trophy} size={16} />
                    </span>
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="cc-mono text-xs font-semibold" style={{ color: 'var(--cc-tx-1)' }}>Level 12</span>
                            <AnimatePresence>
                                {phase >= 4 && <motion.span key="xp" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="cc-mono text-xs" style={{ color: 'var(--cc-brand-1)' }}>+50 XP</motion.span>}
                            </AnimatePresence>
                        </div>
                        <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--lp-sunken)' }}>
                            <motion.div className="h-full rounded-full" style={{ background: 'var(--cc-brand-1)' }} animate={{ width: phase >= 4 ? '82%' : '72%' }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export const Hero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-36 pb-24 overflow-hidden" aria-labelledby="hero-title">
            <div className="absolute inset-0 lp-grid-bg" aria-hidden="true" style={{ maskImage: 'radial-gradient(120% 70% at 60% 0%, #000 25%, transparent 70%)', opacity: 0.5 }} />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40" style={{ background: 'linear-gradient(180deg, var(--lp-bg), transparent)' }} />

            <Container className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    <div className="lg:col-span-5">
                        <motion.h1 id="hero-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
                            className="font-semibold tracking-[-0.02em]" style={{ fontFamily: 'var(--cc-font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.05, color: 'var(--cc-tx-1)' }}>
                            Master coding, one <span style={{ color: 'var(--cc-brand-1)' }}>challenge</span> at a time.
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
                            className="mt-5 text-lg max-w-md" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                            Interactive challenges, instant AI review, and a leveling system that turns practice into a habit you keep.
                        </motion.p>

                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-8 flex flex-col sm:flex-row gap-3">
                            <MagneticButton onClick={() => navigate('/login')} size="lg" arrow>Start free</MagneticButton>
                            <MagneticButton onClick={() => navigate('/login')} size="lg" variant="ghost">Explore challenges</MagneticButton>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-7 lg:pl-6">
                        <HeroDemo />
                    </div>
                </div>
            </Container>
        </section>
    );
};
