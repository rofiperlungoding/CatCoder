/**
 * Turso/libSQL client factory + small query helpers for the Worker.
 *
 * IMPORTANT: import from '@libsql/client/web' — the non-web build does not run
 * in the Cloudflare Workers runtime.
 */

import { createClient, type Client } from '@libsql/client/web';
import type { Env } from './types';

export function getClient(env: Env): Client {
    const url = env.LIBSQL_DB_URL?.trim();
    if (!url) throw new Error('LIBSQL_DB_URL is not configured');
    const authToken = env.LIBSQL_DB_AUTH_TOKEN?.trim();
    if (!authToken) throw new Error('LIBSQL_DB_AUTH_TOKEN is not configured');
    return createClient({ url, authToken });
}

type Row = Record<string, unknown>;

export async function queryOne(
    client: Client,
    sql: string,
    args: unknown[] = []
): Promise<Row | null> {
    const rs = await client.execute({ sql, args: args as never[] });
    return (rs.rows[0] as unknown as Row) ?? null;
}

export async function queryAll(
    client: Client,
    sql: string,
    args: unknown[] = []
): Promise<Row[]> {
    const rs = await client.execute({ sql, args: args as never[] });
    return rs.rows as unknown as Row[];
}

export async function run(
    client: Client,
    sql: string,
    args: unknown[] = []
): Promise<void> {
    await client.execute({ sql, args: args as never[] });
}
