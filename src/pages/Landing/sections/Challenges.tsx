import React from 'react';
import { Container, Chip, Reveal, Section, Tag } from '../primitives';
import { problems } from '../../../data/problems';
import type { Problem } from '../../../types';

const DIFF_LABEL: Record<Problem['difficulty'], 'Easy' | 'Medium' | 'Hard'> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
};
const BAR_COLOR: Record<string, string> = { Easy: 'var(--cc-brand-1)', Medium: '#e0b341', Hard: '#ff6b6b' };
const LANG_LABEL: Record<string, string> = { python: 'Py', javascript: 'JS', cpp: 'C++' };

// Real problems from the catalog, one per recognizable shape across difficulties.
const SHOWCASE_IDS = ['two-sum', 'binary-search', 'valid-parentheses', 'longest-substring', 'trapping-rain', 'word-ladder'];
const SHOWCASE: Problem[] = SHOWCASE_IDS
    .map((id) => problems.find((p) => p.id === id))
    .filter((p): p is Problem => Boolean(p));

const Card: React.FC<{ p: Problem }> = ({ p }) => {
    const diff = DIFF_LABEL[p.difficulty];
    return (
        <article className="rounded-2xl p-6 flex flex-col lp-e1">
            <div className="flex items-center justify-between">
                <Tag difficulty={diff} />
                <span className="cc-mono text-sm" style={{ color: 'var(--cc-tx-2)' }}>+{p.xpReward} XP</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>{p.title}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">{p.languages.map((l) => <Chip key={l}>{LANG_LABEL[l] ?? l}</Chip>)}</div>
            <div className="mt-auto pt-6">
                <div className="flex items-center justify-between cc-mono text-[11px] mb-1.5" style={{ color: 'var(--cc-tx-3)' }}>
                    <span>difficulty</span><span style={{ color: 'var(--cc-tx-2)' }}>tier {p.tier}/5</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--lp-sunken)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(p.tier / 5) * 100}%`, background: BAR_COLOR[diff] }} />
                </div>
            </div>
        </article>
    );
};

export const Challenges: React.FC = () => (
    <Section className="py-28" aria-label="Challenge showcase">
        <Container>
            <Reveal>
                <h2 className="font-semibold tracking-[-0.02em]" style={{ fontFamily: 'var(--cc-font-display)', fontSize: 'clamp(2rem, 3.5vw, 3.25rem)', lineHeight: 1.1, color: 'var(--cc-tx-1)' }}>
                    Pick a problem.<br />Get a verdict.
                </h2>
                <p className="mt-4 text-base max-w-md" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                    Real problems from the catalog. Run them in the browser and get a verdict.
                </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SHOWCASE.map((p) => <Card key={p.id} p={p} />)}
            </div>
        </Container>
    </Section>
);
