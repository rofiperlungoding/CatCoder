/**
 * Turso Backend (client adapter)
 *
 * Implements the subset of the Supabase client surface the app uses, but
 * talks to the CatCoder Cloudflare Worker API (`/api/*`) which holds the
 * Turso token server-side. The session token is kept in localStorage and
 * sent as `Authorization: Bearer`.
 *
 * Selected when `VITE_BACKEND=turso` (see supabase.ts).
 */

const SESSION_KEY = 'cc_turso_session';
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '';

interface SessionUser {
    id: string;
    email: string;
    created_at: string;
    user_metadata: Record<string, unknown>;
}
interface StoredSession {
    access_token: string;
    user: SessionUser;
}

function readSession(): StoredSession | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
        return null;
    }
}

function writeSession(session: StoredSession | null): void {
    try {
        if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        else localStorage.removeItem(SESSION_KEY);
    } catch {
        /* ignore */
    }
}

async function api<T = unknown>(
    path: string,
    options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<{ ok: boolean; status: number; data: T }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.auth !== false) {
        const session = readSession();
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    let res: Response;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method: options.method ?? 'GET',
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
    } catch (err) {
        return { ok: false, status: 0, data: { error: (err as Error).message } as T };
    }
    let data: T;
    try {
        data = (await res.json()) as T;
    } catch {
        data = {} as T;
    }
    return { ok: res.ok, status: res.status, data };
}

function authErr(message: string) {
    return { message, name: 'AuthError', status: 400 } as unknown as Error;
}

/* ------------------------------------------------------------------ */
/* auth state listeners                                                */
/* ------------------------------------------------------------------ */

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'INITIAL_SESSION';
type AuthCallback = (event: AuthEvent, session: StoredSession | null) => void;
const authListeners = new Set<AuthCallback>();

function emitAuth(event: AuthEvent, session: StoredSession | null): void {
    queueMicrotask(() => authListeners.forEach((cb) => cb(event, session)));
}

interface AuthResponse {
    user?: SessionUser;
    session?: StoredSession;
    error?: string;
}

const auth = {
    async signUp(params: {
        email: string;
        password: string;
        options?: { data?: Record<string, unknown> };
    }) {
        const { ok, data } = await api<AuthResponse>('/api/auth/signup', {
            method: 'POST',
            auth: false,
            body: {
                email: params.email,
                password: params.password,
                username: params.options?.data?.username,
            },
        });
        if (!ok || !data.session) {
            return { data: { user: null, session: null }, error: authErr(data.error || 'Sign-up failed') };
        }
        writeSession(data.session);
        return { data: { user: data.session.user, session: data.session }, error: null };
    },

    async signInWithPassword(params: { email: string; password: string }) {
        const { ok, data } = await api<AuthResponse>('/api/auth/signin', {
            method: 'POST',
            auth: false,
            body: { email: params.email, password: params.password },
        });
        if (!ok || !data.session) {
            return { data: { user: null, session: null }, error: authErr(data.error || 'Invalid login credentials') };
        }
        writeSession(data.session);
        return { data: { user: data.session.user, session: data.session }, error: null };
    },

    async signInWithOAuth() {
        return {
            data: { provider: 'google', url: null },
            error: authErr('Google sign-in is not available on the Turso backend. Use email + password.'),
        };
    },

    async signInWithOtp() {
        return {
            error: authErr('Magic links are not available on the Turso backend. Use email + password.'),
        };
    },

    async resetPasswordForEmail() {
        // No mail server in this backend.
        return { data: {}, error: authErr('Password reset email is not available on the Turso backend.') };
    },

    async updateUser(attrs: { email?: string; password?: string }) {
        const { ok, data } = await api<AuthResponse>('/api/auth/update', { method: 'POST', body: attrs });
        if (!ok || !data.user) return { data: { user: null }, error: authErr(data.error || 'Update failed') };
        const session = readSession();
        if (session) writeSession({ ...session, user: data.user });
        return { data: { user: data.user }, error: null };
    },

    async signOut() {
        await api('/api/auth/signout', { method: 'POST' });
        writeSession(null);
        emitAuth('SIGNED_OUT', null);
        return { error: null };
    },

    async getSession() {
        return { data: { session: readSession() }, error: null };
    },

    async getUser() {
        const session = readSession();
        return { data: { user: session?.user ?? null }, error: null };
    },

    onAuthStateChange(cb: AuthCallback) {
        authListeners.add(cb);
        emitAuth('INITIAL_SESSION', readSession());
        return {
            data: { subscription: { unsubscribe: () => authListeners.delete(cb) } },
        };
    },
};

