import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'drizzle-kit';

function loadEnv(): Record<string, string> {
    const out: Record<string, string> = { ...process.env } as Record<string, string>;
    try {
        const raw = readFileSync(resolve(process.cwd(), '.dev.vars'), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
            if (m && !out[m[1]]) out[m[1]] = m[2];
        }
    } catch {
        return out;
    }
    return out;
}

const env = loadEnv();

export default defineConfig({
    schema: './db/schema.ts',
    out: './drizzle',
    dialect: 'turso',
    dbCredentials: {
        url: env.LIBSQL_DB_URL ?? '',
        authToken: env.LIBSQL_DB_AUTH_TOKEN ?? '',
    },
});
