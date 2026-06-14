/**
 * Local Backend
 *
 * A zero-dependency, localStorage-backed stand-in for the subset of the
 * Supabase JS client this app uses (auth, table queries, RPC, and realtime
 * channels). It lets the whole app run and be tested without provisioning a
 * Supabase project.
 *
 * Activated from `supabase.ts` when `VITE_BACKEND=local` or when no real
 * Supabase credentials are present. NOT for production — passwords are stored
 * lightly obfuscated in localStorage and there is no server enforcement.
 */

import { calculateLevel, getRank } from './utils';

type Row = Record<string, unknown>;

const KEYS = {
    users: 'cc_local_users',
    session: 'cc_local_session',
    profiles: 'cc_local_profiles',
    progress: 'cc_local_progress',
    events: 'cc_local_events',
} as const;

function uid(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function read<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function write(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* quota / unavailable — ignore in local mode */
    }
}

/* ------------------------------------------------------------------ */
/* table accessors                                                     */
/* ------------------------------------------------------------------ */

function loadTable(table: string): Row[] {
    if (table === 'profiles') return read<Row[]>(KEYS.profiles, []);
    if (table === 'user_progress') return read<Row[]>(KEYS.progress, []);
    return read<Row[]>(`cc_local_${table}`, []);
}

function saveTable(table: string, rows: Row[]): void {
    if (table === 'profiles') write(KEYS.profiles, rows);
    else if (table === 'user_progress') write(KEYS.progress, rows);
    else write(`cc_local_${table}`, rows);
    notifyTableChange(table);
}

/* ------------------------------------------------------------------ */
/* realtime pub-sub (table -> listeners)                               */
/* ------------------------------------------------------------------ */

type ChangeListener = () => void;
const tableListeners = new Map<string, Set<ChangeListener>>();

function notifyTableChange(table: string): void {
    const set = tableListeners.get(table);
    if (!set) return;
    // Defer so the writer's synchronous flow finishes first.
    queueMicrotask(() => set.forEach((fn) => fn()));
}

/* ------------------------------------------------------------------ */
/* auth types                                                          */
/* ------------------------------------------------------------------ */

interface StoredUser {
    id: string;
    email: string;
    secret: string; // base64(password) — local only, never secure
    created_at: string;
    user_metadata: Record<string, unknown>;
}

interface SessionUser {
    id: string;
    email: string;
    created_at: string;
    user_metadata: Record<string, unknown>;
}

interface LocalSession {
    access_token: string;
    user: SessionUser;
}

function obfuscate(pw: string): string {
    try {
        return btoa(unescape(encodeURIComponent(pw)));
    } catch {
        return pw;
    }
}

function toSessionUser(u: StoredUser): SessionUser {
    return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        user_metadata: u.user_metadata,
    };
}

function getStoredSession(): LocalSession | null {
    return read<LocalSession | null>(KEYS.session, null);
}

function setStoredSession(session: LocalSession | null): void {
    write(KEYS.session, session);
}

/* ------------------------------------------------------------------ */
/* auth state change listeners                                         */
/* ------------------------------------------------------------------ */

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'PASSWORD_RECOVERY' | 'INITIAL_SESSION';
type AuthCallback = (event: AuthEvent, session: LocalSession | null) => void;
const authListeners = new Set<AuthCallback>();

function emitAuth(event: AuthEvent, session: LocalSession | null): void {
    queueMicrotask(() => authListeners.forEach((cb) => cb(event, session)));
}

function authErr(message: string) {
    return { message, name: 'AuthError', status: 400 } as unknown as Error;
}

function ensureProfile(userId: string, username: string, avatarUrl?: string): void {
    const profiles = loadTable('profiles');
    if (profiles.some((p) => p.id === userId)) return;
    profiles.push({
        id: userId,
        username,
        avatar_url: avatarUrl ?? null,
        xp: 0,
        level: 1,
        rank: 'bronze',
        streak_current: 0,
        streak_best: 0,
        created_at: new Date().toISOString(),
        last_activity_date: null,
    });
    saveTable('profiles', profiles);
}

/* ------------------------------------------------------------------ */
/* auth API                                                            */
/* ------------------------------------------------------------------ */

