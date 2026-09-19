#!/usr/bin/env node
/**
 * Prune disposable/test accounts from the production Turso database — safely.
 *
 * Two phases, explicit:
 *   1. DRY-RUN (default): enumerates matching accounts, counts every child
 *      row that would be deleted, and writes a JSON backup of all rows that
 *      WOULD be deleted to backups/prune-<ts>.json. No writes happen.
 *   2. --apply: after you have reviewed the dry-run and its backup, deletes
 *      in child→parent order (app_logs → attempts → user_progress →
 *      sessions → profiles → users) and verifies zero rows remain.
 *
 * Safety properties:
 *   - Matching is an explicit prefix list (no free-form LIKE from CLI).
 *   - No reliance on ON DELETE CASCADE (foreign_keys is per-connection in
 *     libsql and not guaranteed on) — every table is deleted explicitly.
 *   - Every affected row is backed up before deletion.
 *   - --apply re-enumerates and deletes ONLY ids found at apply time, so a
 *      stale dry-run cannot delete a user that appeared meanwhile.
 *
 * Usage:
 *   node scripts/prune-test-accounts.mjs           # dry-run + backup
 *   node scripts/prune-test-accounts.mjs --apply   # delete after review
 */

import { createClient } from '@libsql/client';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');

// Identifiers that were created by automated probes/EPs during testing.
const PREFIXES = ['cc_smoke', 'cc_sec', 'cc-rl', 'cc-sec', 'prodprobe'];

const TABLES = {
    app_logs: 'user_id',
    attempts: 'user_id',
    user_progress: 'user_id',
    sessions: 'user_id',
    profiles: 'id',
    users: 'id',
};

// Child → parent order so referential integrity never dangles mid-run.
const DELETE_ORDER = ['app_logs', 'attempts', 'user_progress', 'sessions', 'profiles', 'users'];

const url = process.env.LIBSQL_DB_URL;
const token = process.env.LIBSQL_DB_AUTH_TOKEN;
if (!url || !token) {
    console.error(
        'Missing LIBSQL_DB_URL / LIBSQL_DB_AUTH_TOKEN.\n' +
            'Source them from .dev.vars first, e.g.:\n' +
            '  export $(grep -E "^(LIBSQL_DB_URL|LIBSQL_DB_AUTH_TOKEN)" .dev.vars | xargs)\n' +
            'or set them inline for a single run.'
    );
    process.exit(1);
}

const db = createClient({ url, authToken: token });

function usernameLikeClauses() {
    // users.username OR profiles.username, both matched by the prefix list.
    return PREFIXES.map(() => `username LIKE ?`).join(' OR ');
}
const prefixParams = PREFIXES.map((p) => `${p}%`);

async function findUsers() {
    const clause = usernameLikeClauses();
    const inUsers = await db.execute({
        sql: `SELECT id, email, username, created_at FROM users WHERE ${clause}`,
        args: prefixParams,
    });
    const inProfiles = await db.execute({
        sql: `SELECT id, username FROM profiles WHERE ${clause}`,
        args: prefixParams,
    });
    const map = new Map();
    for (const r of inUsers.rows) {
        map.set(r.id, { id: r.id, email: r.email, username: r.username, created_at: r.created_at });
    }
    for (const r of inProfiles.rows) {
        if (!map.has(r.id)) {
            map.set(r.id, { id: r.id, email: null, username: r.username, created_at: null });
        }
    }
    return [...map.values()];
}

async function childCounts(ids) {
    const out = {};
    for (const t of ['app_logs', 'attempts', 'user_progress', 'sessions']) {
        const ph = ids.map(() => '?').join(',');
        const res = await db.execute({
            sql: `SELECT COUNT(*) AS n FROM ${t} WHERE user_id IN (${ph})`,
            args: ids,
        });
        out[t] = Number(res.rows[0].n);
    }
    return out;
}

async function snapshotRows(ids) {
    const backup = { captured_at: new Date().toISOString(), prefixes: PREFIXES, users: {}, children: {} };
    const ph = ids.map(() => '?').join(',');
    for (const [table, col] of Object.entries(TABLES)) {
        const res = await db.execute({
            sql: `SELECT * FROM ${table} WHERE ${col} IN (${ph})`,
            args: ids,
        });
        if (table === 'users') {
            backup.users = { columns: res.columns, rows: res.rows };
        } else {
            backup.children[table] = { columns: res.columns, rows: res.rows };
        }
    }
    return backup;
}

async function main() {
    console.log(`Mode: ${APPLY ? '🟢 APPLY' : '🔍 DRY-RUN (no writes — use --apply after review)'}`);

    const users = await findUsers();
    if (users.length === 0) {
        console.log('No matching accounts found. Nothing to do. ✅');
        return;
    }

    console.log(`\nMatched ${users.length} account(s):`);
    for (const u of users) {
        console.log(
            `  - ${u.username}  id=${u.id}  email=${u.email ?? '(profile only)'}  created=${u.created_at ?? '?'}`
        );
    }

    const ids = users.map((u) => String(u.id));
    const counts = await childCounts(ids);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log('\nChild rows that would be deleted:');
    for (const [t, n] of Object.entries(counts)) console.log(`  ${t.padEnd(14)} ${n}`);
    console.log(`  ${'TOTAL'.padEnd(14)} ${total}`);

    const backup = await snapshotRows(ids);
    mkdirSync('backups', { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = join('backups', `prune-${stamp}.json`);
    writeFileSync(file, JSON.stringify(backup, null, 2));
    console.log(`\nBackup written: ${file} (contains every row that is/was deletable)`);

    if (!APPLY) {
        console.log('\nDRY-RUN COMPLETE — nothing deleted.');
        console.log(`Review the backup, then run:  node scripts/prune-test-accounts.mjs --apply`);
        return;
    }

    // ── APPLY ──
    console.log('\nDeleting (child → parent)…');
    for (const table of DELETE_ORDER) {
        const col = TABLES[table];
        // Chunked delete (SQLite max variables) — only ids enumerated NOW.
        for (let i = 0; i < ids.length; i += 25) {
            const chunk = ids.slice(i, i + 25);
            const ph = chunk.map(() => '?').join(',');
            const res = await db.execute({
                sql: `DELETE FROM ${table} WHERE ${col} IN (${ph})`,
                args: chunk,
            });
            console.log(`  ${table.padEnd(14)} deleted=${res.rowsAffected}`);
        }
    }

    console.log('\nVerifying…');
    let leftovers = 0;
    for (const [table, col] of Object.entries(TABLES)) {
        const ph = ids.map(() => '?').join(',');
        const res = await db.execute({
            sql: `SELECT COUNT(*) AS n FROM ${table} WHERE ${col} IN (${ph})`,
        args: ids,
        });
        const n = Number(res.rows[0].n);
        leftovers += n;
        console.log(`  ${table.padEnd(14)} remaining=${n}`);
    }

    if (leftovers === 0) {
        console.log('\n✅ PRUNE COMPLETE — all matched rows removed, zero leftovers.');
    } else {
        console.error(`\n❌ ${leftovers} row(s) remain — inspect manually before retrying.`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('prune failed:', err);
    process.exit(1);
});
