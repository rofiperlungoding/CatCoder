import {
    CheckmarkCircle02Icon, ArrowRight01Icon, SparklesIcon, ShieldEnergyIcon, UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Surface, Button, Pill } from '../../components/ds';

const INCLUDED = [
    'Interactive lessons in Python, JavaScript, and C++',
    'Coding problems that run in your browser, no setup',
    'The Bug Arena: catch the bugs an AI writes, playable as a guest',
    'AI review and an Elo-style verification rating',
    'XP, levels, streaks, and the global leaderboard',
    'A skill profile that tracks your concepts and misconceptions',
];

const REASONS = [
    {
        icon: ShieldEnergyIcon,
        title: 'No payments, no catch',
        body: 'There is no paid tier, no credit card, and no trial timer. Every feature on the site is available to everyone.',
    },
    {
        icon: UserGroupIcon,
        title: 'No account needed to try',
        body: 'You can play a full round of the Bug Arena as a guest. Create a free account only when you want to save your rating and progress.',
    },
    {
        icon: SparklesIcon,
        title: 'Built to teach verification',
        body: 'CatCoder exists to train the skill of catching incorrect code. Keeping it free keeps that practice open to anyone learning to code.',
    },
];

export const PricingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cc-root pt-32 pb-24 px-4 sm:px-6">
            <div className="max-w-[1000px] mx-auto">
                {/* Hero */}
                <div className="text-center max-w-2xl mx-auto">
                    <Pill variant="brand" className="mb-5">Pricing</Pill>
                    <h1 className="cc-display text-4xl sm:text-5xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                        Free, for everyone.
                    </h1>
                    <p className="mt-5 text-lg" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                        CatCoder is completely free. There are no paid plans and nothing is locked behind a
                        subscription. Learn, practice, and play the Bug Arena at no cost.
                    </p>
                </div>

                {/* The single, honest plan */}
                <Surface elevation={3} glow className="mt-12 p-8 sm:p-10 max-w-xl mx-auto">
                    <div className="flex items-center justify-between">
                        <span className="cc-eyebrow">Everything, included</span>
                        <Pill variant="brand">Free forever</Pill>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="cc-mono text-5xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>$0</span>
                        <span className="text-sm" style={{ color: 'var(--cc-tx-3)' }}>/ forever</span>
                    </div>

                    <div className="cc-divider my-7" />

                    <ul className="space-y-3">
                        {INCLUDED.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                                <span style={{ color: 'var(--cc-brand-1)' }} className="mt-0.5 shrink-0">
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Button size="lg" fullWidth onClick={() => navigate('/arena')}>
                            Play the Bug Arena <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                        </Button>
                        <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/login')}>
                            Create a free account
                        </Button>
                    </div>
                    <p className="mt-4 text-center cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                        No credit card. No trial. Guest play needs no account.
                    </p>
                </Surface>

                {/* Why it is free */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {REASONS.map((r) => (
                        <Surface key={r.title} elevation={1} className="p-6">
                            <span className="cc-icon-well w-10 h-10 text-lime-300 inline-flex" aria-hidden="true">
                                <HugeiconsIcon icon={r.icon} size={20} strokeWidth={1.8} />
                            </span>
                            <h3 className="mt-4 text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>{r.title}</h3>
                            <p className="mt-2 text-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>{r.body}</p>
                        </Surface>
                    ))}
                </div>

                {/* FAQ nudge */}
                <div className="mt-16 text-center">
                    <p className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                        Still have questions about how it works?
                    </p>
                    <Button variant="ghost" size="md" className="mt-2" onClick={() => navigate('/faq')}>
                        Read the FAQ <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
