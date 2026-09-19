import { describe, it, expect, vi, afterEach } from 'vitest';
import { judgeWithMistral, type JudgeInput } from './mistral';

const input: JudgeInput = {
    code: 'def solve(n): return n',
    groundTruth: 'ground truth',
    misconception: 'a misconception',
    hypothesis: 'a hypothesis',
    tests: [],
};

function mistralResponse(content: string): Response {
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('judgeWithMistral', () => {
    it('reports unavailable (not a wrong verdict) on malformed JSON content', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => mistralResponse('this is not json {{{')));
        const out = await judgeWithMistral('key', input);
        expect(out.ok).toBe(false);
        if (!out.ok) expect(out.reason).toBe('unavailable');
    });

    it('reports unavailable when fetch throws', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => {
            throw new Error('network down');
        }));
        const out = await judgeWithMistral('key', input);
        expect(out.ok).toBe(false);
    });

    it('reports unavailable on a non-ok response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('error', { status: 500 })));
        const out = await judgeWithMistral('key', input);
        expect(out.ok).toBe(false);
    });

    it('returns a coerced verdict and clamps correctness into 0..1', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                mistralResponse(
                    JSON.stringify({ correct: true, correctness: 5, misconceptionTag: null, missingCases: [], feedback: 'ok' })
                )
            )
        );
        const out = await judgeWithMistral('key', input);
        expect(out.ok).toBe(true);
        if (out.ok) {
            expect(out.output.correct).toBe(true);
            expect(out.output.correctness).toBeLessThanOrEqual(1);
            expect(out.output.correctness).toBeGreaterThanOrEqual(0);
        }
    });
});
