import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Env } from '../types';
import type { TestCase } from '../../db/schema';

vi.mock('../auth', () => ({
    getUserFromRequest: vi.fn(async () => ({
        id: 'user-1',
        email: 'a@b.c',
        password_hash: 'x:y',
        username: 'tester',
        created_at: '2026-01-01',
    })),
}));

vi.mock('../db', () => ({
    getClient: vi.fn(() => ({})),
    queryOne: vi.fn(async () => ({
        id: 'bv_1',
        code: 'def solve(n): return n',
        bug_explanation: 'off by one',
        misconception: 'misconception',
        bug_type: 'off-by-one',
        difficulty: 1200,
    })),
}));

vi.mock('../rpc', () => ({
    applyVerificationResult: vi.fn(async () => ({ verificationRating: 1210, delta: 10 })),
}));

vi.mock('../shared/rateLimit', () => ({
    checkRateLimit: vi.fn(async () => true),
    clientIp: vi.fn(() => '1.2.3.4'),
}));

vi.mock('../shared/turnstile', () => ({
    verifyTurnstile: vi.fn(async () => true),
}));

const judgeMock = vi.fn();
vi.mock('../shared/mistral', () => ({
    judgeWithMistral: (...args: unknown[]) => judgeMock(...args),
    // judge.ts reads this fallback when env.MISTRAL_MODEL is unset;
    // vitest throws on any export missing from the mock factory.
    DEFAULT_JUDGE_MODEL: 'test-judge-model',
}));

import { handleJudge } from './judge';
import { applyVerificationResult } from '../rpc';

const env = {
    ALLOWED_ORIGINS: 'https://example.com',
    MISTRAL_API_KEY: 'k',
} as unknown as Env;

function post(body: unknown): Request {
    return new Request('https://x/api/arena/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
        body: JSON.stringify(body),
    });
}

const tests: TestCase[] = [{ input: '3', expected: '2' }];
// MIN_HYPOTHESIS_LENGTH on the server is 10 chars — keep bodies above it.
const hypothesis = 'my hypothesis here';

describe('handleJudge', () => {
    beforeEach(() => {
        judgeMock.mockReset();
        vi.mocked(applyVerificationResult).mockClear();
    });

    it('rejects oversized test arrays with 400 before touching Turnstile or Mistral', async () => {
        judgeMock.mockResolvedValue({ ok: false, reason: 'unavailable' });

        const res = await handleJudge(
            post({
                variantId: 'bv_1',
                hypothesis,
                turnstileToken: 't',
                tests: Array.from({ length: 21 }, (_, i) => ({ input: String(i), expected: 'x' })),
            }),
            env
        );
        expect(res.status).toBe(400);
        expect(judgeMock).not.toHaveBeenCalled();
    });

    it('rejects oversized test fields with 400', async () => {
        judgeMock.mockResolvedValue({ ok: false, reason: 'unavailable' });

        const res = await handleJudge(
            post({
                variantId: 'bv_1',
                hypothesis,
                turnstileToken: 't',
                tests: [{ input: 'x'.repeat(201), expected: 'y' }],
            }),
            env
        );
        expect(res.status).toBe(400);
        expect(judgeMock).not.toHaveBeenCalled();
    });

    it('returns 503 on judge outage and never records an attempt or updates rating', async () => {
        judgeMock.mockResolvedValue({ ok: false, reason: 'unavailable' });

        const res = await handleJudge(
            post({ variantId: 'bv_1', hypothesis, turnstileToken: 't', tests }),
            env
        );
        expect(res.status).toBe(503);
        const body = (await res.json()) as { error: string };
        expect(body.error).toContain('temporarily unavailable');
        expect(applyVerificationResult).not.toHaveBeenCalled();
    });

    it('records a correct verdict and applies ELO when the judge answers', async () => {
        judgeMock.mockResolvedValue({
            ok: true,
            output: {
                correct: true,
                correctness: 0.9,
                misconceptionTag: null,
                missingCases: [],
                feedback: 'nice catch',
            },
        });

        const res = await handleJudge(
            post({ variantId: 'bv_1', hypothesis, turnstileToken: 't', tests }),
            env
        );
        expect(res.status).toBe(200);
        expect(applyVerificationResult).toHaveBeenCalledTimes(1);

        const body = (await res.json()) as { correct: boolean; verificationRating: number | null };
        expect(body.correct).toBe(true);
        expect(body.verificationRating).toBe(1210);
    });

    it('rejects an empty/too-short hypothesis with 400 before Turnstile or Mistral', async () => {
        judgeMock.mockResolvedValue({ ok: false, reason: 'unavailable' });

        const res = await handleJudge(
            post({ variantId: 'bv_1', hypothesis: 'short', turnstileToken: 't', tests }),
            env
        );
        expect(res.status).toBe(400);
        expect(judgeMock).not.toHaveBeenCalled();
    });

    it('clamps a too-long hypothesis instead of rejecting the whole submission', async () => {
        judgeMock.mockResolvedValue({
            ok: true,
            output: {
                correct: false,
                correctness: 0.1,
                misconceptionTag: 'misconception',
                missingCases: [],
                feedback: 'not quite',
            },
        });

        const res = await handleJudge(
            post({ variantId: 'bv_1', hypothesis: 'h'.repeat(5000), turnstileToken: 't', tests }),
            env
        );
        expect(res.status).toBe(200);

        const call = judgeMock.mock.calls[0] as [string, { hypothesis: string }];
        expect(call[1].hypothesis.length).toBe(2000);
    });
});