const auth = {
    async signUp(params: {
        email: string;
        password: string;
        options?: { data?: Record<string, unknown> };
    }) {
        const users = read<StoredUser[]>(KEYS.users, []);
        if (users.some((u) => u.email.toLowerCase() === params.email.toLowerCase())) {
            return { data: { user: null, session: null }, error: authErr('User already registered') };
        }
        const username =
            (params.options?.data?.username as string) ||
            params.email.split('@')[0] ||
            'User';
        const newUser: StoredUser = {
            id: uid(),
            email: params.email,
            secret: obfuscate(params.password),
            created_at: new Date().toISOString(),
            user_metadata: { username, ...(params.options?.data ?? {}) },
        };
        users.push(newUser);
        write(KEYS.users, users);
        ensureProfile(newUser.id, username);

        // Local mode auto-confirms: hand back a live session immediately.
        const session: LocalSession = { access_token: `local.${newUser.id}`, user: toSessionUser(newUser) };
        setStoredSession(session);
        return { data: { user: session.user, session }, error: null };
    },

    async signInWithPassword(params: { email: string; password: string }) {
        const users = read<StoredUser[]>(KEYS.users, []);
        const user = users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
        if (!user || user.secret !== obfuscate(params.password)) {
            return { data: { user: null, session: null }, error: authErr('Invalid login credentials') };
        }
        const session: LocalSession = { access_token: `local.${user.id}`, user: toSessionUser(user) };
        setStoredSession(session);
        return { data: { user: session.user, session }, error: null };
    },

    async signInWithOAuth() {
        return {
            data: { provider: 'google', url: null },
            error: authErr('Google sign-in needs a real Supabase backend. Use email + password in local mode.'),
        };
    },

    async signInWithOtp() {
        return {
            error: authErr('Magic links need a real Supabase backend. Use email + password in local mode.'),
        };
    },

    async resetPasswordForEmail() {
        // Pretend success — there is no mail server locally.
        return { data: {}, error: null };
    },

    async updateUser(attrs: { email?: string; password?: string }) {
        const session = getStoredSession();
        if (!session) return { data: { user: null }, error: authErr('Not authenticated') };
        const users = read<StoredUser[]>(KEYS.users, []);
        const user = users.find((u) => u.id === session.user.id);
        if (!user) return { data: { user: null }, error: authErr('User not found') };
        if (attrs.email) user.email = attrs.email;
        if (attrs.password) user.secret = obfuscate(attrs.password);
        write(KEYS.users, users);
        const updated: LocalSession = { ...session, user: toSessionUser(user) };
        setStoredSession(updated);
        return { data: { user: updated.user }, error: null };
    },

    async signOut() {
        setStoredSession(null);
        emitAuth('SIGNED_OUT', null);
        return { error: null };
    },

    async getSession() {
        return { data: { session: getStoredSession() }, error: null };
    },

    async getUser() {
        const session = getStoredSession();
        return { data: { user: session?.user ?? null }, error: null };
    },

    onAuthStateChange(cb: AuthCallback) {
        authListeners.add(cb);
        // Mirror Supabase: emit the current session asynchronously.
        emitAuth('INITIAL_SESSION', getStoredSession());
        return {
            data: {
                subscription: {
                    unsubscribe() {
                        authListeners.delete(cb);
                    },
                },
            },
        };
    },
};

/* ------------------------------------------------------------------ */
/* query builder                                                       */
/* ------------------------------------------------------------------ */

interface QueryResult {
    data: unknown;
    error: { message: string } | null;
    count: number | null;
}

type Filter = (row: Row) => boolean;
type Mode = 'select' | 'insert' | 'upsert' | 'update' | 'delete';

