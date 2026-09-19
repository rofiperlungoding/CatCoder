import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useSpotlight, useTilt } from './hooks';

export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...rest }) => (
    <div className={`w-full max-w-[1200px] mx-auto px-5 sm:px-8 ${className}`} {...rest}>
        {children}
    </div>
);

export const FigLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`lp-fig ${className}`}>{children}</span>
);

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    eyebrow?: string;
}

export const Section: React.FC<SectionProps> = ({ eyebrow, className = '', children, ...rest }) => (
    <section className={`relative ${className}`} {...rest}>
        {eyebrow && <span className="lp-fig block mb-4">{eyebrow}</span>}
        {children}
    </section>
);

interface RevealProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    as?: 'div' | 'li' | 'span';
}

export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '', as = 'div' }) => {
    const reduced = useReducedMotion();
    const MotionTag = motion[as];
    return (
        <MotionTag
            className={className}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </MotionTag>
    );
};

interface MarqueeProps {
    items: React.ReactNode[];
    duration?: number;
    className?: string;
    sep?: React.ReactNode;
}

export const Marquee: React.FC<MarqueeProps> = ({ items, duration = 44, className = '', sep }) => (
    <div className={`lp-marquee overflow-hidden ${className}`} aria-hidden="true">
        <div className="lp-marquee-track" style={{ ['--lp-marquee-dur' as string]: `${duration}s` }}>
            {[0, 1].map((dup) => (
                <span key={dup} className="inline-flex items-center">
                    {items.map((item, i) => (
                        <span key={i} className="inline-flex items-center">
                            <span className="px-8">{item}</span>
                            {sep ?? <span style={{ color: 'var(--lp-border-loud)' }}>·</span>}
                        </span>
                    ))}
                </span>
            ))}
        </div>
    </div>
);

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const Counter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const reduced = useReducedMotion();
    const [n, setN] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduced) { setN(value); return; }
        let raf = 0;
        const start = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setN(Math.floor(easeOut(p) * value));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, value, reduced]);

    return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
};

const DIFFICULTY_COLOR: Record<string, string> = {
    Easy: 'var(--cc-brand-1)',
    Medium: '#e0b341',
    Hard: '#ff6b6b',
};

export const Tag: React.FC<{ difficulty: 'Easy' | 'Medium' | 'Hard' }> = ({ difficulty }) => (
    <span className="cc-mono text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ color: DIFFICULTY_COLOR[difficulty], background: 'var(--lp-sunken)', border: `1px solid ${DIFFICULTY_COLOR[difficulty]}2e` }}>
        {difficulty}
    </span>
);

export const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="cc-mono text-[11px] px-2 py-0.5 rounded-md" style={{ color: 'var(--cc-tx-2)', background: 'var(--lp-sunken)', border: '1px solid var(--lp-border)' }}>
        {children}
    </span>
);

interface MagneticButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'ghost';
    size?: 'md' | 'lg';
    arrow?: boolean;
    className?: string;
    ariaLabel?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, onClick, variant = 'primary', size = 'md', arrow = false, className = '', ariaLabel }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const reduced = useReducedMotion();
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 200, damping: 18 });
    const y = useSpring(my, { stiffness: 200, damping: 18 });

    const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        my.set((e.clientY - (r.top + r.height / 2)) * 0.25);
    };
    const reset = () => { mx.set(0); my.set(0); };

    const sizing = size === 'lg' ? 'h-11 px-6 text-base' : 'h-10 px-5 text-sm';
    const variantClass = variant === 'primary' ? 'cc-btn-primary' : 'cc-btn-secondary';

    return (
        <motion.button
            ref={ref}
            type="button"
            onClick={onClick}
            onMouseMove={onMove}
            onMouseLeave={reset}
            style={{ x, y }}
            aria-label={ariaLabel}
            className={`cc-btn ${variantClass} ${sizing} ${className}`}
        >
            {children}
            {arrow && <HugeiconsIcon icon={ArrowRight01Icon} size={size === 'lg' ? 18 : 16} />}
        </motion.button>
    );
};

interface ProductPanelProps {
    children: React.ReactNode;
    filename?: string;
    elevation?: 'e1' | 'e2' | 'e3';
    tilt?: boolean;
    restX?: number;
    restY?: number;
    live?: boolean;
    className?: string;
}

export const ProductPanel: React.FC<ProductPanelProps> = ({ children, filename, elevation = 'e2', tilt = false, restX = 0, restY = 0, live = false, className = '' }) => {
    const { onMove, onLeave, style } = useTilt({ max: 7, restX, restY });
    const { onMove: spot } = useSpotlight();

    return (
        <div className={tilt ? 'lp-stage' : ''}>
            <motion.div
                onPointerMove={tilt ? (e) => { onMove(e); spot(e); } : spot}
                onPointerLeave={tilt ? onLeave : undefined}
                style={tilt ? style : undefined}
                className={`lp-spot lp-${elevation} rounded-2xl overflow-hidden ${className}`}
            >
                {filename && (
                    <div className="flex items-center gap-2 px-4 h-10 relative z-10" style={{ borderBottom: '1px solid var(--lp-border)' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f46' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f46' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f46' }} />
                        <span className="ml-2 cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>{filename}</span>
                        {live && (
                            <span className="ml-auto inline-flex items-center gap-1.5 cc-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--cc-brand-1)' }}>
                                <span className="lp-live-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cc-brand-1)' }} /> live
                            </span>
                        )}
                    </div>
                )}
                <div className="relative z-10">{children}</div>
            </motion.div>
        </div>
    );
};

export const CodeWindow = ProductPanel;
