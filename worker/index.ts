/**
 * CatCoder Cloudflare Worker.
 *
 * Serves the SPA static assets (via the ASSETS binding) and handles the
 * `/api/*` routes (run_worker_first in wrangler.toml) for auth, data, and
 * RPC against Turso. The Turso token lives in Worker secrets and never
 * reaches the browser.
 */

import {
    handleSignUp,
    handleSignIn,
    handleSignOut,
    handleSession,
    handleUpdateUser,
} from './auth';
import { handleDb } from './data';
import { handleRpc } from './rpc';
import { json, type Env } from './types';

async function readJson(request: Request): Promise<Record<string, unknown>> {
    try {
        return (await request.json()) as Record<string, unknown>;
    } catch {
        return {};
    }
}

async function handleApi(request: Request, env: Env, path: string): Promise<Response> {
    const method = request.method;

    try {
        if (path === '/api/health') {
            return json({ ok: true, backend: 'turso', hasDb: !!env.LIBSQL_DB_URL });
        }

        // ---- auth ----
        if (path === '/api/auth/signup' && method === 'POST') {
            return handleSignUp(env, await readJson(request));
        }
        if (path === '/api/auth/signin' && method === 'POST') {
            return handleSignIn(env, await readJson(request));
        }
        if (path === '/api/auth/signout' && method === 'POST') {
            return handleSignOut(env, request);
        }
        if (path === '/api/auth/session' && method === 'GET') {
            return handleSession(env, request);
        }
        if (path === '/api/auth/update' && method === 'POST') {
            return handleUpdateUser(env, request, await readJson(request));
        }

        // ---- data ----
        if (path === '/api/db' && method === 'POST') {
            const desc = await readJson(request);
            return handleDb(env, request, desc as never);
        }

        // ---- rpc ----
        if (path === '/api/rpc' && method === 'POST') {
            const body = await readJson(request);
            const fn = String(body.fn ?? '');
            const args = (body.args as Record<string, unknown>) ?? {};
            return handleRpc(env, request, fn, args);
        }

        return json({ error: 'Not found' }, 404);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return json({ error: message }, 500);
    }
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname.startsWith('/api/')) {
            return handleApi(request, env, url.pathname);
        }
        // Non-API request: fall back to static assets (SPA).
        return env.ASSETS.fetch(request);
    },
};
