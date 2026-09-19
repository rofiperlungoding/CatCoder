import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Progress } from '../ds';
import { getSkill, type SkillProfile } from '../../lib/api';

function ConceptList({
    title,
    items,
}: {
    title: string;
    items: SkillProfile['concepts'];
}) {
    return (
        <div>
            <span className="cc-eyebrow">{title}</span>
            <div className="mt-3 flex flex-col gap-3">
                {items.length === 0 && (
                    <p className="text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                        Not enough data yet.
                    </p>
                )}
                {items.map((c) => {
                    const pct = Math.round(c.accuracy * 100);
                    return (
                        <div key={c.concept}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="truncate text-sm" style={{ color: 'var(--cc-tx-1)' }}>
                                    {c.concept}
                                </span>
                                <span className="cc-mono text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                                    {pct}% · {c.correct}/{c.total}
                                </span>
                            </div>
                            <Progress value={pct} className="h-1.5" aria-label={`${c.concept} ${pct}%`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function VerificationSection() {
    const [skill, setSkill] = useState<SkillProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getSkill()
            .then((data) => {
                if (!cancelled) {
                    setSkill(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError((err as Error).message);
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="cc-glass p-6 md:p-7" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                <div className="cc-skeleton h-24 rounded-2xl" />
            </div>
        );
    }

    if (error || !skill) {
        return (
            <div className="cc-glass p-6 md:p-7" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                <h2 className="text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                    Verification
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--cc-tx-3)' }}>
                    {error ?? 'Play a round in the Bug Arena to build your skill profile.'}
                </p>
                <Link to="/arena" className="mt-4 inline-block">
                    <Button size="md">Open the Bug Arena</Button>
                </Link>
            </div>
        );
    }

    const strongest = [...skill.concepts].sort((a, b) => b.accuracy - a.accuracy).slice(0, 4);
    const weakest = [...skill.concepts].sort((a, b) => a.accuracy - b.accuracy).slice(0, 4);

    return (
        <div className="cc-glass p-6 md:p-7" style={{ borderRadius: 'var(--cc-r-lg)' }}>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="cc-eyebrow">Verification rating</span>
                    <div
                        className="cc-mono text-5xl font-bold leading-none"
                        style={{ color: 'var(--cc-brand-1)' }}
                    >
                        {skill.rating}
                    </div>
                </div>
                <div className="text-right">
                    <span className="cc-eyebrow">Attempts</span>
                    <div className="cc-mono text-2xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                        {skill.attempts}
                    </div>
                </div>
            </div>

            {skill.attempts === 0 ? (
                <p className="mt-5 text-sm" style={{ color: 'var(--cc-tx-3)' }}>
                    No attempts yet. Catch a few bugs to map your strengths and misconceptions.
                </p>
            ) : (
                <>
                    <div className="cc-divider my-6" />
                    <div className="grid gap-6 sm:grid-cols-2">
                        <ConceptList title="Strongest concepts" items={strongest} />
                        <ConceptList title="Weakest concepts" items={weakest} />
                    </div>

                    {skill.misconceptions.length > 0 && (
                        <>
                            <div className="cc-divider my-6" />
                            <span className="cc-eyebrow">Recurring misconceptions</span>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {skill.misconceptions.map((m) => (
                                    <span key={m.misconception} className="cc-pill">
                                        {m.misconception}
                                        <span className="cc-mono" style={{ color: 'var(--cc-tx-3)' }}>
                                            x{m.count}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default VerificationSection;
