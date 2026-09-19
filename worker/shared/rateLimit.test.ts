import { describe, it, expect } from 'vitest';
import { checkRateLimit } from './rateLimit';

function fakeKv(): KVNamespace {
    const store = new Map<string, string>();
    return {
        get: async (key: string) => store.get(key) ?? null,
        put: async (key: string, value: string) => {
            store.set(key, value);
        },
    } as unknown as KVNamespace;
}

describe('checkRateLimit', () => {
    it('returns false exactly at the boundary and stays false', async () => {
        const kv = fakeKv();
        expect(await checkRateLimit(kv, 'ip', 2, 60)).toBe(true);
        expect(await checkRateLimit(kv, 'ip', 2, 60)).toBe(true);
        expect(await checkRateLimit(kv, 'ip', 2, 60)).toBe(false);
        expect(await checkRateLimit(kv, 'ip', 2, 60)).toBe(false);
    });

    it('scopes the counter per ip', async () => {
        const kv = fakeKv();
        expect(await checkRateLimit(kv, 'a', 1, 60)).toBe(true);
        expect(await checkRateLimit(kv, 'a', 1, 60)).toBe(false);
        expect(await checkRateLimit(kv, 'b', 1, 60)).toBe(true);
    });
});
