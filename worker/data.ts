/**
 * Safe, allowlist-based query executor for the `/api/db` endpoint.
 *
 * The client adapter serializes its query builder into a descriptor; this
 * module turns it into parameterized SQL. Only known tables/columns are
 * allowed and writes are scoped to the authenticated user, so the client can
 * never run arbitrary SQL or touch another user's rows.
 */

import type { Client } from '@libsql/client/web';
import { getClient, queryAll, queryOne, run } from './db';
import { getUserFromRequest } from './auth';
import { json, type Env, type UserRow } from './types';

const COLUMNS: Record<string, string[]> = {
    profiles: [
        'id', 'username', 'avatar_url', 'xp', 'level', 'rank',
        'streak_current', 'streak_best', 'created_at', 'last_activity_date',
    ],
    user_progress: [
        'id', 'user_id', 'content_type', 'content_id', 'status',
        'score', 'duration_seconds', 'completed_at', 'created_at',
    ],
};

const OPS: Record<string, string> = { eq: '=', neq: '!=', gt: '>' };

interface Filter { col: string; op: string; val: unknown }
interface Order { col: string; asc: boolean }
interface Descriptor {
    table: string;
    filters?: Filter[];
    orders?: Order[];
    limit?: number | null;
    single?: 'one' | 'maybe' | null;
    count?: boolean;
    head?: boolean;
    mode: 'select' | 'insert' | 'upsert' | 'update' | 'delete';
    payload?: Record<string, unknown> | Record<string, unknown>[];
}

function assertTable(table: string): string[] {
    const cols = COLUMNS[table];
    if (!cols) throw new Error(`Table not allowed: ${table}`);
    return cols;
}

function buildWhere(cols: string[], filters: Filter[] = []): { sql: string; args: unknown[] } {
    if (filters.length === 0) return { sql: '', args: [] };
    const parts: string[] = [];
    const args: unknown[] = [];
    for (const f of filters) {
        if (!cols.includes(f.col) || !OPS[f.op]) throw new Error(`Bad filter: ${f.col} ${f.op}`);
        parts.push(`${f.col} ${OPS[f.op]} ?`);
        args.push(f.val);
    }
    return { sql: ` WHERE ${parts.join(' AND ')}`, args };
}

export async function handleDb(env: Env, request: Request, desc: Descriptor): Promise<Response> {
    const client = getClient(env);
    const cols = assertTable(desc.table);

    if (desc.mode === 'select') {
        return runSelect(client, desc, cols);
    }

    // Writes require authentication and are scoped to the caller.
    const user = await getUserFromRequest(client, request);
    if (!user) return json({ error: 'Not authenticated' }, 401);
    return runWrite(client, desc, cols, user);
}

async function runSelect(client: Client, desc: Descriptor, cols: string[]): Promise<Response> {
    const where = buildWhere(cols, desc.filters);

    if (desc.head && desc.count) {
        const row = await queryOne(client, `SELECT COUNT(*) as c FROM ${desc.table}${where.sql}`, where.args);
        return json({ data: null, error: null, count: Number(row?.c ?? 0) });
    }

    let sql = `SELECT * FROM ${desc.table}${where.sql}`;
    if (desc.orders && desc.orders.length > 0) {
        const order = desc.orders
            .filter((o) => cols.includes(o.col))
            .map((o) => `${o.col} ${o.asc ? 'ASC' : 'DESC'}`)
            .join(', ');
        if (order) sql += ` ORDER BY ${order}`;
    }
    if (desc.limit != null) sql += ` LIMIT ${Math.max(0, Math.min(1000, desc.limit | 0))}`;

    const rows = await queryAll(client, sql, where.args);
    if (desc.single === 'one') {
        if (rows.length === 0) return json({ data: null, error: { message: 'No rows found' }, count: null });
        return json({ data: rows[0], error: null, count: null });
    }
    if (desc.single === 'maybe') {
        return json({ data: rows[0] ?? null, error: null, count: null });
    }
    return json({ data: rows, error: null, count: desc.count ? rows.length : null });
}

async function runWrite(
    client: Client,
    desc: Descriptor,
    cols: string[],
    user: UserRow
): Promise<Response> {
    const items = Array.isArray(desc.payload) ? desc.payload : desc.payload ? [desc.payload] : [];

    if (desc.mode === 'insert' || desc.mode === 'upsert') {
        for (const raw of items) {
            const item = scopeToUser(desc.table, { ...raw }, user);
            const keys = Object.keys(item).filter((k) => cols.includes(k));
            const placeholders = keys.map(() => '?').join(', ');
            const args = keys.map((k) => item[k]);
            const conflict =
                desc.mode === 'upsert'
                    ? ` ON CONFLICT(${desc.table === 'profiles' ? 'id' : 'user_id, content_type, content_id'}) DO UPDATE SET ${keys
                          .filter((k) => k !== 'id')
                          .map((k) => `${k}=excluded.${k}`)
                          .join(', ')}`
                    : '';
            await run(
                client,
                `INSERT INTO ${desc.table} (${keys.join(', ')}) VALUES (${placeholders})${conflict}`,
                args
            );
        }
        return json({ data: items, error: null, count: null });
    }

    if (desc.mode === 'update') {
        const payload = scopeToUser(desc.table, { ...(items[0] ?? {}) }, user);
        const keys = Object.keys(payload).filter((k) => cols.includes(k) && k !== 'id');
        if (keys.length === 0) return json({ data: [], error: null, count: null });
        const setSql = keys.map((k) => `${k} = ?`).join(', ');
        const where = buildOwnedWhere(desc, cols, user);
        await run(client, `UPDATE ${desc.table} SET ${setSql}${where.sql}`, [
            ...keys.map((k) => payload[k]),
            ...where.args,
        ]);
        return json({ data: [], error: null, count: null });
    }

    if (desc.mode === 'delete') {
        const where = buildOwnedWhere(desc, cols, user);
        await run(client, `DELETE FROM ${desc.table}${where.sql}`, where.args);
        return json({ data: null, error: null, count: null });
    }

    return json({ error: 'Unsupported write' }, 400);
}

/** Force ownership columns so a caller can only write their own rows. */
function scopeToUser(table: string, item: Record<string, unknown>, user: UserRow) {
    if (table === 'profiles') item.id = user.id;
    if (table === 'user_progress') item.user_id = user.id;
    return item;
}

/** Add an ownership filter to update/delete WHERE clauses. */
function buildOwnedWhere(desc: Descriptor, cols: string[], user: UserRow) {
    const ownCol = desc.table === 'profiles' ? 'id' : 'user_id';
    const filters: Filter[] = [
        ...(desc.filters ?? []).filter((f) => f.col !== ownCol),
        { col: ownCol, op: 'eq', val: user.id },
    ];
    return buildWhere(cols, filters);
}
