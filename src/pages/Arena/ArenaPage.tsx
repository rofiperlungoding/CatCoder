import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { CodeEditor } from '../../components/editor';
import { Surface, Button, Pill } from '../../components/ds';
import { Turnstile } from '../../components/Turnstile';
import { Leaderboard } from '../../components/arena/Leaderboard';
import { useArenaStore } from '../../stores/arena';
import { isSignedIn } from '../../lib/api';

function ArenaHeader() {
    const navigate = useNavigate();
    const signedIn = isSignedIn();

    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(signedIn ? '/home' : '/');
        }
    };

    return (
        <header
            className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6"
            style={{
                background: 'color-mix(in srgb, var(--cc-bg) 80%, transparent)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--cc-border)',
            }}
        >
            <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                style={{ color: 'var(--cc-tx-2)' }}
                aria-label="Go back"
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                Back
            </button>
            <Link
                to={signedIn ? '/home' : '/'}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                aria-label="CatCoder home"
            >
                <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
                <span className="cc-display text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                    CatCoder
                </span>
            </Link>
        </header>
    );
}

function HeroState({ onStart, loading }: { onStart: () => void; loading: boolean }) {
    return (
        <motion.div
            key="hero"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center"
        >
            <Pill variant="brand" className="mb-6">
                Bug Arena
            </Pill>
            <h1 className="cc-display text-4xl font-bold sm:text-5xl" style={{ color: 'var(--cc-tx-1)' }}>
                Catch the AI when it writes code wrong
            </h1>
            <p className="mt-5 max-w-xl text-base" style={{ color: 'var(--cc-tx-2)' }}>
                The AI ships confident but buggy code. Write a hypothesis and a failing test, then let
                the judge score your verification. No account needed to play.
            </p>
            <div className="mt-9">
                <Button size="lg" onClick={onStart} disabled={loading}>
                    {loading ? 'Loading a problem...' : 'Start a round'}
                </Button>
            </div>
            <p className="cc-eyebrow mt-6">Free to try. One click to begin.</p>

            <div className="mt-14 w-full max-w-md text-left">
                <Leaderboard />
            </div>
        </motion.div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center"
        >
            <Surface elevation={2} className="w-full p-8">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--cc-wa)' }}>
                    Something went wrong
                </h2>
                <p className="mt-3 text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                    {message}
                </p>
                <div className="mt-6">
                    <Button variant="secondary" onClick={onRetry}>
                        Try again
                    </Button>
                </div>
            </Surface>
        </motion.div>
    );
}

function LoadingState() {
    return (
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-2">
            <div className="cc-skeleton h-[420px] rounded-2xl" />
            <div className="flex flex-col gap-6">
                <div className="cc-skeleton h-48 rounded-2xl" />
                <div className="cc-skeleton h-32 rounded-2xl" />
                <div className="cc-skeleton h-12 rounded-2xl" />
            </div>
        </div>
    );
}

function ProblemPanel() {
    const variant = useArenaStore((s) => s.currentVariant);
    if (!variant) return null;
    return (
        <Surface elevation={2} className="flex h-full flex-col p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Pill variant="brand">{variant.language}</Pill>
                <Pill>Difficulty {variant.difficulty}</Pill>
                <span className="cc-eyebrow ml-auto">Buggy code</span>
            </div>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--cc-tx-2)' }}>
                {variant.prompt}
            </p>
            <div className="min-h-[320px] flex-1">
                <CodeEditor
                    value={variant.code}
                    onChange={() => undefined}
                    language={variant.language === 'python' ? 'python' : 'javascript'}
                    readOnly
                />
            </div>
        </Surface>
    );
}

