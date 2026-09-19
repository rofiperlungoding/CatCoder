import { useReducedMotion, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useCallback } from 'react';

interface TiltOptions {
    max?: number;
    restX?: number;
    restY?: number;
}

interface TiltResult {
    onMove: (e: React.PointerEvent<HTMLElement>) => void;
    onLeave: () => void;
    style: { rotateX: MotionValue<number>; rotateY: MotionValue<number>; transformPerspective: number };
    reduced: boolean;
}

export function useTilt({ max = 7, restX = 0, restY = 0 }: TiltOptions = {}): TiltResult {
    const reduced = useReducedMotion() ?? false;
    const rx = useMotionValue(reduced ? 0 : restX);
    const ry = useMotionValue(reduced ? 0 : restY);
    const srx = useSpring(rx, { stiffness: 140, damping: 18, mass: 0.4 });
    const sry = useSpring(ry, { stiffness: 140, damping: 18, mass: 0.4 });

    const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (reduced || e.pointerType === 'touch') return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx.set(restX - py * max);
        ry.set(restY + px * max);
    }, [reduced, max, restX, restY, rx, ry]);

    const onLeave = useCallback(() => {
        rx.set(reduced ? 0 : restX);
        ry.set(reduced ? 0 : restY);
    }, [reduced, restX, restY, rx, ry]);

    return { onMove, onLeave, style: { rotateX: srx, rotateY: sry, transformPerspective: 1200 }, reduced };
}

export function useSpotlight(): { onMove: (e: React.PointerEvent<HTMLElement>) => void } {
    const reduced = useReducedMotion() ?? false;
    const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (reduced) return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, [reduced]);
    return { onMove };
}
