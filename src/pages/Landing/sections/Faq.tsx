import { Add01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { Container, Reveal, Section } from '../primitives';
import { FAQS } from '../data';

export const Faq: React.FC = () => {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <Section className="py-28" aria-label="Frequently asked questions">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <Reveal className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28">
                            <h2 className="font-semibold tracking-[-0.02em]" style={{ fontFamily: 'var(--cc-font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1, color: 'var(--cc-tx-1)' }}>
                                Questions,<br />answered.
                            </h2>
                            <p className="mt-4 text-base max-w-xs" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>Everything you need to know before your first solve. Still curious? Reach out anytime.</p>
                        </div>
                    </Reveal>

                    <div className="lg:col-span-8">
                        {FAQS.map((f, i) => {
                            const isOpen = open === i;
                            return (
                                <Reveal key={f.q} delay={i * 0.05}>
                                    <div style={{ borderTop: '1px solid var(--lp-border)' }}>
                                        <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
                                            className="w-full flex items-center gap-5 py-6 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-[#9fe65c] rounded"
                                            style={{ borderLeft: `2px solid ${isOpen ? 'var(--cc-brand-1)' : 'transparent'}`, paddingLeft: '1.25rem', transition: 'border-color 200ms' }}>
                                            <span className="cc-mono text-base shrink-0 w-8" style={{ color: isOpen ? 'var(--cc-brand-1)' : 'var(--cc-tx-3)' }}>{String(i + 1).padStart(2, '0')}</span>
                                            <span className="flex-1 text-lg font-medium tracking-tight" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>{f.q}</span>
                                            <span className="shrink-0" style={{ color: 'var(--cc-tx-2)', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 220ms ease-out' }}>
                                                <HugeiconsIcon icon={Add01Icon} size={20} />
                                            </span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"
                                                    style={{ borderLeft: '2px solid var(--cc-brand-1)', paddingLeft: '1.25rem' }}>
                                                    <p className="pb-6 pr-8 text-base" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6, marginLeft: '2.75rem' }}>{f.a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </Container>
        </Section>
    );
};
