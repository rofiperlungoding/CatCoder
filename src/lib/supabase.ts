import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import { createLocalBackend } from './localBackend';
import { createTursoBackend } from './tursoBackend';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

/**
 * Backend selection.
 *
 * Priority:
 *   1. VITE_BACKEND=local            -> in-browser localStorage backend
 *   2. VITE_BACKEND=turso            -> Cloudflare Worker + Turso (via /api/*)
 *   3. VITE_BACKEND=supabase         -> real Supabase
 *   4. (default) auto: use real Supabase when credentials are present and
 *      valid, otherwise fall back to the local backend so the app runs
 *      out-of-the-box for testing.
 */
const backendMode = (import.meta.env.VITE_BACKEND as string | undefined)?.toLowerCase();

const hasRealCredentials =
    !!import.meta.env.VITE_SUPABASE_URL &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

// Safety net: production builds behind `cf:build`/`--mode cloudflare` are
// compiled for the Worker + Turso backend. If the git-ignored .env.cloudflare
// ever reaches the bundler without VITE_BACKEND, defaulting to "local" would
// ship a silently broken SPA (dead auth/API) — so fail over to turso instead.
const isProductionBuild =
    import.meta.env.PROD === true || import.meta.env.MODE === 'production';

const useTurso =
    backendMode === 'turso' || (backendMode === undefined && isProductionBuild);
const useLocal =
    !useTurso &&
    (backendMode === 'local' || (backendMode !== 'supabase' && !hasRealCredentials));

if (backendMode === undefined && isProductionBuild) {
    console.error(
        '[CatCoder] VITE_BACKEND is not set in a production build — ' +
            'defaulting to the Turso backend. This usually means ' +
            '.env.cloudflare was missing when the bundle was compiled.'
    );
}

function buildRealClient(): SupabaseClient<Database> {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            storageKey: 'sb-catcoder-auth-token',
        },
    });
}

function buildClient(): SupabaseClient<Database> {
    if (useTurso) return createTursoBackend() as unknown as SupabaseClient<Database>;
    if (useLocal) return createLocalBackend() as unknown as SupabaseClient<Database>;
    return buildRealClient();
}

/**
 * The active backend client. In local/turso mode this is a stand-in cast to
 * the Supabase client type so all existing call sites keep working unchanged.
 */
export const supabase: SupabaseClient<Database> = buildClient();

/** True when running against the in-browser local backend. */
export const isLocalBackend = (): boolean => useLocal;

/** True when running against the Cloudflare Worker + Turso backend. */
export const isTursoBackend = (): boolean => useTurso;

/**
 * Whether a usable backend is available. Local and Turso modes are always
 * "configured"; remote mode reflects the presence of valid Supabase creds.
 */
export const isSupabaseConfigured = (): boolean => useLocal || useTurso || hasRealCredentials;
