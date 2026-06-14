/**
 * Turso client adapter tests — verifies it speaks the Worker /api contract:
 * auth token storage + Bearer header, query descriptor serialization, and
 * RPC envelope. The Worker itself is mocked via global fetch.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTursoBackend } from './tursoBackend';

type Backend = ReturnType<typeof createTursoBackend>;
let backend: Backend;
let fetchMock: ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    backend = createTursoBackend();
});

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
});

describe('tursoBackend auth', () => {
    it('stores the session and sends Bearer on later calls', async () => {
        fetchMock.mockResolvedValueOnce(
            jsonResponse({
                user: { id: 'u1', email: 'a@b.com', created_at: 'now', user_metadata: { username: 'a' } },
                session: {
                    access_token: 'tok-123',
                    user: { id: 'u1', email: 'a@b.com', created_at: 'now', user_metadata: { username: 'a' } },
                },
            })
        );

        const res = await backend.auth.signInWithPassword({ email: 'a@b.com', password: 'pw' });
        expect(res.error).toBeNull();
        expect(res.data.session?.access_token).toBe('tok-123');

        // Next authed call must carry the Bearer token.
        fetchMock.mockResolvedValueOnce(jsonResponse({ data: [], error: null, count: null }));
        await backend.from('user_progress').select('*').eq('user_id', 'u1');

        const [, init] = fetchMock.mock.calls[1] as [string, RequestInit];
        const headers = init.headers as Record<string, string>;
        expect(headers['Authorization']).toBe('Bearer tok-123');
    });

    it('returns an error and no session on failed sign-in', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Invalid login credentials' }, 401));
        const res = await backend.auth.signInWithPassword({ email: 'a@b.com', password: 'bad' });
        expect(res.data.session).toBeNull();
        expect(res.error).not.toBeNull();
    });

    it('OAuth is unsupported on this backend', async () => {
        const res = await backend.auth.signInWithOAuth();
        expect(res.error).not.toBeNull();
    });
});

describe('tursoBackend query builder', () => {
    it('serializes a select descriptor to /api/db', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ data: [{ id: 'x' }], error: null, count: null }));
        await backend
            .from('profiles')
            .select('id, xp')
            .eq('id', 'x')
            .order('xp', { ascending: false })
            .limit(5);

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('/api/db');
        const body = JSON.parse(init.body as string);
        expect(body.table).toBe('profiles');
        expect(body.mode).toBe('select');
        expect(body.filters).toEqual([{ col: 'id', op: 'eq', val: 'x' }]);
        expect(body.orders).toEqual([{ col: 'xp', asc: false }]);
        expect(body.limit).toBe(5);
    });

    it('maybeSingle resolves to the row payload', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'x', xp: 10 }, error: null, count: null }));
        const { data } = await backend.from('profiles').select('*').eq('id', 'x').maybeSingle();
        expect((data as { xp: number }).xp).toBe(10);
    });
});

describe('tursoBackend rpc', () => {
    it('posts fn + args to /api/rpc and returns the envelope', async () => {
        fetchMock.mockResolvedValueOnce(
            jsonResponse({ data: { success: true, xp_awarded: 100 }, error: null })
        );
        const res = await backend.rpc('submit_completion', {
            p_content_type: 'problem',
            p_content_id: 'two-sum',
        });
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('/api/rpc');
        const body = JSON.parse(init.body as string);
        expect(body.fn).toBe('submit_completion');
        expect(body.args.p_content_id).toBe('two-sum');
        expect((res.data as { xp_awarded: number }).xp_awarded).toBe(100);
    });
});
