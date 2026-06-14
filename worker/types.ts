export interface Env {
    /** Turso database URL, e.g. libsql://my-db-user.turso.io */
    LIBSQL_DB_URL?: string;
    /** Turso auth token (Worker secret). */
    LIBSQL_DB_AUTH_TOKEN?: string;
    /** Secret used to sign/scope sessions (Worker secret). Optional. */
    AUTH_SECRET?: string;
    /** Static assets binding (configured in wrangler.toml). */
    ASSETS: { fetch: (request: Request) => Promise<Response> };
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

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

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
