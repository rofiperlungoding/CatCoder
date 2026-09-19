import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

/**
 * Window-level smooth (inertial) scrolling via Lenis, shared by the marketing
 * homepage and the authenticated app shell. Lenis drives its own rAF loop
 * (`autoRaf`) so it is immune to React StrictMode double-mount tearing down a
 * hand-rolled loop. `lerp` gives the eased, glide-to-a-stop feel.
 *
 * Disabled when `enabled` is false (focus-mode editor routes own their inner
 * scroll) and when the user prefers reduced motion. On route change it snaps to
 * the top instantly so the global ScrollToTop reset never fights the smoothing.
 */
export function useSmoothScroll(enabled = true): void {
    const { pathname } = useLocation();
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            lerp: 0.09,
            smoothWheel: true,
            wheelMultiplier: 1,
            autoRaf: true,
        });
        lenisRef.current = lenis;

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [enabled]);

    useEffect(() => {
        lenisRef.current?.scrollTo(0, { immediate: true });
    }, [pathname]);
}

export default useSmoothScroll;
