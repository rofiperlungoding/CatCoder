import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const duration = 500; // ms - "gercep" but smooth
        const start = window.scrollY;
        const startTime = performance.now();

        if (start === 0) return;

        const easeOutQuart = (t: number) => 1 - (--t) * t * t * t;

        const animateScroll = (currentTime: number) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeOutQuart(progress);

            window.scrollTo(0, start * (1 - ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }, [pathname]);

    return null;
};
