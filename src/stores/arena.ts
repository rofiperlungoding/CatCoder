import { create } from 'zustand';
import {
    getProblem,
    submitJudge,
    isSignedIn,
    type ArenaProblem,
    type JudgeVerdict,
    type TestCase,
} from '../lib/api';
import { runPlayerTests, type TestRunResult } from '../lib/runner';

interface ArenaState {
    currentVariant: ArenaProblem | null;
    tests: TestCase[];
    hypothesis: string;
    localResults: TestRunResult[] | null;
    verdict: JudgeVerdict | null;
    rating: number | null;

    loadingProblem: boolean;
    runningTests: boolean;
    submitting: boolean;
    error: string | null;

    turnstileToken: string | null;
    turnstileNonce: number;

    loadProblem: () => Promise<void>;
    runTests: () => Promise<void>;
    submit: () => Promise<void>;
    setHypothesis: (value: string) => void;
    setTurnstileToken: (token: string | null) => void;
    addTest: () => void;
    updateTest: (index: number, patch: Partial<TestCase>) => void;
    removeTest: (index: number) => void;
    reset: () => void;
}

const emptyTest = (): TestCase => ({ input: '', expected: '' });

export const useArenaStore = create<ArenaState>((set, get) => ({
    currentVariant: null,
    tests: [emptyTest()],
    hypothesis: '',
    localResults: null,
    verdict: null,
    rating: null,

    loadingProblem: false,
    runningTests: false,
    submitting: false,
    error: null,

    turnstileToken: null,
    turnstileNonce: 0,

    loadProblem: async () => {
        set({ loadingProblem: true, error: null });
        try {
            const problem = await getProblem();
            set({
                currentVariant: problem,
                tests: [emptyTest()],
                hypothesis: '',
                localResults: null,
                verdict: null,
                loadingProblem: false,
            });
        } catch (err) {
            set({ loadingProblem: false, error: (err as Error).message });
        }
    },

    runTests: async () => {
        const { currentVariant, tests } = get();
        if (!currentVariant) return;
        const runnable = tests.filter((t) => t.input.trim() !== '' || t.expected.trim() !== '');
        if (runnable.length === 0) {
            set({ error: 'Add at least one test with an input and an expected value.' });
            return;
        }
        set({ runningTests: true, error: null });
        try {
            const results = await runPlayerTests(currentVariant.language, currentVariant.code, runnable);
            set({ localResults: results, runningTests: false });
        } catch (err) {
            set({ runningTests: false, error: (err as Error).message });
        }
    },

    submit: async () => {
        const { currentVariant, hypothesis, tests, turnstileToken } = get();
        if (!currentVariant) return;
        if (!turnstileToken) {
            set({ error: 'Complete the verification challenge before submitting.' });
            return;
        }
        if (hypothesis.trim().length < 10) {
            set({ error: 'Describe your hypothesis in a sentence before submitting.' });
            return;
        }
        set({ submitting: true, error: null });
        try {
            const runnable = tests.filter((t) => t.input.trim() !== '' || t.expected.trim() !== '');
            const verdict = await submitJudge({
                variantId: currentVariant.id,
                hypothesis,
                tests: runnable,
                turnstileToken,
            });
            set({
                verdict,
                rating: verdict.verificationRating ?? (isSignedIn() ? get().rating : null),
                submitting: false,
                turnstileToken: null,
                turnstileNonce: get().turnstileNonce + 1,
            });
        } catch (err) {
            set({
                submitting: false,
                error: (err as Error).message,
                turnstileToken: null,
                turnstileNonce: get().turnstileNonce + 1,
            });
        }
    },

    setHypothesis: (value) => set({ hypothesis: value }),

    setTurnstileToken: (token) => set({ turnstileToken: token }),

    addTest: () => set((s) => ({ tests: [...s.tests, emptyTest()] })),

    updateTest: (index, patch) =>
        set((s) => ({
            tests: s.tests.map((t, i) => (i === index ? { ...t, ...patch } : t)),
        })),

    removeTest: (index) =>
        set((s) => ({
            tests: s.tests.length > 1 ? s.tests.filter((_, i) => i !== index) : s.tests,
        })),

    reset: () =>
        set((s) => ({
            currentVariant: null,
            tests: [emptyTest()],
            hypothesis: '',
            localResults: null,
            verdict: null,
            error: null,
            turnstileToken: null,
            turnstileNonce: s.turnstileNonce + 1,
        })),
}));
