import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../primitives';

const COLS: { title: string; links: { label: string; to: string }[] }[] = [
    { title: 'Product', links: [{ label: 'Features', to: '/features' }, { label: 'Bug Arena', to: '/arena' }, { label: 'Pricing', to: '/pricing' }] },
    { title: 'Company', links: [{ label: 'About', to: '/about' }, { label: 'FAQ', to: '/faq' }, { label: 'Contact', to: '/contact' }] },
];

export const Footer: React.FC = () => (
    <footer className="relative pt-20 pb-10" style={{ borderTop: '1px solid var(--lp-border)' }} aria-label="Footer">
        <Container>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 mb-16">
                <div className="col-span-2 sm:col-span-1 max-w-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="text-base font-semibold tracking-tight" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>CatCoder</span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cc-brand-1)' }} aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-sm" style={{ color: 'var(--cc-tx-3)', lineHeight: 1.6 }}>Learn, practice, and master programming. Built by people who love code.</p>
                </div>
                {COLS.map((col) => (
                    <div key={col.title} className="flex flex-col gap-3">
                        <span className="lp-fig">{col.title}</span>
                        {col.links.map((l) => (
                            <Link key={l.label} to={l.to} className="text-sm transition-colors" style={{ color: 'var(--cc-tx-2)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cc-tx-1)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cc-tx-2)')}>{l.label}</Link>
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid var(--lp-border)' }}>
                <div className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                    Learn, practice, and master programming.
                </div>
                <div className="flex items-center gap-6 cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                    <span>© 2026 CatCoder</span>
                    <span>hello@catcoder.online</span>
                </div>
            </div>
        </Container>
    </footer>
);
