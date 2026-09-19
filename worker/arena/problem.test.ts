import { describe, it, expect, vi } from 'vitest';
import type { Env } from '../types';

vi.mock('../auth', () => ({
    getUserFromRequest: vi.fn(async () => null),
}));

vi.mock('../db', () => ({
    getClient: vi.fn(() => ({})),
    queryOne: vi.fn(async () => ({
        id: 'bv_x',
        prompt: 'Fix the function',
        language: 'python',
        code: 'def solve(n): return n',
        difficulty: 1200,
        bug_type: 'off-by-one',
        bug_explanation: 'SECRET_EXPLANATION_LEAK',
        misconception: 'SECRET_MISCONCEPTION_LEAK',
        failing_tests: '[{"input":"[1]","expected":"2"}]',
    })),
}));

import { handleProblem } from './problem';const env = {
    ALLOWED_ORIGINS: 'https://example.com,https://www.example.com',
} as unknown as Env;

describe('handleProblem', () => {
    it('never returns answer columns and echoes allowlisted origins', async () => {
        const res = await handleProblem(
            new Request('https://x/api/arena/problem', {
                method: 'GET',
                headers: { Origin: 'https://www.example.com' },
            }),
            env
        );
        const text = await res.clone().text();
        const body = JSON.parse(text) as Record<string, unknown>;

        expect(Object.keys(body).sort()).toEqual([
            'code',
            'difficulty',
            'id',
            'language',
            'prompt',
        ]);
        expect(text).not.toContain('SECRET_EXPLANATION_LEAK');
        expect(text).not.toContain('SECRET_MISCONCEPTION_LEAK');
        expect(text).not.toContain('failing_tests');
        expect(text).not.toContain('bug_type');
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://www.example.com');
    });

    it('falls back to the first allowlisted origin for unknown/no Origin calls', async () => {
        const res = await handleProblem(
            new Request('https://x/api/arena/problem', { method: 'GET' }),
            env
        );
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
    });

    it('answers OPTIONS preflight with 204 and CORS headers', async () => {
        const res = await handleProblem(
            new Request('https://x/api/arena/problem', {
                method: 'OPTIONS',
                headers: { Origin: 'https://www.example.com' },
            }),
            env
        );
        expect(res.status).toBe(204);
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://www.example.com');
        expect(res.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
    });
});
