export interface Env {
    LIBSQL_DB_URL: string;
    LIBSQL_DB_AUTH_TOKEN: string;
    AUTH_SECRET: string;
    MISTRAL_API_KEY: string;
    /** Optional: judge model override (default: codestral-latest). */
    MISTRAL_MODEL?: string;
    TURNSTILE_SECRET: string;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT: KVNamespace;
    ASSETS: Fetcher;
}

export interface SessionRow {
    token: string;
    user_id: string;
    created_at: string;
    expires_at: string;
}

export interface UserRow {
    id: string;
    email: string;
    password_hash: string;
    username: string;
    created_at: string;
}

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export function json(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...extraHeaders,
        },
    });
}