function TestsPanel() {
    const tests = useArenaStore((s) => s.tests);
    const localResults = useArenaStore((s) => s.localResults);
    const runningTests = useArenaStore((s) => s.runningTests);
    const addTest = useArenaStore((s) => s.addTest);
    const updateTest = useArenaStore((s) => s.updateTest);
    const removeTest = useArenaStore((s) => s.removeTest);
    const runTests = useArenaStore((s) => s.runTests);

    return (
        <Surface elevation={2} className="p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>
                    Failing tests
                </h3>
                <span className="cc-eyebrow">Local check only</span>
            </div>
            <p className="mb-4 text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                Input is a JSON array of arguments, expected is the JSON result. Example input [2, 3]
                expected 5.
            </p>

            <div className="flex flex-col gap-2">
                {tests.map((test, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            className="cc-search cc-mono flex-1"
                            aria-label={`Test ${i + 1} input`}
                            placeholder="input e.g. [2]"
                            value={test.input}
                            onChange={(e) => updateTest(i, { input: e.target.value })}
                        />
                        <input
                            className="cc-search cc-mono flex-1"
                            aria-label={`Test ${i + 1} expected`}
                            placeholder="expected e.g. true"
                            value={test.expected}
                            onChange={(e) => updateTest(i, { expected: e.target.value })}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            aria-label={`Remove test ${i + 1}`}
                            onClick={() => removeTest(i)}
                        >
                            x
                        </Button>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={addTest}>
                    Add test
                </Button>
                <Button size="sm" onClick={runTests} disabled={runningTests}>
                    {runningTests ? 'Running...' : 'Run tests'}
                </Button>
            </div>

            <AnimatePresence>
                {localResults && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 overflow-hidden"
                    >
                        <div className="cc-divider mb-3" />
                        <div className="flex flex-col gap-2">
                            {localResults.map((r, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg px-3 py-2"
                                    style={{ background: 'var(--cc-surface-1)' }}
                                >
                                    <code className="cc-mono truncate text-xs" style={{ color: 'var(--cc-tx-2)' }}>
                                        {r.input || '(empty)'} {'->'} {r.actual}
                                    </code>
                                    <Pill variant={r.passed ? 'default' : 'brand'}>
                                        <span style={{ color: r.passed ? 'var(--cc-ac)' : 'var(--cc-wa)' }}>
                                            {r.passed ? 'pass' : 'fail'}
                                        </span>
                                    </Pill>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                            A failing test that exposes the bug is good evidence. Your score comes from
                            the judge, not from this local run.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </Surface>
    );
}

function HypothesisPanel() {
    const hypothesis = useArenaStore((s) => s.hypothesis);
    const setHypothesis = useArenaStore((s) => s.setHypothesis);
    return (
        <Surface elevation={2} className="p-5">
            <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>
                Your hypothesis
            </h3>
            <textarea
                className="cc-mono w-full resize-none rounded-xl p-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                aria-label="Defect hypothesis"
                style={{
                    background: 'var(--cc-surface-1)',
                    color: 'var(--cc-tx-1)',
                    boxShadow: 'var(--cc-well)',
                    minHeight: '120px',
                }}
                placeholder="Describe the defect: what is wrong, where, and why it produces the wrong result."
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
            />
        </Surface>
    );
}

function SubmitPanel() {
    const submit = useArenaStore((s) => s.submit);
    const submitting = useArenaStore((s) => s.submitting);
    const token = useArenaStore((s) => s.turnstileToken);
    return (
        <Surface elevation={2} className="p-5">
            <div className="flex flex-col gap-4">
                <Turnstile />
                <Button
                    size="lg"
                    fullWidth
                    disabled={submitting || !token}
                    onClick={() => submit()}
                >
                    {submitting ? 'Judging your hypothesis...' : 'Submit to the judge'}
                </Button>
            </div>
        </Surface>
    );
}

function VerdictPanel({ onNext }: { onNext: () => void }) {
    const verdict = useArenaStore((s) => s.verdict);
    const reset = useArenaStore((s) => s.reset);
    const signedIn = isSignedIn();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        panelRef.current?.focus();
    }, []);

    if (!verdict) return null;

    const percent = Math.round(verdict.correctness * 100);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verdict-title"
            onKeyDown={(e) => {
                if (e.key === 'Escape') onNext();
            }}
        >
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.6)' }}
                onClick={onNext}
                aria-hidden="true"
            />
            <motion.div
                ref={panelRef}
                tabIndex={-1}
                className="cc-pop-panel relative w-full max-w-md focus:outline-none"
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.34, 1.4, 0.5, 1] }}
            >
                <Surface elevation={3} glow className="p-7 text-center">
                    <Pill variant="brand" className="mb-4">
                        {verdict.correct ? 'Verified' : 'Not quite'}
                    </Pill>
                    <h2
                        id="verdict-title"
                        className="cc-display text-2xl font-bold"
                        style={{ color: 'var(--cc-tx-1)' }}
                    >
                        {verdict.correct ? 'You caught the bug' : 'Keep hunting'}
                    </h2>

                    <div className="my-5 flex items-center justify-center gap-6">
                        <div>
                            <div className="cc-eyebrow">Correctness</div>
                            <div className="cc-mono text-3xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                                {percent}%
                            </div>
                        </div>
                        {signedIn && verdict.verificationRating !== null && (
                            <div>
                                <div className="cc-eyebrow">Rating</div>
                                <div
                                    className="cc-mono text-3xl font-bold"
                                    style={{ color: 'var(--cc-brand-1)' }}
                                >
                                    {verdict.verificationRating}
                                </div>
                                <AnimatePresence>
                                    {verdict.delta !== 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="cc-mono text-sm font-semibold"
                                            style={{
                                                color: verdict.delta > 0 ? 'var(--cc-ac)' : 'var(--cc-wa)',
                                            }}
                                        >
                                            {verdict.delta > 0 ? `+${verdict.delta}` : verdict.delta}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cc-tx-2)' }}>
                        {verdict.feedback}
                    </p>

                    {!verdict.correct && verdict.misconceptionTag && (
                        <div className="mt-4">
                            <Pill>Misconception: {verdict.misconceptionTag}</Pill>
                        </div>
                    )}

                    {!signedIn && (
                        <div
                            className="mt-6 rounded-xl p-4 text-left"
                            style={{ background: 'var(--cc-surface-1)', boxShadow: 'var(--cc-well)' }}
                        >
                            <p className="text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>
                                Save your rating
                            </p>
                            <p className="mt-1 text-xs" style={{ color: 'var(--cc-tx-3)' }}>
                                Create a free account to track your verification rating over time.
                            </p>
                            <Link to="/login" className="mt-3 inline-block">
                                <Button variant="secondary" size="sm">
                                    Sign up to save progress
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="mt-7 flex justify-center gap-3">
                        <Button variant="ghost" onClick={reset}>
                            Exit
                        </Button>
                        <Button onClick={onNext}>Next problem</Button>
                    </div>
                </Surface>
            </motion.div>
        </motion.div>
    );
}

function PlayingState() {
    const error = useArenaStore((s) => s.error);
    const rating = useArenaStore((s) => s.rating);
    const verdict = useArenaStore((s) => s.verdict);
    const loadProblem = useArenaStore((s) => s.loadProblem);

    return (
        <motion.div
            key="playing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl px-4 py-8"
        >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <span className="cc-eyebrow">Bug Arena</span>
                    <h1 className="cc-display text-2xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                        Find the defect
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {isSignedIn() ? (
                        <Pill variant="brand">
                            Rating {rating !== null ? rating : 'unrated'}
                        </Pill>
                    ) : (
                        <Pill>Guest</Pill>
                    )}
                    <Button variant="secondary" size="sm" onClick={loadProblem}>
                        New problem
                    </Button>
                </div>
            </div>

            {error && (
                <div
                    className="mb-4 rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(251,113,133,0.12)', color: 'var(--cc-wa)' }}
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <ProblemPanel />
                <div className="flex flex-col gap-6">
                    <TestsPanel />
                    <HypothesisPanel />
                    <SubmitPanel />
                </div>
            </div>

            <AnimatePresence>{verdict && <VerdictPanel onNext={loadProblem} />}</AnimatePresence>
        </motion.div>
    );
}

export function ArenaPage() {
    const currentVariant = useArenaStore((s) => s.currentVariant);
    const loadingProblem = useArenaStore((s) => s.loadingProblem);
    const error = useArenaStore((s) => s.error);
    const loadProblem = useArenaStore((s) => s.loadProblem);

    useEffect(() => {
        return () => useArenaStore.getState().reset();
    }, []);

    let content;
    if (currentVariant) {
        content = <PlayingState />;
    } else if (loadingProblem) {
        content = <LoadingState />;
    } else if (error) {
        content = <ErrorState message={error} onRetry={loadProblem} />;
    } else {
        content = <HeroState onStart={loadProblem} loading={loadingProblem} />;
    }

    return (
        <div className="cc-root min-h-screen" style={{ background: 'var(--cc-bg)' }}>
            <ArenaHeader />
            <AnimatePresence mode="wait">{content}</AnimatePresence>
        </div>
    );
}

export default ArenaPage;
