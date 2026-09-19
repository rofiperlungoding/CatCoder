import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql/web';
import type { Env } from '../worker/types';

export function getDb(env: Env) {
    const url = env.LIBSQL_DB_URL?.trim();
    if (!url) throw new Error('LIBSQL_DB_URL is not configured');
    const authToken = env.LIBSQL_DB_AUTH_TOKEN?.trim();
    if (!authToken) throw new Error('LIBSQL_DB_AUTH_TOKEN is not configured');
    const client = createClient({ url, authToken });
    return drizzle({ client });
}
