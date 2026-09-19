import { describe, it, expect } from 'vitest';
import { checkRateLimit, clientIp } from './rateLimit';

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

    it('keeps distinct key namespaces independent', async () => {
        const kv = fakeKv();
        expect(await checkRateLimit(kv, 'signin:email:a@b.c', 1, 60)).toBe(true);
        expect(await checkRateLimit(kv, 'signin:ip:1.2.3.4', 1, 60)).toBe(true);
        expect(await checkRateLimit(kv, 'judge:1.2.3.4', 1, 60)).toBe(true);
        // Exhausting one axis does not touch the others.
        expect(await checkRateLimit(kv, 'signin:email:a@b.c', 1, 60)).toBe(false);
        expect(await checkRateLimit(kv, 'signin:ip:1.2.3.4', 1, 60)).toBe(false);
    });

    it('clientIp falls back when CF-Connecting-IP is absent', () => {
        expect(clientIp(new Request('https://x/'))).toBe('unknown');
        expect(
            clientIp(new Request('https://x/', { headers: { 'CF-Connecting-IP': '9.9.9.9' } }))
        ).toBe('9.9.9.9');
    });
});
