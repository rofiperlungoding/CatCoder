/**
 * Reactively report the user's `prefers-reduced-motion` setting.
 *
 * Blocks and shell components read this to drop animated reveals/celebrations
 * and render instant states instead (Requirement 15.4). The design system's CSS
 * already neutralizes its own motion utilities under the matching media query;
 * this hook lets JS-driven animations (e.g. line-by-line walkthrough play, the
 * Predict→Reveal animation) honor the same preference.
 */
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState<boolean>(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia(QUERY).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mql = window.matchMedia(QUERY);
        const onChange = () => setReduced(mql.matches);
        mql.addEventListener?.('change', onChange);
        return () => mql.removeEventListener?.('change', onChange);
    }, []);

    return reduced;
}

export default useReducedMotion;
