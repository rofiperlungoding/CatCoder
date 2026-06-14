import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import { createLocalBackend } from './localBackend';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

/**
 * Backend selection.
 *
 * Priority:
 *   1. VITE_BACKEND=local            -> always use the local backend
 *   2. VITE_BACKEND=supabase         -> always use real Supabase (even if env looks placeholder)
 *   3. (default) auto: use real Supabase when credentials are present and
 *      valid, otherwise fall back to the local backend so the app runs
 *      out-of-the-box for testing.
 */
const backendMode = (import.meta.env.VITE_BACKEND as string | undefined)?.toLowerCase();

const hasRealCredentials =
    !!import.meta.env.VITE_SUPABASE_URL &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

const useLocal =
    backendMode === 'local' || (backendMode !== 'supabase' && !hasRealCredentials);

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

/**
 * The active backend client. In local mode this is a localStorage-backed
 * stand-in cast to the Supabase client type so all existing call sites keep
 * working unchanged.
 */
export const supabase: SupabaseClient<Database> = useLocal
    ? (createLocalBackend() as unknown as SupabaseClient<Database>)
    : buildRealClient();

/** True when the app is running against the in-browser local backend. */
export const isLocalBackend = (): boolean => useLocal;

/**
 * Whether a usable backend is available. In local mode this is always true
 * (the localStorage backend is always "configured"); in remote mode it
 * reflects the presence of valid Supabase credentials.
 */
export const isSupabaseConfigured = (): boolean => useLocal || hasRealCredentials;
