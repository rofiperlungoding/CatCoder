import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Env } from '../types';

const queryAll = vi.fn(async (_client: unknown, _sql: string) => [
    { id: 'u1', username: 'alice', verification_rating: 1300, rank: 'silver', xp: 500 },
    { id: 'u2', username: 'bob', verification_rating: 1250, rank: 'bronze', xp: 300 },
]);

vi.mock('../db', () => ({
    getClient: () => ({}),
    queryAll: (client: unknown, sql: string) => queryAll(client, sql),
}));

import { handleLeaderboard } from './leaderboard';

function fakeEnv() {
    const store = new Map<string, string>();
    const kvGet = vi.fn(async (key: string, type?: string) => {
        const raw = store.get(key);
        if (raw === undefined) return null;
        return type === 'json' ? JSON.parse(raw) : raw;
    });
    const kvPut = vi.fn(async (key: string, value: string) => {
        store.set(key, value);
    });
    return {
        env: {
            ALLOWED_ORIGINS: 'https://example.com',
            RATE_LIMIT: {
                get: kvGet,
                put: kvPut,
                _store: store,
            },
            // Real checkReadRateLimit rides this stub: always allowed.
            RATE_LIMITER_DO: {
                idFromName: () => ({ name: 'test' }),
                get: () => ({
                    fetch: async () => new Response(JSON.stringify({ allowed: true, remaining: 1, resetAt: 0 })),
                }),
            },
        } as unknown as Env,
        store,
    };
}

function getRequest(): Request {
    return new Request('https://x/api/arena/leaderboard', {
        method: 'GET',
        headers: { Origin: 'https://example.com' },
    });
}

describe('leaderboard cache', () => {
    beforeEach(() => {
        queryAll.mockClear();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('queries the DB on the first call and stores a cache entry', async () => {
        const { env, store } = fakeEnv();
        const res = await handleLeaderboard(getRequest(), env);
        expect(res.status).toBe(200);
        expect(queryAll).toHaveBeenCalledTimes(1);

        const body = (await res.json()) as { entries: unknown[] };
        expect(body.entries).toHaveLength(2);

        const cached = JSON.parse(store.get('leaderboard:top25:v1')!) as { cachedAt: number; entries: unknown[] };
        expect(cached.entries).toHaveLength(2);
        expect(cached.cachedAt).toBe(Date.now());
    });

    it('serves the fresh window from cache without a second DB query', async () => {
        const { env } = fakeEnv();
        await handleLeaderboard(getRequest(), env);
        vi.setSystemTime(new Date('2026-01-01T00:00:20Z')); // +20s, still fresh
        const res = await handleLeaderboard(getRequest(), env);

        expect(res.status).toBe(200);
        expect(queryAll).toHaveBeenCalledTimes(1); // only the first call hit the DB
        const body = (await res.json()) as { entries: unknown[] };
        expect(body.entries).toHaveLength(2);
    });

    it('refetches from the DB once the 30s window goes stale', async () => {
        const { env } = fakeEnv();
        await handleLeaderboard(getRequest(), env);
        vi.setSystemTime(new Date('2026-01-01T00:00:31Z')); // +31s, stale
        await handleLeaderboard(getRequest(), env);

        expect(queryAll).toHaveBeenCalledTimes(2);
    });

    it('fails open to the DB when the cache read throws', async () => {
        const { env } = fakeEnv();
        (env.RATE_LIMIT.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('kv down'));
        const res = await handleLeaderboard(getRequest(), env);

        expect(res.status).toBe(200);
        expect(queryAll).toHaveBeenCalledTimes(1);
        const body = (await res.json()) as { entries: unknown[] };
        expect(body.entries).toHaveLength(2);
    });

    it('still serves the DB result when the cache write throws', async () => {
        const { env } = fakeEnv();
        (env.RATE_LIMIT.put as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('kv full'));
        const res = await handleLeaderboard(getRequest(), env);

        expect(res.status).toBe(200);
        const body = (await res.json()) as { entries: unknown[] };
        expect(body.entries).toHaveLength(2);
    });
});
