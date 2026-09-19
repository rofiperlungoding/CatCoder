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
    it('returns the safe fallback on malformed JSON content', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => mistralResponse('this is not json {{{')));
        const out = await judgeWithMistral('key', input);
        expect(out.correct).toBe(false);
        expect(out.correctness).toBe(0);
        expect(out.misconceptionTag).toBeNull();
        expect(out.missingCases).toEqual([]);
        expect(out.feedback.length).toBeGreaterThan(0);
    });

    it('returns the safe fallback when fetch throws', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => {
            throw new Error('network down');
        }));
        const out = await judgeWithMistral('key', input);
        expect(out.correct).toBe(false);
        expect(out.correctness).toBe(0);
    });

    it('returns the safe fallback on a non-ok response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('error', { status: 500 })));
        const out = await judgeWithMistral('key', input);
        expect(out.correct).toBe(false);
    });

    it('clamps correctness into the 0..1 range', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                mistralResponse(
                    JSON.stringify({ correct: true, correctness: 5, misconceptionTag: null, missingCases: [], feedback: 'ok' })
                )
            )
        );
        const out = await judgeWithMistral('key', input);
        expect(out.correctness).toBeLessThanOrEqual(1);
        expect(out.correctness).toBeGreaterThanOrEqual(0);
    });
});
