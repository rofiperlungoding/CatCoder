import { describe, it, expect, vi, beforeEach } from 'vitest';

// The mock user every authenticated call resolves to.
vi.mock('./auth', () => ({
    getUserFromRequest: vi.fn(async () => ({
        id: 'user-1',
        email: 'a@b.c',
        password_hash: 'x:y',
        username: 'tester',
        created_at: '2026-01-01',
    })),
}));

type QueryFn = (client: unknown, sql: string, args?: unknown[]) => Promise<unknown>;

const queryOne = vi.fn<QueryFn>(async () => null);
const queryAll = vi.fn<QueryFn>(async () => []);
const runMock = vi.fn<QueryFn>(async () => undefined);

vi.mock('./db', () => ({
    getClient: vi.fn(() => ({})),
    queryOne: (client: unknown, sql: string, args?: unknown[]) => queryOne(client, sql, args),
    queryAll: (client: unknown, sql: string, args?: unknown[]) => queryAll(client, sql, args),
    run: (client: unknown, sql: string, args?: unknown[]) => runMock(client, sql, args),
}));

vi.mock('./crypto', () => ({
    newId: vi.fn(() => 'synth-id'),
}));

import { handleDb } from './data';

type Descriptor = Parameters<typeof handleDb>[2];

const env = {} as never;
const authedRequest = new Request('https://x/api/db', {
    method: 'POST',
    headers: { Authorization: 'Bearer tok' },
});

describe('handleDb write scrubbing', () => {
    beforeEach(() => {
        runMock.mockClear();
        queryAll.mockClear();
        queryOne.mockClear();
    });

    it('strips server-authoritative columns (xp/level/rank/verification_rating) from profile updates', async () => {
        const desc: Descriptor = {
            table: 'profiles',
            mode: 'update',
            payload: { xp: 999999, level: 99, rank: 'diamond', verification_rating: 3500, username: 'hax' },
        } as unknown as Descriptor;

        const res = await handleDb(env, authedRequest, desc);
        expect(res.status).toBe(200);

        const [, sql, args] = runMock.mock.calls[0];
        expect(sql).not.toMatch(/\bxp\b/);
        expect(sql).not.toMatch(/\blevel\b/);
        expect(sql).not.toMatch(/\brank\b/);
        expect(sql).not.toMatch(/verification_rating/);
        expect(sql).toContain('username');
        expect(args).not.toContain(999999);
        expect(args).toContain('hax');
    });

    it('rejects upsert payloads that smuggle xp via ON CONFLICT DO UPDATE', async () => {
        const desc: Descriptor = {
            table: 'profiles',
            mode: 'upsert',
            payload: { id: 'user-1', xp: 999999, username: 'ok' },
        } as unknown as Descriptor;

        await handleDb(env, authedRequest, desc);

        const [, sql] = runMock.mock.calls[0];
        expect(sql).toContain('ON CONFLICT');
        expect(sql).not.toMatch(/xp\s*=\s*excluded\.xp/);
        expect(sql).toMatch(/username\s*=\s*excluded\.username/);
    });

    it('returns an empty success without SQL when nothing writable survives stripping', async () => {
        const desc: Descriptor = {
            table: 'profiles',
            mode: 'update',
            payload: { xp: 999999 },
        } as unknown as Descriptor;

        const res = await handleDb(env, authedRequest, desc);
        const body = (await res.json()) as { data: unknown[] };
        expect(body.data).toEqual([]);
        expect(runMock).not.toHaveBeenCalled();
    });

    it('forces ownership on insert: client cannot write rows for another user', async () => {
        const desc: Descriptor = {
            table: 'user_progress',
            mode: 'insert',
            payload: {
                user_id: 'VICTIM',
                content_type: 'lesson',
                content_id: 'l1',
                status: 'completed',
            },
        } as unknown as Descriptor;

        await handleDb(env, authedRequest, desc);

        const [, sql, args] = runMock.mock.calls[0];
        expect(sql).toContain('INSERT INTO user_progress');
        expect(args).not.toContain('VICTIM');
        expect(args).toContain('user-1');
        // id is synthesized server-side (PK has no default)
        expect(args).toContain('synth-id');
    });

    it('keeps tables with no client writes read-only (attempts)', async () => {
        const desc: Descriptor = {
            table: 'attempts',
            mode: 'insert',
            payload: { verdict: 'correct', score: 999 },
        } as unknown as Descriptor;

        const res = await handleDb(env, authedRequest, desc);
        expect(res.status).toBe(403);
        expect(runMock).not.toHaveBeenCalled();
    });

    it('rejects tables outside the allowlist entirely', async () => {
        const desc: Descriptor = {
            table: 'users',
            mode: 'select',
        } as unknown as Descriptor;

        await expect(handleDb(env, authedRequest, desc)).rejects.toThrow('Table not allowed: users');
    });

    it('overrides client-supplied user_id filters on owned selects', async () => {
        const desc: Descriptor = {
            table: 'user_progress',
            mode: 'select',
            filters: [{ col: 'user_id', op: 'eq', val: 'VICTIM' }],
        } as unknown as Descriptor;

        const res = await handleDb(env, authedRequest, desc);
        expect(res.status).toBe(200);

        const [, sql, args] = queryAll.mock.calls[0];
        expect(sql).toContain('user_id = ?');
        expect(args).toContain('user-1');
        expect(args).not.toContain('VICTIM');
    });
});