class LocalQuery implements PromiseLike<QueryResult> {
    private table: string;
    private filters: Filter[] = [];
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
        if (this.mode === 'select') this.mode = 'select';
        if (opts?.count) this.wantCount = true;
        if (opts?.head) this.headOnly = true;
        return this;
    }

    insert(payload: Row | Row[]) {
        this.mode = 'insert';
        this.payload = payload;
        return this;
    }

    upsert(payload: Row | Row[]) {
        this.mode = 'upsert';
        this.payload = payload;
        return this;
    }

    update(payload: Row) {
        this.mode = 'update';
        this.payload = payload;
        return this;
    }

    delete() {
        this.mode = 'delete';
        return this;
    }

    eq(col: string, value: unknown) {
        this.filters.push((r) => r[col] === value);
        return this;
    }

    neq(col: string, value: unknown) {
        this.filters.push((r) => r[col] !== value);
        return this;
    }

    gt(col: string, value: unknown) {
        this.filters.push((r) => (r[col] as number) > (value as number));
        return this;
    }

    order(col: string, opts?: { ascending?: boolean }) {
        this.orders.push({ col, asc: opts?.ascending !== false });
        return this;
    }

    limit(n: number) {
        this.limitN = n;
        return this;
    }

    maybeSingle() {
        this.singleMode = 'maybe';
        return this.run();
    }

    single() {
        this.singleMode = 'one';
        return this.run();
    }

    then<TResult1 = QueryResult, TResult2 = never>(
        onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
        return this.run().then(onfulfilled, onrejected);
    }

    private applyFilters(rows: Row[]): Row[] {
        return rows.filter((r) => this.filters.every((f) => f(r)));
    }

    private applyOrder(rows: Row[]): Row[] {
        if (this.orders.length === 0) return rows;
        const sorted = [...rows];
        sorted.sort((a, b) => {
            for (const { col, asc } of this.orders) {
                const av = a[col];
                const bv = b[col];
                if (av === bv) continue;
                if (av === undefined || av === null) return asc ? -1 : 1;
                if (bv === undefined || bv === null) return asc ? 1 : -1;
                const cmp = av < bv ? -1 : 1;
                return asc ? cmp : -cmp;
            }
            return 0;
        });
        return sorted;
    }

    private async run(): Promise<QueryResult> {
        try {
            const rows = loadTable(this.table);

            if (this.mode === 'select') {
                let result = this.applyFilters(rows);
                result = this.applyOrder(result);
                if (this.limitN !== null) result = result.slice(0, this.limitN);

                if (this.headOnly) {
                    return { data: null, error: null, count: this.applyFilters(rows).length };
                }
                if (this.singleMode === 'one') {
                    if (result.length === 0) {
                        return { data: null, error: { message: 'No rows found' }, count: null };
                    }
                    return { data: result[0], error: null, count: null };
                }
                if (this.singleMode === 'maybe') {
                    return { data: result[0] ?? null, error: null, count: null };
                }
                return {
                    data: result,
                    error: null,
                    count: this.wantCount ? this.applyFilters(rows).length : null,
                };
            }

            if (this.mode === 'insert' || this.mode === 'upsert') {
                const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
                const next = [...rows];
                const written: Row[] = [];
                for (const item of items) {
                    const row = { ...item };
                    if (!('id' in row) || row.id == null) row.id = uid();
                    const idx = next.findIndex((r) => r.id === row.id);
                    if (idx >= 0 && this.mode === 'upsert') {
                        next[idx] = { ...next[idx], ...row };
                        written.push(next[idx]);
                    } else {
                        next.push(row);
                        written.push(row);
                    }
                }
                saveTable(this.table, next);
                return { data: written, error: null, count: null };
            }

            if (this.mode === 'update') {
                const next = rows.map((r) =>
                    this.filters.every((f) => f(r)) ? { ...r, ...(this.payload as Row) } : r
                );
                saveTable(this.table, next);
                return { data: next.filter((r) => this.filters.every((f) => f(r))), error: null, count: null };
            }

            if (this.mode === 'delete') {
                const remaining = rows.filter((r) => !this.filters.every((f) => f(r)));
                saveTable(this.table, remaining);
                return { data: null, error: null, count: null };
            }

            return { data: null, error: { message: 'Unsupported query' }, count: null };
        } catch (err) {
            return { data: null, error: { message: (err as Error).message }, count: null };
        }
    }
}

/* ------------------------------------------------------------------ */
/* RPC implementations                                                 */
/* ------------------------------------------------------------------ */

const XP_BY_TYPE: Record<string, number> = { lesson: 50, problem: 100, challenge: 25 };

function completeContent(args: Record<string, unknown>) {
    const session = getStoredSession();
    if (!session) {
        return { data: { success: false, error: 'Not authenticated' }, error: null };
    }
    const userId = session.user.id;
    const contentType = String(args.p_content_type ?? '');
    const contentId = String(args.p_content_id ?? '');

    const progress = loadTable('user_progress');
    const dup = progress.find(
        (p) =>
            p.user_id === userId &&
            p.content_id === contentId &&
            p.content_type === contentType &&
            p.status === 'completed'
    );

    const profiles = loadTable('profiles');
    let profile = profiles.find((p) => p.id === userId);
    if (!profile) {
        ensureProfile(userId, (session.user.user_metadata?.username as string) ?? 'User');
        profile = loadTable('profiles').find((p) => p.id === userId)!;
    }

    if (dup) {
        return {
            data: {
                success: true,
                xp_awarded: 0,
                message: 'Already completed',
                new_xp: profile.xp as number,
                new_level: profile.level as number,
                new_rank: profile.rank as string,
                new_streak_current: profile.streak_current as number,
                new_streak_best: profile.streak_best as number,
            },
            error: null,
        };
    }

    const xp = XP_BY_TYPE[contentType] ?? 25;
    const now = new Date().toISOString();
    progress.push({
        id: uid(),
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        status: 'completed',
        score: xp,
        completed_at: now,
        created_at: now,
    });
    saveTable('user_progress', progress);

    const allProfiles = loadTable('profiles');
    const target = allProfiles.find((p) => p.id === userId)!;
    const newXp = (Number(target.xp) || 0) + xp;
    target.xp = newXp;
    target.level = calculateLevel(newXp);
    target.rank = getRank(newXp);
    saveTable('profiles', allProfiles);

    return {
        data: {
            success: true,
            xp_awarded: xp,
            new_xp: newXp,
            new_level: target.level as number,
            new_rank: target.rank as string,
            new_streak_current: target.streak_current as number,
            new_streak_best: target.streak_best as number,
        },
        error: null,
    };
}

