/**
 * One-off: apply worker/schema.sql to the Turso database.
 *
 * Reads credentials from .dev.vars so the token never touches argv/history.
 * Run: node scripts/apply-schema.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseDevVars() {
    const raw = readFileSync(resolve(root, '.dev.vars'), 'utf8');
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
        if (m) out[m[1]] = m[2];
    }
    return out;
}

const vars = parseDevVars();
const url = vars.LIBSQL_DB_URL;
const authToken = vars.LIBSQL_DB_AUTH_TOKEN;
if (!url || !authToken) {
    console.error('Missing LIBSQL_DB_URL or LIBSQL_DB_AUTH_TOKEN in .dev.vars');
    process.exit(1);
}

const schema = readFileSync(resolve(root, 'worker/schema.sql'), 'utf8');
const statements = schema
    .split(';')
    // Strip comment-only lines inside each chunk, then keep non-empty SQL.
    .map((s) =>
        s
            .split(/\r?\n/)
            .filter((line) => !line.trim().startsWith('--'))
            .join('\n')
            .trim()
    )
    .filter((s) => s.length > 0);

const client = createClient({ url, authToken });

let ok = 0;
for (const stmt of statements) {
    try {
        await client.execute(stmt);
        ok++;
    } catch (err) {
        console.error('FAILED:', stmt.split('\n')[0], '\n ->', err.message);
        process.exit(1);
    }
}

// Verify the tables exist.
const rs = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log(`Applied ${ok} statements.`);
console.log('Tables:', rs.rows.map((r) => r.name).join(', '));
