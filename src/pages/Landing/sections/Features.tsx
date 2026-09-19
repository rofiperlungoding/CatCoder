import { StarIcon, Trophy, FireIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'framer-motion';
import React from 'react';
import { Container, Reveal, Section } from '../primitives';
import { FEATURES, type Feature } from '../data';
import { problems } from '../../../data/problems';

const AiVisual: React.FC = () => (
    <div className="rounded-xl overflow-hidden cc-mono text-[12px] leading-relaxed" style={{ background: 'var(--lp-sunken)', border: '1px solid var(--lp-border)' }}>
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--lp-border)', color: 'var(--cc-tx-3)' }}>review · solution.py</div>
        <div className="p-4 space-y-1">
            <div style={{ color: '#c47b7b' }}>- for i in range(len(nums)):</div>
            <div style={{ color: 'var(--cc-brand-1)' }}>+ for i, n in enumerate(nums):</div>
            <div className="mt-3 flex gap-2 rounded-lg p-3" style={{ background: 'var(--lp-veil)', border: '1px solid rgba(159,230,92,.18)' }}>
                <span style={{ color: 'var(--cc-brand-1)' }}><HugeiconsIcon icon={StarIcon} size={13} /></span>
                <span style={{ color: 'var(--cc-tx-2)' }}>Use <span style={{ color: 'var(--cc-tx-1)' }}>enumerate</span> — drop the index bookkeeping, stay O(n).</span>
            </div>
        </div>
    </div>
);

const GamifiedVisual: React.FC = () => (
    <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--lp-sunken)" strokeWidth="6" />
                <motion.circle cx="40" cy="40" r="32" fill="none" stroke="var(--cc-brand-1)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 32} transform="rotate(-90 40 40)"
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }} whileInView={{ strokeDashoffset: 2 * Math.PI * 32 * 0.18 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center cc-mono text-lg font-semibold" style={{ color: 'var(--cc-tx-1)' }}>12</div>
        </div>
        <div className="flex gap-2">
            {[Trophy, FireIcon, StarIcon].map((Ic, i) => (
                <span key={i} className="w-9 h-9 rounded-lg inline-flex items-center justify-center" style={{ background: 'var(--lp-sunken)', border: '1px solid var(--lp-border)', color: ['#e0b341', '#d98c6a', 'var(--cc-brand-1)'][i] }}>
                    <HugeiconsIcon icon={Ic} size={15} />
                </span>
            ))}
        </div>
    </div>
);

const ChallengesVisual: React.FC = () => {
    const ids = ['two-sum', 'valid-parentheses', 'word-ladder'];
    const rows = ids
        .map((id) => problems.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
    const color: Record<string, string> = { easy: 'var(--cc-brand-1)', medium: '#e0b341', hard: '#ff6b6b' };
    const label: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    return (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--lp-sunken)', border: '1px solid var(--lp-border)' }}>
            {rows.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: i ? '1px solid var(--lp-border)' : 'none' }}>
                    <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-1)' }}>{r.title}</span>
                    <span className="cc-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: color[r.difficulty], border: `1px solid ${color[r.difficulty]}2e` }}>{label[r.difficulty]}</span>
                </div>
            ))}
            <div className="px-4 py-2 cc-mono text-[10px]" style={{ borderTop: '1px solid var(--lp-border)', color: 'var(--cc-tx-3)' }}>
                {problems.length} challenges · Python · JavaScript · C++
            </div>
        </div>
    );
};

const CoursesVisual: React.FC = () => (
    <div className="relative pl-4">
        <span className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'var(--lp-border-loud)' }} aria-hidden="true" />
        {['Basics', 'Data structures', 'Algorithms', 'System design'].map((s, i) => (
            <div key={s} className="relative flex items-center gap-3 py-1.5">
                <span className="w-3 h-3 rounded-full shrink-0 -ml-4" style={{ background: i === 1 ? 'var(--cc-brand-1)' : 'var(--lp-sunken)', border: `1px solid ${i <= 1 ? 'var(--cc-brand-1)' : 'var(--lp-border-loud)'}`, boxShadow: i === 1 ? '0 0 0 4px var(--lp-veil)' : 'none' }} />
                <span className="cc-mono text-xs" style={{ color: i <= 1 ? 'var(--cc-tx-1)' : 'var(--cc-tx-3)' }}>{s}</span>
            </div>
        ))}
    </div>
);

const VISUAL: Record<Feature['kind'], React.FC> = { aiReview: AiVisual, gamified: GamifiedVisual, challenges: ChallengesVisual, courses: CoursesVisual };
const SPAN: Record<Feature['kind'], string> = { aiReview: 'lg:col-span-7', gamified: 'lg:col-span-5', challenges: 'lg:col-span-5', courses: 'lg:col-span-7' };

const Tile: React.FC<{ f: Feature; i: number }> = ({ f, i }) => {
    const Visual = VISUAL[f.kind];
    return (
        <Reveal delay={(i % 2) * 0.08} className={SPAN[f.kind]}>
            <div className="rounded-2xl p-7 h-full flex flex-col lp-e1">
                <div className="flex items-center gap-3 mb-5">
                    <span className="w-9 h-9 rounded-lg inline-flex items-center justify-center" style={{ background: 'var(--lp-sunken)', border: '1px solid var(--lp-border)', color: 'var(--cc-brand-1)' }}>
                        <HugeiconsIcon icon={f.icon} size={17} strokeWidth={1.6} />
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>{f.title}</h3>
                </div>
                <p className="text-sm mb-6 max-w-md" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>{f.blurb}</p>
                <div className="mt-auto"><Visual /></div>
            </div>
        </Reveal>
    );
};

export const Features: React.FC = () => (
    <Section className="py-28">
        <Container>
            <Reveal>
                <h2 className="font-semibold tracking-[-0.02em] max-w-2xl" style={{ fontFamily: 'var(--cc-font-display)', fontSize: 'clamp(2rem, 3.5vw, 3.25rem)', lineHeight: 1.1, color: 'var(--cc-tx-1)' }}>
                    A complete loop for getting better.
                </h2>
                <p className="mt-4 text-lg max-w-xl" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>Four surfaces that work together — review, progress, practice, and path.</p>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-5 auto-rows-fr">
                {FEATURES.map((f, i) => <Tile key={f.id} f={f} i={i} />)}
            </div>
        </Container>
    </Section>
);
