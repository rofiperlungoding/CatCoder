/**
 * Auth endpoints for the Turso-backed Worker. Email + password only.
 *
 * Session model: an opaque random token stored in the `sessions` table and
 * returned to the client, which sends it back as `Authorization: Bearer`.
 */

import type { Client } from '@libsql/client/web';
import { getClient, queryOne, run } from './db';
import { hashPassword, verifyPassword, newToken, newId } from './crypto';
import { json, SESSION_TTL_MS, type Env, type UserRow, type SessionRow } from './types';

function sessionUser(user: UserRow) {
    return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: { username: user.username },
    };
}

async function createSession(client: Client, userId: string) {
    const token = newToken();
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_TTL_MS);
    await run(
        client,
        'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [token, userId, now.toISOString(), expires.toISOString()]
    );
    return { access_token: token, expires_at: expires.toISOString() };
}

export async function getUserFromRequest(client: Client, request: Request): Promise<UserRow | null> {
    const auth = request.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return null;
    const session = (await queryOne(client, 'SELECT * FROM sessions WHERE token = ?', [token])) as
        | SessionRow
        | null;
    if (!session) return null;
    if (new Date(session.expires_at).getTime() < Date.now()) {
        await run(client, 'DELETE FROM sessions WHERE token = ?', [token]);
        return null;
    }
    return (await queryOne(client, 'SELECT * FROM users WHERE id = ?', [session.user_id])) as
        | UserRow
        | null;
}

export async function handleSignUp(env: Env, body: { email?: string; password?: string; username?: string }) {
    const client = getClient(env);
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    if (!email || !password) return json({ error: 'Email and password are required' }, 400);
    if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400);

    const existing = await queryOne(client, 'SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return json({ error: 'User already registered' }, 409);

    const id = newId();
    const username = (body.username || email.split('@')[0] || 'User').trim();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    await run(
        client,
        'INSERT INTO users (id, email, password_hash, username, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, email, passwordHash, username, now]
    );
    await run(
        client,
        'INSERT INTO profiles (id, username, xp, level, rank, streak_current, streak_best, created_at) VALUES (?, ?, 0, 1, ?, 0, 0, ?)',
        [id, username, 'bronze', now]
    );

    const session = await createSession(client, id);
    const user = { id, email, password_hash: passwordHash, username, created_at: now };
    return json({ user: sessionUser(user), session: { ...session, user: sessionUser(user) } });
}

export async function handleSignIn(env: Env, body: { email?: string; password?: string }) {
    const client = getClient(env);
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const user = (await queryOne(client, 'SELECT * FROM users WHERE email = ?', [email])) as
        | UserRow
        | null;
    if (!user || !(await verifyPassword(password, user.password_hash))) {
        return json({ error: 'Invalid login credentials' }, 401);
    }
    const session = await createSession(client, user.id);
    return json({ user: sessionUser(user), session: { ...session, user: sessionUser(user) } });
}

export async function handleSignOut(env: Env, request: Request) {
    const client = getClient(env);
    const auth = request.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (token) await run(client, 'DELETE FROM sessions WHERE token = ?', [token]);
    return json({ success: true });
}

export async function handleSession(env: Env, request: Request) {
    const client = getClient(env);
    const user = await getUserFromRequest(client, request);
    return json({ session: user ? { user: sessionUser(user) } : null });
}

export async function handleUpdateUser(
    env: Env,
    request: Request,
    body: { email?: string; password?: string }
) {
    const client = getClient(env);
    const user = await getUserFromRequest(client, request);
    if (!user) return json({ error: 'Not authenticated' }, 401);
    if (body.email) {
        await run(client, 'UPDATE users SET email = ? WHERE id = ?', [
            body.email.trim().toLowerCase(),
            user.id,
        ]);
    }
    if (body.password) {
        await run(client, 'UPDATE users SET password_hash = ? WHERE id = ?', [
            await hashPassword(body.password),
            user.id,
        ]);
    }
    const fresh = (await queryOne(client, 'SELECT * FROM users WHERE id = ?', [user.id])) as unknown as UserRow;
    return json({ user: sessionUser(fresh) });
}
