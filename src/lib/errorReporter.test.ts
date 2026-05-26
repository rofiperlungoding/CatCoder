/**
 * errorReporter — fail-safe behaviour tests.
 *
 * The reporter is called from React's error boundary; whatever happens it
 * must NOT throw, and it must surface a structured result the caller can
 * branch on.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const rpcMock = vi.fn();
const isConfiguredMock = vi.fn(() => true);

vi.mock('./supabase', () => ({
    supabase: {
        rpc: (...args: unknown[]) => rpcMock(...args),
    },
    isSupabaseConfigured: () => isConfiguredMock(),
}));

beforeEach(() => {
    vi.resetModules();
    rpcMock.mockReset();
    isConfiguredMock.mockReset();
    isConfiguredMock.mockReturnValue(true);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('reportError', () => {
    it('returns success when the RPC writes a row', async () => {
        rpcMock.mockResolvedValueOnce({ data: 'log-1', error: null });

        const { reportError } = await import('./errorReporter');
        const out = await reportError({
            area: 'error_boundary',
            error: new Error('boom'),
            componentStack: 'at <X>',
        });

        expect(out.success).toBe(true);
        expect(rpcMock).toHaveBeenCalledTimes(1);
        const [name, payload] = rpcMock.mock.calls[0] as [string, Record<string, unknown>];
        expect(name).toBe('log_app_error');
        expect(payload.p_area).toBe('error_boundary');
        expect(payload.p_message).toBe('boom');
    });

    it('reports `not_configured` without calling RPC when Supabase is offline', async () => {
        isConfiguredMock.mockReturnValueOnce(false);

        const { reportError } = await import('./errorReporter');
        const out = await reportError({ area: 'a', error: new Error('x') });

        expect(out.success).toBe(false);
        expect(out.reason).toBe('not_configured');
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('detects missing RPC (PostgREST 42883/PGRST202) so the deploy checklist surfaces it', async () => {
        rpcMock.mockResolvedValueOnce({ data: null, error: { code: '42883', message: 'no function' } });

        const { reportError } = await import('./errorReporter');
        const out = await reportError({ area: 'a', error: new Error('x') });

        expect(out.success).toBe(false);
        expect(out.reason).toBe('rpc_unavailable');
    });

    it('never throws even when the RPC call rejects', async () => {
        rpcMock.mockRejectedValueOnce(new Error('network down'));

        const { reportError } = await import('./errorReporter');
        const out = await reportError({ area: 'a', error: new Error('x') });

        expect(out.success).toBe(false);
        expect(out.reason).toBe('unexpected');
    });
});
