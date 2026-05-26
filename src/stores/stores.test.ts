/**
 * Auth + UI store tests.
 *
 * The user store is a thick layer over Supabase that has historically gone
 * untested. We don't try to spec the Supabase SDK contract — we mock it —
 * but we do pin the local-state transitions that the rest of the app
 * relies on (toasts, isAuthenticated flips, basic user creation, error
 * handling, signOut clean-up).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks must be defined before the store module is imported. We rebuild
// fresh mocks per test via vi.resetModules + dynamic imports.

const supabaseMock = {
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(async () => ({ error: null })),
    resetPasswordForEmail: vi.fn(async () => ({ error: null })),
    signInWithOtp: vi.fn(async () => ({ error: null })),
    updateUser: vi.fn(async () => ({ error: null })),
    getSession: vi.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
};

const fromMock = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    upsert: vi.fn(async () => ({ data: null, error: null })),
    update: vi.fn().mockReturnThis(),
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: supabaseMock,
        from: fromMock,
    },
    isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock('../lib/deviceFingerprint', () => ({
    registerDeviceSession: vi.fn(async () => ({ valid: true })),
    verifyDeviceFingerprint: vi.fn(async () => ({ valid: true })),
    handleFingerprintMismatch: vi.fn(async () => undefined),
    clearCachedFingerprint: vi.fn(),
}));

vi.mock('../lib/serverTime', () => ({
    getTrueTime: () => Date.now(),
    getTrueDate: () => new Date(),
    syncServerTime: vi.fn(async () => undefined),
    isClockOutOfSync: vi.fn(() => false),
}));

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

async function importStores() {
    return await import('./index');
}

describe('useUserStore.signIn', () => {
    it('flips to authenticated on success and emits a welcome toast', async () => {
        supabaseMock.signInWithPassword.mockResolvedValueOnce({
            data: {
                user: {
                    id: 'user-1',
                    email: 'rofi@example.com',
                    user_metadata: { username: 'rofi' },
                    created_at: '2026-01-01T00:00:00Z',
                },
                session: { access_token: 't' },
            },
            error: null,
        });

        const { useUserStore, useUIStore } = await importStores();
        const { user, error } = await useUserStore.getState().signIn('rofi@example.com', 'pw');

        expect(error).toBeNull();
        expect(user?.id).toBe('user-1');
        expect(useUserStore.getState().isAuthenticated).toBe(true);

        const toasts = useUIStore.getState().toasts;
        expect(toasts.some((t) => t.type === 'success')).toBe(true);
    });

    it('returns the supabase error and stays unauthenticated on failure', async () => {
        supabaseMock.signInWithPassword.mockResolvedValueOnce({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
        });

        const { useUserStore, useUIStore } = await importStores();
        const { user, error } = await useUserStore.getState().signIn('rofi@example.com', 'wrong');

        expect(user).toBeNull();
        expect(error?.message).toBe('Invalid login credentials');
        expect(useUserStore.getState().isAuthenticated).toBe(false);

        const toasts = useUIStore.getState().toasts;
        expect(toasts.some((t) => t.type === 'error' && t.message.includes('Invalid'))).toBe(true);
    });

    it('returns a config error when Supabase is not configured', async () => {
        const supabaseModule = await import('../lib/supabase');
        (supabaseModule.isSupabaseConfigured as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);

        const { useUserStore } = await importStores();
        const { user, error } = await useUserStore.getState().signIn('a@b.com', 'pw');

        expect(user).toBeNull();
        expect(error?.name).toBe('ConfigError');
        expect(supabaseMock.signInWithPassword).not.toHaveBeenCalled();
    });
});

describe('useUserStore.logout', () => {
    it('clears user state immediately and triggers a Supabase signOut', async () => {
        const { useUserStore } = await importStores();

        // Seed an authenticated state.
        useUserStore.setState({
            user: {
                id: 'user-1',
                email: 'rofi@example.com',
                username: 'rofi',
                xp: 0,
                level: 1,
                rank: 'bronze',
                streakCurrent: 0,
                streakBest: 0,
                createdAt: '2026-01-01T00:00:00Z',
            },
            isAuthenticated: true,
            recentActivities: [
                { id: 'a', type: 'lesson_completed', title: 't', xpEarned: 1, timestamp: 'now' },
            ],
        });

        useUserStore.getState().logout();

        expect(useUserStore.getState().user).toBeNull();
        expect(useUserStore.getState().isAuthenticated).toBe(false);
        expect(useUserStore.getState().recentActivities).toEqual([]);
        expect(supabaseMock.signOut).toHaveBeenCalled();
    });
});

describe('useUserStore.signUp', () => {
    it('handles email-confirmation-required path without flipping authenticated', async () => {
        supabaseMock.signUp.mockResolvedValueOnce({
            data: {
                user: { id: 'u', email: 'a@b.com', created_at: 'now' },
                session: null, // no session = email confirmation needed
            },
            error: null,
        });

        const { useUserStore, useUIStore } = await importStores();
        const { user, error } = await useUserStore.getState().signUp('a@b.com', 'pw', 'rofi');

        expect(error).toBeNull();
        expect(user).toBeNull();
        expect(useUserStore.getState().isAuthenticated).toBe(false);
        const toasts = useUIStore.getState().toasts;
        expect(toasts.some((t) => t.message.toLowerCase().includes('check your email'))).toBe(true);
    });
});

describe('useUIStore.addToast', () => {
    it('uses crypto.randomUUID() for unique ids', async () => {
        const { useUIStore } = await importStores();
        const beforeIds = useUIStore.getState().toasts.map((t) => t.id);

        useUIStore.getState().addToast('info', 'a');
        useUIStore.getState().addToast('info', 'b');
        useUIStore.getState().addToast('info', 'c');

        const ids = useUIStore.getState().toasts.map((t) => t.id);
        expect(ids).not.toEqual(beforeIds);
        // No duplicate ids in the burst — the original Math.random impl could
        // collide on rapid calls.
        expect(new Set(ids).size).toBe(ids.length);
    });
});
