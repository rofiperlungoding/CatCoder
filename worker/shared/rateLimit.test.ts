import { describe, it, expect, vi, afterEach } from 'vitest';
import { RateLimiterDurableObject } from './rateLimiterDo';
import { clientIp } from './rateLimit';

/**
 * In-memory stand-in for DurableObjectStorage. Good enough for unit tests:
 * the DO unit under test only uses get/put, and cross-request consistency
 * is provided by the class's own promise-chain mutex.
 */
function fakeStorage() {
    const map = new Map<string, unknown>();
    return {
        get: async <T>(key: string): Promise<T | undefined> => map.get(key) as T | undefined,
        put: async (key: string, value: unknown): Promise<void> => {
            map.set(key, value);
        },
        dump: () => map,
    };
}

function fakeState() {
    return { storage: fakeStorage() } as unknown as DurableObjectState;
}

/** Drive the DO through its HTTP-ish fetch contract. */
async function check(
    limiter: RateLimiterDurableObject,
    identity: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    const res = await limiter.fetch(
        new Request('https://rate-limiter.internal/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit, windowSeconds, identity }),
        })
    );
    expect(res.ok).toBe(true);
    const data = (await res.json()) as { allowed: boolean };
    return data.allowed;
}

describe('RateLimiterDurableObject', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('allows exactly `limit` requests and denies beyond the boundary', async () => {
        const limiter = new RateLimiterDurableObject(fakeState(), {}, {} as ExecutionContext);
        for (let i = 0; i < 2; i++) {
            expect(await check(limiter, 'k', 2, 60)).toBe(true);
        }
        expect(await check(limiter, 'k', 2, 60)).toBe(false);
        expect(await check(limiter, 'k', 2, 60)).toBe(false);
    });

    it('keeps separate counters for separate identities (one DO instance per identity)', async () => {
        // The runtime routes idFromName(identity) to its own instance with
        // its own storage — mirror that here with one limiter per identity.
        const byIdentity = new Map<string, RateLimiterDurableObject>();
        const limiterFor = (id: string) => {
            let l = byIdentity.get(id);
            if (!l) {
                l = new RateLimiterDurableObject(fakeState(), {}, {} as ExecutionContext);
                byIdentity.set(id, l);
            }
            return l;
        };
        expect(await check(limiterFor('signin:email:a@b.c'), 'signin:email:a@b.c', 1, 60)).toBe(true);
        expect(await check(limiterFor('signin:email:a@b.c'), 'signin:email:a@b.c', 1, 60)).toBe(false);
        expect(await check(limiterFor('signin:ip:1.2.3.4'), 'signin:ip:1.2.3.4', 1, 60)).toBe(true);
        expect(await check(limiterFor('judge:1.2.3.4'), 'judge:1.2.3.4', 1, 60)).toBe(true);
        // Exhausting one axis never touches the others.
        expect(await check(limiterFor('signin:email:a@b.c'), 'signin:email:a@b.c', 1, 60)).toBe(false);
        expect(await check(limiterFor('signin:ip:1.2.3.4'), 'signin:ip:1.2.3.4', 1, 60)).toBe(false);
    });

    it('resets the counter when the window rolls over', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:30Z')); // inside window 0
        const limiter = new RateLimiterDurableObject(fakeState(), {}, {} as ExecutionContext);
        expect(await check(limiter, 'k', 1, 60)).toBe(true);
        expect(await check(limiter, 'k', 1, 60)).toBe(false);
        vi.setSystemTime(new Date('2026-01-01T00:01:30Z')); // window 1
        expect(await check(limiter, 'k', 1, 60)).toBe(true);
        expect(await check(limiter, 'k', 1, 60)).toBe(false);
    });

    it('serializes concurrent calls — the counter never over-admits', async () => {
        const limiter = new RateLimiterDurableObject(fakeState(), {}, {} as ExecutionContext);
        const LIMIT = 5;
        const results = await Promise.all(
            Array.from({ length: 50 }, () => check(limiter, 'burst', LIMIT, 60))
        );
        expect(results.filter(Boolean)).toHaveLength(LIMIT);
        expect(results.filter((r) => !r)).toHaveLength(50 - LIMIT);
    });

    it('reports remaining and resetAt metadata', async () => {
        const limiter = new RateLimiterDurableObject(fakeState(), {}, {} as ExecutionContext);
        const res = await limiter.fetch(
            new Request('https://rate-limiter.internal/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 3, windowSeconds: 60 }),
            })
        );
        const data = (await res.json()) as { allowed: boolean; remaining: number; resetAt: number };
        expect(data.allowed).toBe(true);
        expect(data.remaining).toBe(2);
        expect(data.resetAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
});

describe('clientIp', () => {
    it('falls back when CF-Connecting-IP is absent', () => {
        expect(clientIp(new Request('https://x/'))).toBe('unknown');
        expect(
            clientIp(new Request('https://x/', { headers: { 'CF-Connecting-IP': '9.9.9.9' } }))
        ).toBe('9.9.9.9');
    });
});
