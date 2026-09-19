import {
    ComputerTerminal01Icon, CheckmarkCircle02Icon, BugIcon, SparklesIcon,
    Trophy, BookOpen01Icon, Target01Icon, ArrowRight01Icon, ShieldEnergyIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Surface, Button, Pill } from '../../components/ds';

const FEATURES = [
    {
        icon: ComputerTerminal01Icon,
        title: 'Runs in your browser',
        body: 'Write and run Python and JavaScript with no setup. Python runs through Pyodide and JavaScript runs in a sandboxed worker, so nothing executes on a server.',
    },
    {
        icon: CheckmarkCircle02Icon,
        title: 'Instant local feedback',
        body: 'Your tests run the moment you hit run, right on your machine. You see pass and fail results immediately while you work through a problem.',
    },
    {
        icon: SparklesIcon,
        title: 'AI review you can trust',
        body: 'The AI judges your reasoning against the known answer and explains what you missed. It never reveals the defect when you are wrong, it nudges you.',
    },
    {
        icon: Trophy,
        title: 'XP, levels, and leagues',
        body: 'Every solve feeds your XP, your streak, and your place on the global leaderboard, from Bronze all the way to Diamond.',
    },
    {
        icon: BookOpen01Icon,
        title: 'Structured lessons',
        body: 'Interactive lessons in Python, JavaScript, and C++ take you from syntax and control flow to the core data structures, one step at a time.',
    },
    {
        icon: Target01Icon,
        title: 'A skill profile',
        body: 'CatCoder tags every attempt with a concept and a misconception, then shows your strongest and weakest areas so you know what to practice next.',
    },
];

export const FeaturesPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cc-root pt-32 pb-24 px-4 sm:px-6">
            <div className="max-w-[1100px] mx-auto">
                {/* Hero */}
                <div className="text-center max-w-2xl mx-auto">
                    <Pill variant="brand" className="mb-5">Features</Pill>
                    <h1 className="cc-display text-4xl sm:text-5xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                        Everything you need to verify code.
                    </h1>
                    <p className="mt-5 text-lg" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                        Learn the language, practice in a real runtime, then prove you can catch the AI when it
                        writes code that only looks right.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((f) => (
                        <Surface key={f.title} elevation={1} className="p-6">
                            <span className="cc-icon-well w-11 h-11 text-lime-300 inline-flex" aria-hidden="true">
                                <HugeiconsIcon icon={f.icon} size={20} strokeWidth={1.7} />
                            </span>
                            <h3 className="mt-4 text-lg font-bold" style={{ color: 'var(--cc-tx-1)' }}>{f.title}</h3>
                            <p className="mt-2 text-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>{f.body}</p>
                        </Surface>
                    ))}
                </div>

                {/* Bug Arena highlight */}
                <Surface elevation={3} glow className="mt-8 p-8 sm:p-12 overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-start gap-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="cc-icon-well w-10 h-10 text-lime-300 inline-flex" aria-hidden="true">
                                    <HugeiconsIcon icon={BugIcon} size={20} />
                                </span>
                                <span className="cc-eyebrow">The Bug Arena</span>
                            </div>
                            <h2 className="cc-display text-2xl sm:text-3xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                                Catch the AI when it writes code wrong.
                            </h2>
                            <p className="mt-4 text-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.7 }}>
                                The AI ships confident but buggy code. You write a hypothesis about the defect and a
                                minimal failing test, run it in the browser, and the judge scores your verification
                                with an Elo-style rating. It is the one skill an AI cannot do for you.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button size="lg" onClick={() => navigate('/arena')}>
                                    Try it free <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                                </Button>
                                <Button variant="secondary" size="lg" onClick={() => navigate('/faq')}>
                                    How it works
                                </Button>
                            </div>
                        </div>
                        <div className="w-full lg:w-80 shrink-0">
                            <div className="rounded-xl p-5 cc-mono text-[13px] leading-relaxed" style={{ background: 'var(--cc-surface-1)', boxShadow: 'var(--cc-well)' }}>
                                <div style={{ color: 'var(--cc-tx-3)' }}>$ run failing test</div>
                                <div className="mt-2" style={{ color: 'var(--cc-wa)' }}>x is_prime(1) returned true</div>
                                <div style={{ color: 'var(--cc-ac)' }}>+ expected false</div>
                                <div className="mt-3 flex items-center gap-2" style={{ color: 'var(--cc-brand-1)' }}>
                                    <HugeiconsIcon icon={ShieldEnergyIcon} size={14} /> verified: off-by-one boundary
                                </div>
                            </div>
                        </div>
                    </div>
                </Surface>

                {/* Closing CTA */}
                <div className="mt-16 text-center">
                    <h2 className="cc-display text-2xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>Start in one click.</h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--cc-tx-2)' }}>Free, runs in any browser, no account needed to try.</p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" onClick={() => navigate('/learn')}>Start learning</Button>
                        <Button variant="secondary" size="lg" onClick={() => navigate('/arena')}>Open the Bug Arena</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
