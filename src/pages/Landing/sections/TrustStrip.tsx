import React from 'react';
import { Marquee } from '../primitives';

const MARKS = [
    'INSTANT AI REVIEW',
    'PYTHON · JAVASCRIPT · C++',
    'RUNS IN YOUR BROWSER',
    'FREE TO PLAY',
    'NO ACCOUNT NEEDED',
    'LEVEL UP AS YOU SOLVE',
];

export const TrustStrip: React.FC = () => (
    <section className="relative py-10" aria-label="What you get with CatCoder">
        <div style={{ borderTop: '1px solid var(--lp-border)', borderBottom: '1px solid var(--lp-border)' }}>
            <div className="py-6" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
                <Marquee
                    duration={50}
                    items={MARKS.map((m) => (
                        <span className="cc-mono text-sm tracking-[0.12em]" style={{ color: 'var(--cc-tx-2)', opacity: 0.65 }}>{m}</span>
                    ))}
                    sep={<span className="inline-block w-1 h-1 rounded-full mx-2" style={{ background: 'var(--cc-brand-2)', opacity: 0.5 }} />}
                />
            </div>
        </div>
    </section>
);
