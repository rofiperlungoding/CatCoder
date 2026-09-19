import { ArrowDown01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Surface, Button, Pill } from '../../components/ds';

interface QA {
    q: string;
    a: string;
}

const FAQS: QA[] = [
    {
        q: 'What is CatCoder?',
        a: 'CatCoder is a place to learn and practice programming, plus the Bug Arena: a game where an AI writes confident but buggy code and you have to catch the defect. It scores verification, the skill of telling correct code from plausible but wrong code.',
    },
    {
        q: 'Is it really free?',
        a: 'Yes. CatCoder is completely free. There are no paid plans, no credit card, and no trial timer. Every feature is available to everyone.',
    },
    {
        q: 'Do I need an account?',
        a: 'No. You can play a full round of the Bug Arena as a guest. Create a free account only if you want to save your verification rating and track your progress over time.',
    },
    {
        q: 'How does the Bug Arena work?',
        a: 'The AI generates a short program that looks correct but contains one subtle bug. You write a hypothesis describing the defect and a small failing test. Your tests run locally in your browser for instant feedback, then the AI judges your hypothesis against the known answer and returns a verdict without revealing the bug if you are wrong.',
    },
    {
        q: 'Where does my code run?',
        a: 'Entirely in your browser. Python runs through Pyodide and JavaScript runs in a sandboxed worker. No code you write or run is sent to a server.',
    },
    {
        q: 'How is my verification rating calculated?',
        a: 'It is an Elo-style rating computed on the server from the AI judge verdict only. It never trusts results your browser reports, so the score reflects whether you actually identified the defect.',
    },
    {
        q: 'Which languages are supported?',
        a: 'Lessons and practice problems cover Python, JavaScript, and C++. The Bug Arena currently uses Python and JavaScript, which both run directly in the browser.',
    },
    {
        q: 'What data do you store?',
        a: 'For a signed-in player we store a handle, your attempts, and your rating. There is no advertising and no third-party tracking.',
    },
    {
        q: 'Who can use CatCoder?',
        a: 'Anyone aged 13 and up, in any modern browser. No installation is required.',
    },
];

const Item: React.FC<{ item: QA; open: boolean; onToggle: () => void }> = ({ item, open, onToggle }) => (
    <Surface elevation={1} className="overflow-hidden">
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
        >
            <span className="text-base font-semibold" style={{ color: 'var(--cc-tx-1)' }}>{item.q}</span>
            <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={18}
                style={{ color: 'var(--cc-tx-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease-out', flexShrink: 0 }}
            />
        </button>
        <div className="cc-collapsible" data-open={open}>
            <div className="cc-collapsible-inner">
                <p className="px-5 pb-5 text-sm" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.7 }}>{item.a}</p>
            </div>
        </div>
    </Surface>
);

export const FaqPage: React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState<number | null>(0);

    return (
        <div className="cc-root pt-32 pb-24 px-4 sm:px-6">
            <div className="max-w-[760px] mx-auto">
                <div className="text-center max-w-2xl mx-auto">
                    <Pill variant="brand" className="mb-5">FAQ</Pill>
                    <h1 className="cc-display text-4xl sm:text-5xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                        Questions, answered.
                    </h1>
                    <p className="mt-5 text-lg" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                        Everything about how CatCoder works, what it costs, and what happens to your data.
                    </p>
                </div>

                <div className="mt-12 flex flex-col gap-3">
                    {FAQS.map((item, i) => (
                        <Item key={item.q} item={item} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
                    ))}
                </div>

                <div className="mt-14 text-center">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>Ready to try it?</h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                        No account needed. Start a round in one click.
                    </p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" onClick={() => navigate('/arena')}>
                            Open the Bug Arena <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>
                            Contact us
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
