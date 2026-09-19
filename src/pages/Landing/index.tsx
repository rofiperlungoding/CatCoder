import { useReducedMotion } from 'framer-motion';
import React from 'react';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { TrustStrip } from './sections/TrustStrip';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Challenges } from './sections/Challenges';
import { Leaderboard } from './sections/Leaderboard';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';

export const LandingPage: React.FC = () => {
    const reduced = useReducedMotion();
    useSmoothScroll(!reduced);

    return (
        <div className="lp-root lp-grain selection:bg-lime-400/30 selection:text-white">
            <Nav />
            <main>
                <Hero />
                <TrustStrip />
                <Features />
                <HowItWorks />
                <Challenges />
                <Leaderboard />
                <Faq />
                <FinalCta />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
