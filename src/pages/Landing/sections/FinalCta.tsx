import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, MagneticButton, Reveal } from '../primitives';

export const FinalCta: React.FC = () => {
    const navigate = useNavigate();
    return (
        <section className="relative py-32 overflow-hidden" aria-label="Get started">
            <div className="absolute inset-0 lp-grid-bg" aria-hidden="true" style={{ maskImage: 'radial-gradient(60% 60% at 50% 50%, #000, transparent 75%)', opacity: 0.4 }} />
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[360px] lp-ambient" />

            <Container className="relative">
                <Reveal>
                    <div className="mx-auto max-w-2xl rounded-3xl px-8 py-14 text-center lp-e2">
                        <h2 className="font-semibold tracking-[-0.02em] mx-auto" style={{ fontFamily: 'var(--cc-font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1, color: 'var(--cc-tx-1)' }}>
                            Start leveling up today.
                        </h2>
                        <p className="mt-4 text-lg max-w-md mx-auto" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                            Join 100,000+ developers turning practice into progress. Your first challenge is one click away.
                        </p>
                        <div className="mt-9 flex flex-col items-center gap-4">
                            <MagneticButton onClick={() => navigate('/login')} size="lg" arrow>Start free</MagneticButton>
                            <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>No credit card · free forever tier</span>
                        </div>
                    </div>
                </Reveal>
            </Container>
        </section>
    );
};
