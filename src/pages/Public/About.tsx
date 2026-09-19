import { Target01Icon, ShieldEnergyIcon, Globe, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Surface, Button, Pill } from '../../components/ds';

const VALUES = [
    {
        icon: Target01Icon,
        title: 'Verification first',
        body: 'Anyone can accept code that looks right. CatCoder trains the harder skill: proving whether code is actually correct.',
    },
    {
        icon: ShieldEnergyIcon,
        title: 'Keep a human in the loop',
        body: 'As AI writes more code, the risk is becoming a passive accepter. We practice the critical review that keeps people in control.',
    },
    {
        icon: Globe,
        title: 'Open to anyone',
        body: 'Free, in any modern browser, with a guest path that needs no account. Open to anyone aged 13 and up.',
    },
];

export const AboutPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cc-root pt-32 pb-24 px-4 sm:px-6">
            <div className="max-w-[900px] mx-auto">
                {/* Hero */}
                <div className="text-center max-w-2xl mx-auto">
                    <Pill variant="brand" className="mb-5">About</Pill>
                    <h1 className="cc-display text-4xl sm:text-5xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                        Training the skill the AI cannot replace.
                    </h1>
                    <p className="mt-5 text-lg" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                        CatCoder taught people to write code. The Bug Arena tests whether you can catch the AI when
                        it writes it wrong.
                    </p>
                </div>

                {/* Why it matters */}
                <Surface elevation={2} className="mt-12 p-8 sm:p-10">
                    <span className="cc-eyebrow">Why it matters</span>
                    <p className="mt-4 text-base" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.7 }}>
                        As AI writes more of our code, learners risk becoming passive accepters who cannot tell
                        correct code from plausible but wrong code. That leads to skill atrophy, unsafe software, and
                        a widening gap between people who can audit AI and people who blindly trust it. CatCoder
                        trains critical verification, and it teaches as it tests through misconception feedback.
                    </p>
                </Surface>

                {/* Values */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {VALUES.map((v) => (
                        <Surface key={v.title} elevation={1} className="p-6">
                            <span className="cc-icon-well w-10 h-10 text-lime-300 inline-flex" aria-hidden="true">
                                <HugeiconsIcon icon={v.icon} size={20} strokeWidth={1.8} />
                            </span>
                            <h3 className="mt-4 text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>{v.title}</h3>
                            <p className="mt-2 text-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>{v.body}</p>
                        </Surface>
                    ))}
                </div>

                {/* How it works, briefly */}
                <Surface elevation={2} className="mt-8 p-8 sm:p-10">
                    <span className="cc-eyebrow">How it works</span>
                    <p className="mt-4 text-base" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.7 }}>
                        An AI generates confident but buggy code. You write a hypothesis about the defect plus a
                        minimal failing test, and the browser runs those tests locally for instant feedback. The AI
                        then judges your hypothesis against the stored answer and returns a verdict without revealing
                        the bug. A server-side, Elo-style verification rating moves with each result, and every
                        attempt is tagged with a concept and a misconception that feed your skill profile.
                    </p>
                </Surface>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <h2 className="cc-display text-2xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>See it for yourself.</h2>
                    <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" onClick={() => navigate('/arena')}>
                            Play the Bug Arena <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => navigate('/features')}>
                            Explore features
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