async function rpc(fn: string, args: Record<string, unknown> = {}) {
    switch (fn) {
        case 'submit_completion':
        case 'validate_and_complete':
            return completeContent(args);
        case 'get_server_time':
            return {
                data: { server_time_ms: Date.now(), server_time_iso: new Date().toISOString() },
                error: null,
            };
        case 'register_device_session':
            return { data: { success: true, session_id: 'local-session' }, error: null };
        case 'verify_device_fingerprint':
            return { data: { success: true, valid: true }, error: null };
        case 'invalidate_all_sessions':
            return { data: { success: true, sessions_invalidated: 0 }, error: null };
        case 'log_security_event':
        case 'log_app_error': {
            const events = read<Row[]>(KEYS.events, []);
            events.push({ id: uid(), fn, args, at: new Date().toISOString() });
            write(KEYS.events, events.slice(-200));
            return { data: { success: true, log_id: uid() }, error: null };
        }
        default:
            return { data: null, error: { message: `Unknown RPC: ${fn}` } };
    }
}

/* ------------------------------------------------------------------ */
/* realtime channel                                                    */
/* ------------------------------------------------------------------ */

interface ChannelConfig {
    table: string;
    listener: ChangeListener;
}

class LocalChannel {
    private name: string;
    private bindings: ChannelConfig[] = [];

    constructor(name: string) {
        this.name = name;
    }

    on(
        _event: string,
        filter: { table?: string },
        callback: (payload: unknown) => void
    ) {
        const table = filter?.table ?? '';
        const listener = () => callback({ table, eventType: 'UPDATE' });
        this.bindings.push({ table, listener });
        return this;
    }

    subscribe(cb?: (status: string) => void) {
        for (const b of this.bindings) {
            if (!tableListeners.has(b.table)) tableListeners.set(b.table, new Set());
            tableListeners.get(b.table)!.add(b.listener);
        }
        cb?.('SUBSCRIBED');
        return this;
    }

    teardown() {
        for (const b of this.bindings) {
            tableListeners.get(b.table)?.delete(b.listener);
        }
        this.bindings = [];
    }

    get channelName() {
        return this.name;
    }
}

/* ------------------------------------------------------------------ */
/* demo seed (so the leaderboard isn't empty on a fresh install)       */
/* ------------------------------------------------------------------ */

function seedIfEmpty(): void {
    const profiles = loadTable('profiles');
    if (profiles.length > 0) return;
    const demo = [
        { username: 'ada_lovelace', xp: 4200 },
        { username: 'grace_hopper', xp: 3100 },
        { username: 'linus_t', xp: 2050 },
        { username: 'margaret_h', xp: 1500 },
        { username: 'dennis_r', xp: 800 },
    ];
    const seeded = demo.map((d) => ({
        id: uid(),
        username: d.username,
        avatar_url: null,
        xp: d.xp,
        level: calculateLevel(d.xp),
        rank: getRank(d.xp),
        streak_current: 0,
        streak_best: 0,
        created_at: new Date().toISOString(),
        last_activity_date: null,
    }));
    write(KEYS.profiles, seeded);
}

/* ------------------------------------------------------------------ */
/* client assembly                                                     */
/* ------------------------------------------------------------------ */

export function createLocalBackend() {
    seedIfEmpty();
    return {
        auth,
        from(table: string) {
            return new LocalQuery(table);
        },
        rpc,
        channel(name: string) {
            return new LocalChannel(name);
        },
        removeChannel(channel: LocalChannel) {
            channel.teardown();
            return Promise.resolve('ok');
        },
    };
}

export type LocalBackend = ReturnType<typeof createLocalBackend>;
