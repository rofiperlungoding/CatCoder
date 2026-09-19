import { Trophy, StarIcon, FireIcon, FlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'framer-motion';
import React from 'react';
import { Container, Marquee, Reveal, Section } from '../primitives';
import { ACTIVITY, LEADERBOARD } from '../data';

const XpRing: React.FC = () => {
    const r = 64;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative w-[164px] h-[164px]">
            <svg width="164" height="164" viewBox="0 0 164 164" aria-hidden="true">
                <circle cx="82" cy="82" r={r} fill="none" stroke="var(--lp-sunken)" strokeWidth="9" />
                <motion.circle cx="82" cy="82" r={r} fill="none" stroke="var(--cc-brand-1)" strokeWidth="9" strokeLinecap="round"
                    strokeDasharray={c} transform="rotate(-90 82 82)"
                    initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * 0.18 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="cc-mono text-3xl font-semibold" style={{ color: 'var(--cc-tx-1)' }}>12</span>
                <span className="lp-fig">level</span>
            </div>
        </div>
    );
};

export const Leaderboard: React.FC = () => (
    <Section className="py-28" aria-label="Leaderboard and levels">
        <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <Reveal className="lg:col-span-7">
                    <div className="rounded-2xl overflow-hidden h-full lp-e2">
                        <div className="flex items-center justify-between px-6 h-14" style={{ borderBottom: '1px solid var(--lp-border)' }}>
                            <span className="text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>Global leaderboard</span>
                            <span className="inline-flex items-center gap-1.5 lp-fig"><span className="lp-live-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cc-brand-1)' }} aria-hidden="true" /> live</span>
                        </div>
                        {LEADERBOARD.map((e, i) => (
                            <motion.div key={e.handle} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                                className="flex items-center gap-4 px-6 py-3.5" style={{ borderTop: i ? '1px solid var(--lp-border)' : 'none' }}>
                                <span className="cc-mono text-base w-5 text-center" style={{ color: i === 0 ? 'var(--cc-brand-1)' : 'var(--cc-tx-3)' }}>{e.rank}</span>
                                <span className="w-9 h-9 rounded-full inline-flex items-center justify-center cc-mono text-sm shrink-0" style={{ background: 'var(--lp-sunken)', border: '1px solid var(--lp-border-loud)', color: 'var(--cc-tx-1)' }}>{e.handle[0].toUpperCase()}</span>
                                <span className="cc-mono text-sm flex-1 min-w-0 truncate" style={{ color: 'var(--cc-tx-1)' }}>@{e.handle}</span>
                                <span className="cc-mono text-xs hidden sm:inline" style={{ color: 'var(--cc-tx-3)' }}>LVL {e.level}</span>
                                <span className="cc-mono text-sm" style={{ color: 'var(--cc-tx-2)' }}>{e.xp.toLocaleString()}</span>
                            </motion.div>
                        ))}
                    </div>
                </Reveal>

                <Reveal delay={0.1} className="lg:col-span-5">
                    <div className="rounded-2xl p-7 h-full flex flex-col items-center text-center lp-e1">
                        <div className="my-6"><XpRing /></div>
                        <p className="cc-mono text-xs mb-5" style={{ color: 'var(--cc-tx-3)' }}>2,840 / 3,000 XP to level 13</p>
                        <div className="grid grid-cols-4 gap-2.5 w-full">
                            {[Trophy, FireIcon, StarIcon, FlashIcon, Trophy, StarIcon, FireIcon, FlashIcon].map((Ic, i) => (
                                <span key={i} className="aspect-square rounded-xl inline-flex items-center justify-center" style={{ background: 'var(--lp-sunken)', border: '1px solid var(--lp-border)', color: i < 4 ? ['#e0b341', '#d98c6a', 'var(--cc-brand-1)', '#6ba8ff'][i] : 'var(--cc-tx-3)', opacity: i < 4 ? 1 : 0.35 }}>
                                    <HugeiconsIcon icon={Ic} size={17} />
                                </span>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </div>

            <div className="mt-8">
                <Marquee duration={50} items={ACTIVITY.map((a) => <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>{a}</span>)} sep={<span className="inline-block w-1 h-1 rounded-full mx-2" style={{ background: 'var(--lp-border-loud)' }} />} />
            </div>
        </Container>
    </Section>
);
