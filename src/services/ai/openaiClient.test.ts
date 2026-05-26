/**
 * AI proxy client tests
 *
 * The client is a thin wrapper around fetch — these tests pin the request
 * shape and the error envelope so future refactors don't accidentally start
 * shipping the OpenAI key from the browser again.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(async () => ({
                data: { session: { access_token: 'jwt-test' } },
            })),
        },
    },
}));

const ORIGINAL_FETCH = global.fetch;

describe('AIProxyClient', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv('VITE_AI_ENABLED', 'true');
        vi.stubEnv('VITE_AI_PROXY_URL', 'https://proxy.example.test/ai');
        vi.stubEnv('VITE_OPENAI_MODEL', 'gpt-4o-mini');
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-test');
    });

    afterEach(() => {
        global.fetch = ORIGINAL_FETCH;
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('forwards messages to the configured proxy with auth + apikey headers', async () => {
        const fetchSpy = vi.fn(async () =>
            new Response(JSON.stringify({ content: 'hi' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        global.fetch = fetchSpy as unknown as typeof fetch;

        const { openaiClient } = await import('./openaiClient');
        const out = await openaiClient.generateCompletion(
            [{ role: 'user', content: 'hello' }],
            { max_tokens: 32, temperature: 0.5 }
        );

        expect(out).toBe('hi');
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://proxy.example.test/ai');
        expect(init.method).toBe('POST');
        const headers = init.headers as Record<string, string>;
        expect(headers['Authorization']).toBe('Bearer jwt-test');
        expect(headers['apikey']).toBe('anon-test');
        const body = JSON.parse(init.body as string);
        expect(body.messages).toEqual([{ role: 'user', content: 'hello' }]);
        expect(body.model).toBe('gpt-4o-mini');
        expect(body.max_tokens).toBe(32);
    });

    it('surfaces proxy errors as AIServiceError', async () => {
        global.fetch = vi.fn(async () =>
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            })
        ) as unknown as typeof fetch;

        const { openaiClient } = await import('./openaiClient');
        await expect(
            openaiClient.generateCompletion([{ role: 'user', content: 'x' }])
        ).rejects.toMatchObject({
            name: 'AIServiceError',
            code: 'AUTH_FAILED',
        });
    });

    it('throws CONFIG_MISSING when no proxy URL is resolvable', async () => {
        vi.stubEnv('VITE_AI_PROXY_URL', '');
        vi.stubEnv('VITE_SUPABASE_URL', '');

        const { openaiClient } = await import('./openaiClient');
        await expect(
            openaiClient.generateCompletion([{ role: 'user', content: 'x' }])
        ).rejects.toMatchObject({
            name: 'AIServiceError',
            code: 'CONFIG_MISSING',
        });
    });
});
