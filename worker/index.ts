import {
    handleSignUp,
    handleSignIn,
    handleSignOut,
    handleSession,
    handleUpdateUser,
} from './auth';
import { handleDb } from './data';
import { handleRpc } from './rpc';
import { handleProblem } from './arena/problem';
import { handleJudge } from './arena/judge';
import { handleLeaderboard } from './arena/leaderboard';
import { handleSkill } from './arena/skill';
import { handleOptions } from './shared/cors';
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
        if (path === '/api/health' && method === 'GET') {
            return json({ status: 'ok' });
        }

        if (path === '/api/arena/problem') {
            if (method === 'OPTIONS') return handleOptions(env.ALLOWED_ORIGIN);
            return handleProblem(request, env);
        }
        if (path === '/api/arena/judge') {
            if (method === 'OPTIONS') return handleOptions(env.ALLOWED_ORIGIN);
            return handleJudge(request, env);
        }
        if (path === '/api/arena/leaderboard') {
            if (method === 'OPTIONS') return handleOptions(env.ALLOWED_ORIGIN);
            return handleLeaderboard(request, env);
        }
        if (path === '/api/arena/skill') {
            if (method === 'OPTIONS') return handleOptions(env.ALLOWED_ORIGIN);
            return handleSkill(request, env);
        }

        if (path === '/api/auth/signup' && method === 'POST') {
            return handleSignUp(env, await readJson(request));
        }
        if (path === '/api/auth/signin' && method === 'POST') {
            return handleSignIn(env, await readJson(request), request);
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

        if (path === '/api/db' && method === 'POST') {
            const desc = await readJson(request);
            return handleDb(env, request, desc as never);
        }

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
        return env.ASSETS.fetch(request);
    },
};
