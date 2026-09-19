import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagneticButton } from '../primitives';

const LINKS = [
    { label: 'Features', path: '/features' },
    { label: 'Bug Arena', path: '/arena' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'FAQ', path: '/faq' },
];

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34 };

const CatMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
            <linearGradient id="cc-nav-mark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#c8f56e" />
                <stop offset="1" stopColor="#a3e635" />
            </linearGradient>
        </defs>
        <path d="M6 11 L9 4 L14.5 9 Z" fill="url(#cc-nav-mark)" />
        <path d="M26 11 L23 4 L17.5 9 Z" fill="url(#cc-nav-mark)" />
        <rect x="5" y="8" width="22" height="18" rx="8" fill="url(#cc-nav-mark)" />
        <path d="M13.5 14.5 L11 17 L13.5 19.5" stroke="#14310a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 14.5 L21 17 L18.5 19.5" stroke="#14310a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="21.2" r="1.15" fill="#14310a" />
    </svg>
);

export const Nav: React.FC = () => {
    const navigate = useNavigate();
    const { scrollY, scrollYProgress } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const groupRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [rect, setRect] = useState<{ left: number; width: number } | null>(null);
    const prevHovered = useRef<number | null>(null);
    const blurX = useMotionValue(0);
    const std = useTransform(blurX, (v) => `${v} 0`);

    useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 16));

    useEffect(() => {
        if (hovered === null) { prevHovered.current = null; return; }
        const el = linkRefs.current[hovered];
        const parent = groupRef.current;
        if (el && parent) {
            const er = el.getBoundingClientRect();
            const pr = parent.getBoundingClientRect();
            setRect({ left: er.left - pr.left, width: er.width });
        }
        if (prevHovered.current !== null && prevHovered.current !== hovered) {
            blurX.set(7);
            animate(blurX, 0, { duration: 0.3, ease: [0.22, 1, 0.36, 1] });
        }
        prevHovered.current = hovered;
    }, [hovered, blurX]);

    return (
        <header className="fixed top-0 inset-x-0 z-50 pt-3 px-4 flex justify-center">
            <svg width="0" height="0" className="absolute" aria-hidden="true">
                <defs>
                    <filter id="nav-mblur" x="-75%" y="-300%" width="250%" height="700%" colorInterpolationFilters="sRGB">
                        <motion.feGaussianBlur in="SourceGraphic" stdDeviation={std} />
                    </filter>
                </defs>
            </svg>

            {/* Reading progress — thin line at the very top edge */}
            <motion.div
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60]"
                style={{ scaleX: scrollYProgress, background: 'linear-gradient(90deg, var(--cc-brand-2), var(--cc-brand-1))', opacity: scrolled ? 1 : 0.5 }}
            />

            <nav
                className="w-full max-w-4xl flex items-center gap-4 rounded-full pl-3 pr-2 h-14 transition-all duration-300"
                style={{
                    background: scrolled ? 'var(--lp-glass)' : 'rgba(20,23,26,0.35)',
                    backdropFilter: 'blur(18px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(140%)',
                    border: `1px solid ${scrolled ? 'var(--lp-border)' : 'transparent'}`,
                    boxShadow: scrolled ? 'inset 0 1px 0 rgba(255,255,255,.05), 0 10px 30px -12px rgba(0,0,0,.7)' : 'none',
                }}
            >
                <motion.button
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    transition={SPRING}
                    className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9fe65c]"
                    aria-label="CatCoder home"
                >
                    <CatMark />
                </motion.button>

                <div className="hidden md:flex flex-1 justify-center" onMouseLeave={() => setHovered(null)}>
                    <div ref={groupRef} className="relative flex items-center gap-0.5">
                        <AnimatePresence>
                            {hovered !== null && rect && (
                                <motion.span
                                    aria-hidden="true"
                                    className="absolute top-0 bottom-0 rounded-full pointer-events-none"
                                    style={{ background: 'rgba(255,255,255,0.06)', willChange: 'transform, filter, opacity' }}
                                    initial={{ opacity: 0, y: 9, left: rect.left, width: rect.width, filter: 'blur(9px)' }}
                                    animate={{ opacity: 1, y: 0, left: rect.left, width: rect.width, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: 9, filter: 'blur(7px)' }}
                                    transition={{
                                        left: SPRING,
                                        width: SPRING,
                                        y: { type: 'spring', stiffness: 500, damping: 30 },
                                        opacity: { duration: 0.22, ease: 'easeOut' },
                                        filter: { duration: 0.2, ease: 'easeOut' },
                                    }}
                                >
                                    <span className="absolute left-3.5 right-3.5 bottom-[3px] h-[2px]" style={{ filter: 'url(#nav-mblur)', willChange: 'filter' }}>
                                        <span className="block w-full h-full rounded-full" style={{ background: 'var(--cc-brand-1)', boxShadow: '0 0 6px rgba(190,242,100,.9), 0 0 16px rgba(190,242,100,.55), 0 0 28px rgba(163,230,53,.3)' }} />
                                    </span>
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {LINKS.map((l, i) => (
                            <button
                                key={l.label}
                                ref={(el) => { linkRefs.current[i] = el; }}
                                onClick={() => navigate(l.path)}
                                onMouseEnter={() => setHovered(i)}
                                onFocus={() => setHovered(i)}
                                className="relative z-10 px-3.5 py-1.5 text-sm rounded-full transition-colors duration-200 focus:outline-none"
                                style={{ color: hovered === i ? 'var(--cc-tx-1)' : 'var(--cc-tx-2)' }}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => navigate('/login')}
                        className="hidden md:inline-block text-sm px-3 py-1.5 rounded-full transition-colors focus:outline-none"
                        style={{ color: 'var(--cc-tx-2)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cc-tx-1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cc-tx-2)')}
                    >
                        Sign in
                    </button>
                    <div className="hidden md:block">
                        <MagneticButton onClick={() => navigate('/login')} ariaLabel="Start free">Start free</MagneticButton>
                    </div>
                    <button onClick={() => setOpen(true)} className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9fe65c]" style={{ color: 'var(--cc-tx-1)' }} aria-label="Open menu">
                        <HugeiconsIcon icon={Menu01Icon} size={22} />
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div className="fixed inset-0 z-50 md:hidden flex flex-col" style={{ background: 'var(--lp-bg)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-between h-[68px] px-5">
                            <CatMark size={26} />
                            <button onClick={() => setOpen(false)} className="w-11 h-11 inline-flex items-center justify-center rounded-full" style={{ color: 'var(--cc-tx-1)' }} aria-label="Close menu">
                                <HugeiconsIcon icon={Cancel01Icon} size={22} />
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-1 px-6">
                            {LINKS.map((l, i) => (
                                <motion.button key={l.label} onClick={() => { setOpen(false); navigate(l.path); }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}
                                    className="text-left text-3xl font-semibold tracking-tight py-3" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>
                                    {l.label}
                                </motion.button>
                            ))}
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <button onClick={() => { setOpen(false); navigate('/login'); }} className="text-center text-sm py-2" style={{ color: 'var(--cc-tx-2)' }}>Sign in</button>
                            <MagneticButton onClick={() => { setOpen(false); navigate('/login'); }} size="lg" arrow className="w-full">Start free</MagneticButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
