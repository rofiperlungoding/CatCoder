/**
 * Local backend tests — auth lifecycle, query builder, and the completion RPC.
 *
 * These run against the real localStorage mock from `src/test/setup.ts`, so
 * each test starts from a clean store.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalBackend } from './localBackend';

type Backend = ReturnType<typeof createLocalBackend>;

let backend: Backend;

beforeEach(() => {
    localStorage.clear();
    backend = createLocalBackend();
});

afterEach(() => {
    localStorage.clear();
});

describe('localBackend auth', () => {
    it('signs up, persists a session, and signs in again', async () => {
        const signUp = await backend.auth.signUp({
            email: 'rofi@example.com',
            password: 'pw123456',
            options: { data: { username: 'rofi' } },
        });
        expect(signUp.error).toBeNull();
        expect(signUp.data.session).not.toBeNull();
        expect(signUp.data.user?.email).toBe('rofi@example.com');

        const session = await backend.auth.getSession();
        expect(session.data.session?.user.email).toBe('rofi@example.com');

        await backend.auth.signOut();
        const afterOut = await backend.auth.getSession();
        expect(afterOut.data.session).toBeNull();

        const signIn = await backend.auth.signInWithPassword({
            email: 'rofi@example.com',
            password: 'pw123456',
        });
        expect(signIn.error).toBeNull();
        expect(signIn.data.session?.user.email).toBe('rofi@example.com');
    });

    it('rejects wrong credentials', async () => {
        await backend.auth.signUp({ email: 'a@b.com', password: 'right-pass' });
        const bad = await backend.auth.signInWithPassword({ email: 'a@b.com', password: 'wrong' });
        expect(bad.data.session).toBeNull();
        expect(bad.error).not.toBeNull();
    });

    it('rejects duplicate sign-ups', async () => {
        await backend.auth.signUp({ email: 'dupe@b.com', password: 'pw' });
        const second = await backend.auth.signUp({ email: 'dupe@b.com', password: 'pw' });
        expect(second.error).not.toBeNull();
    });

    it('returns a friendly error for OAuth in local mode', async () => {
        const res = await backend.auth.signInWithOAuth();
        expect(res.error).not.toBeNull();
    });
});

describe('localBackend query builder', () => {
    it('orders and limits a select', async () => {
        // The seed populates 5 demo profiles ordered by xp; verify ordering.
        const { data } = await backend
            .from('profiles')
            .select('id, username, xp')
            .order('xp', { ascending: false })
            .limit(3);
        const rows = data as { xp: number }[];
        expect(rows).toHaveLength(3);
        expect(rows[0].xp).toBeGreaterThanOrEqual(rows[1].xp);
        expect(rows[1].xp).toBeGreaterThanOrEqual(rows[2].xp);
    });

    it('upsert then maybeSingle round-trips a row', async () => {
        await backend.from('profiles').upsert({ id: 'u1', username: 'tester', xp: 10 });
        const { data } = await backend.from('profiles').select('*').eq('id', 'u1').maybeSingle();
        expect((data as { username: string }).username).toBe('tester');
    });

    it('counts with head:true without returning rows', async () => {
        await backend.from('profiles').upsert({ id: 'hi', xp: 99999 });
        const { data, count } = await backend
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('xp', 50000);
        expect(data).toBeNull();
        expect(count).toBe(1);
    });
});

describe('localBackend submit_completion RPC', () => {
    it('awards XP once and dedupes repeat completions', async () => {
        await backend.auth.signUp({ email: 'learner@b.com', password: 'pw', options: { data: { username: 'learner' } } });

        const first = await backend.rpc('submit_completion', {
            p_content_type: 'problem',
            p_content_id: 'two-sum',
            p_language: 'python',
        });
        const firstData = first.data as { success: boolean; xp_awarded: number; new_xp: number };
        expect(firstData.success).toBe(true);
        expect(firstData.xp_awarded).toBe(100);
        expect(firstData.new_xp).toBe(100);

        const repeat = await backend.rpc('submit_completion', {
            p_content_type: 'problem',
            p_content_id: 'two-sum',
            p_language: 'python',
        });
        const repeatData = repeat.data as { success: boolean; xp_awarded: number; message?: string };
        expect(repeatData.success).toBe(true);
        expect(repeatData.xp_awarded).toBe(0);
        expect(repeatData.message).toBe('Already completed');
    });

    it('get_server_time returns a numeric timestamp', async () => {
        const res = await backend.rpc('get_server_time');
        const data = res.data as { server_time_ms: number };
        expect(typeof data.server_time_ms).toBe('number');
    });
});