/* ------------------------------------------------------------------ */
/* query builder -> /api/db descriptor                                 */
/* ------------------------------------------------------------------ */

interface QueryResult {
    data: unknown;
    error: { message: string } | null;
    count: number | null;
}
type Mode = 'select' | 'insert' | 'upsert' | 'update' | 'delete';
type Row = Record<string, unknown>;

class TursoQuery implements PromiseLike<QueryResult> {
    private table: string;
    private filters: { col: string; op: string; val: unknown }[] = [];
    private orders: { col: string; asc: boolean }[] = [];
    private limitN: number | null = null;
    private mode: Mode = 'select';
    private payload: Row | Row[] | null = null;
    private wantCount = false;
    private headOnly = false;
    private singleMode: 'one' | 'maybe' | null = null;

    constructor(table: string) {
        this.table = table;
    }

    select(_cols?: string, opts?: { count?: 'exact'; head?: boolean }) {
        if (opts?.count) this.wantCount = true;
        if (opts?.head) this.headOnly = true;
        return this;
    }
    insert(payload: Row | Row[]) { this.mode = 'insert'; this.payload = payload; return this; }
    upsert(payload: Row | Row[]) { this.mode = 'upsert'; this.payload = payload; return this; }
    update(payload: Row) { this.mode = 'update'; this.payload = payload; return this; }
    delete() { this.mode = 'delete'; return this; }
    eq(col: string, val: unknown) { this.filters.push({ col, op: 'eq', val }); return this; }
    neq(col: string, val: unknown) { this.filters.push({ col, op: 'neq', val }); return this; }
    gt(col: string, val: unknown) { this.filters.push({ col, op: 'gt', val }); return this; }
    order(col: string, opts?: { ascending?: boolean }) {
        this.orders.push({ col, asc: opts?.ascending !== false });
        return this;
    }
    limit(n: number) { this.limitN = n; return this; }
    maybeSingle() { this.singleMode = 'maybe'; return this.run(); }
    single() { this.singleMode = 'one'; return this.run(); }

    then<T1 = QueryResult, T2 = never>(
        onfulfilled?: ((v: QueryResult) => T1 | PromiseLike<T1>) | null,
        onrejected?: ((r: unknown) => T2 | PromiseLike<T2>) | null
    ): PromiseLike<T1 | T2> {
        return this.run().then(onfulfilled, onrejected);
    }

    private async run(): Promise<QueryResult> {
        const descriptor = {
            table: this.table,
            filters: this.filters,
            orders: this.orders,
            limit: this.limitN,
            single: this.singleMode,
            count: this.wantCount,
            head: this.headOnly,
            mode: this.mode,
            payload: this.payload,
        };
        const { ok, data } = await api<QueryResult>('/api/db', { method: 'POST', body: descriptor });
        if (!ok) {
            const message = (data as unknown as { error?: string })?.error || 'Query failed';
            return { data: null, error: { message }, count: null };
        }
        return data;
    }
}

/* ------------------------------------------------------------------ */
/* rpc                                                                 */
/* ------------------------------------------------------------------ */

async function rpc(fn: string, args: Record<string, unknown> = {}) {
    const { ok, data } = await api<QueryResult>('/api/rpc', {
        method: 'POST',
        body: { fn, args },
    });
    if (!ok) {
        const message = (data as unknown as { error?: string })?.error || 'RPC failed';
        return { data: null, error: { message } };
    }
    return data as { data: unknown; error: { message: string } | null };
}

/* ------------------------------------------------------------------ */
/* realtime (polling — Turso has no native subscriptions)              */
/* ------------------------------------------------------------------ */

class TursoChannel {
    private name: string;
    private callbacks: (() => void)[] = [];
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(name: string) {
        this.name = name;
    }

    on(_event: string, _filter: unknown, callback: (payload: unknown) => void) {
        this.callbacks.push(() => callback({ source: this.name }));
        return this;
    }

    subscribe(cb?: (status: string) => void) {
        // Poll every 15s; consumers re-fetch on each tick.
        this.timer = setInterval(() => this.callbacks.forEach((fn) => fn()), 15000);
        cb?.('SUBSCRIBED');
        return this;
    }

    teardown() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.callbacks = [];
    }
}

/* ------------------------------------------------------------------ */
/* client assembly                                                     */
/* ------------------------------------------------------------------ */

export function createTursoBackend() {
    return {
        auth,
        from(table: string) {
            return new TursoQuery(table);
        },
        rpc,
        channel(name: string) {
            return new TursoChannel(name);
        },
        removeChannel(channel: TursoChannel) {
            channel.teardown();
            return Promise.resolve('ok');
        },
    };
}

export type TursoBackend = ReturnType<typeof createTursoBackend>;
