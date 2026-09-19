#!/usr/bin/env node
/**
 * Post-deploy production probe — verifies every abuse guard is live.
 *
 *   node scripts/prod-probe.mjs                     # probe https://catcoder.online
 *   node scripts/prod-probe.mjs --base http://127.0.0.1:8787
 *   node scripts/prod-probe.mjs --full-limits       # also burn the signup bucket (creates ~5 throwaway accounts; prune with scripts/prune-test-accounts.mjs afterwards)
 *
 * Default mode is zero-side-effect: no accounts are created. The judge
 * probes consume that endpoint's 60s rate bucket only. The signup-limit
 * probe in --full-limits mode creates throwaway accounts on purpose.
 *
 * Exit code: 0 = all guards passed (warnings allowed), 1 = at least one FAIL.
 */

const args = process.argv.slice(2);
const argOf = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
};
const FULL_LIMITS = args.includes('--full-limits');
const BASE = (argOf('--base') ?? process.env.PROD_PROBE_BASE ?? 'https://catcoder.online').replace(/\/$/, '');

const results = [];
const warn = [];

function record(name, ok, detail, soft = false) {
    results.push({ name, ok, detail });
    if (!ok && soft) {
        warn.push(`${name}: ${detail}`);
    }
    const mark = ok ? '✅' : soft ? '🟡' : '❌';
    console.log(`${mark} ${name.padEnd(34)} ${detail}`);
}

async function req(path, init = {}) {
    return fetch(BASE + path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
}

async function main() {
    const t0 = Date.now();
    console.log(`\n🛰️  Probing ${BASE}${FULL_LIMITS ? ' (full-limits mode)' : ''}\n`);

    /* 1. Health + SPA serving ───────────────────────────────────────── */
    try {
        const h = await (await req('/api/health')).json();
        record('health', h?.status === 'ok', JSON.stringify(h));
    } catch (e) {
        record('health', false, String(e));
    }

    try {
        const r = await fetch(BASE + '/');
        const html = await r.text();
        record('spa-served', r.ok && /<div id="root"/i.test(html), `GET / → ${r.status}`);
    } catch (e) {
        record('spa-served', false, String(e));
    }

    /* 2. CORS allowlist echo ────────────────────────────────────────── */
    try {
        const good = await fetch(BASE + '/api/arena/problem', {
            method: 'OPTIONS',
            headers: { Origin: BASE.replace(/^http(s?):\/\//, (m) => `https://`), 'Access-Control-Request-Method': 'GET' },
        }).catch(() => null);
        // Apex origin echo (works on prod; on local dev the wrangler proxy rewrites ACAO — documented gotcha).
        const apex = 'https://' + new URL(BASE).hostname;
        const good2 = await fetch(BASE + '/api/arena/problem', {
            method: 'OPTIONS',
            headers: { Origin: apex, 'Access-Control-Request-Method': 'GET' },
        });
        const acao = good2.headers.get('access-control-allow-origin');
        record(
            'cors-allowlist',
            good2.status === 204 && acao === apex,
            acao === apex ? `echoes ${apex}` : `ACAO=${acao} status=${good2.status}${acao ? ' (dev-proxy rewrite?)' : ''}`,
            true
        );

        // The worker uses a fixed-value fallback (allowlist[0]) for unknown
        // Origins — that is safe: the browser blocks the response unless ACAO
        // matches the request Origin. The real invariant: a foreign origin is
        // never echoed and never granted a wildcard.
        for (const bad of ['https://evil.example.net', 'null']) {
            const evil = await fetch(BASE + '/api/arena/problem', {
                method: 'OPTIONS',
                headers: { Origin: bad, 'Access-Control-Request-Method': 'GET' },
            });
            const acao = evil.headers.get('access-control-allow-origin') ?? '';
            const granted = acao === bad || acao === '*';
            record(
                `cors-rejects-foreign`,
                !granted,
                granted ? `GRANTED ${acao} for ${bad} — CORS BROKEN` : `foreign origin falls back to ${acao} (not echoed, safe)`
            );
        }
    } catch (e) {
        record('cors-allowlist', false, String(e));
    }

    /* 3. Judge: Turnstile fail-closed + rate limit, one pass ────────── */
    // Handler order: rate limit (20/min/IP) → body validation (400) → Turnstile (403).
    // The probe body must PASS validation to reach the Turnstile check (it 404s
    // on the variant lookup only after Turnstile — which never happens here).
    // A cold bucket yields 20×403 then 429s; a warm bucket (e.g. a real player
    // behind the same IP) yields 429s and the 403 variant is unobservable — a
    // warning, not a failure.
    try {
        const judgeBody = JSON.stringify({
            variantId: 'probe-variant',
            hypothesis: 'production probe hypothesis text',
            tests: [],
        });
        let saw403 = 0;
        let saw429 = 0;
        const other = [];
        for (let i = 0; i < 22; i++) {
            const r = await req('/api/arena/judge', { method: 'POST', body: judgeBody });
            if (r.status === 403) saw403++;
            else if (r.status === 429) saw429++;
            else other.push(r.status);
            if (saw429 >= 2) break; // limiter verdict is clear; stop early
        }
        // A 200/404 would mean the request got PAST Turnstile without a token.
        const leaked = other.filter((s) => s === 200 || s === 404).length;
        const unobservable = saw403 === 0 && saw429 > 0 && leaked === 0;
        record(
            'judge-turnstile-fail-closed',
            saw403 > 0 || unobservable,
            saw403 > 0
                ? `${saw403}× 403 without token`
                : unobservable
                  ? 'bucket warm (all 429) — 403 variant unobservable this run'
                  : `LEAKED past Turnstile: statuses ${other.join(',')} — FAIL-CLOSED BROKEN`
        );
        record(
            'judge-rate-limit',
            saw429 > 0,
            saw429 > 0
                ? `429 after ${saw403} allowed`
                : `no 429 in ${saw403 + other.length} requests — LIMITER MISSING?`
        );
    } catch (e) {
        record('judge-turnstile-fail-closed', false, String(e));
    }

    /* 4. /api/db guards: auth gate, delete block, table allowlist ───── */
    try {
        const del = await req('/api/db', {
            method: 'POST',
            body: JSON.stringify({ table: 'user_progress', mode: 'delete' }),
        });
        record('db-unauth-401', del.status === 401, `delete unauth → ${del.status}`);
    } catch (e) {
        record('db-unauth-401', false, String(e));
    }

    try {
        const forge = await req('/api/db', {
            method: 'POST',
            body: JSON.stringify({
                table: 'profiles',
                mode: 'update',
                payload: { xp: 999999 },
            }),
        });
        record('db-forge-unauth-401', forge.status === 401, `xp update unauth → ${forge.status}`);
    } catch (e) {
        record('db-forge-unauth-401', false, String(e));
    }

    try {
        const users = await req('/api/db', {
            method: 'POST',
            body: JSON.stringify({ table: 'users', mode: 'select' }),
        });
        record('db-users-not-readable', users.status >= 400, `select users → ${users.status}`);
    } catch (e) {
        record('db-users-not-readable', false, String(e));
    }

    /* 5. Signup: username uniqueness (zero account creation) ────────── */
    // Pick the current #1 leaderboard username — guaranteed occupied. The
    // request 409s before any INSERT, so no account is created.
    try {
        const lb = await (await req('/api/arena/leaderboard')).json();
        const top = lb?.entries?.[0]?.username;
        record('leaderboard-shape', Array.isArray(lb?.entries) && lb.entries.length > 0, `entries=${lb?.entries?.length ?? 0}`);

        if (top) {
            const r = await req('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: `probe-${Date.now()}@example.test`,
                    password: 'probe-probe-1',
                    username: top,
                }),
            });
            const body = await r.json().catch(() => ({}));
            const uniqueGuard = r.status === 409 && body.error === 'Username already taken';
            const limited = r.status === 429;
            record(
                'signup-username-unique',
                uniqueGuard || limited,
                uniqueGuard ? `409 clash on "${top}"` : limited ? '429 (bucket warm) — uniqueness untested this run' : `${r.status} ${body.error ?? ''} — UNIQUENESS BROKEN? (account may have been created!)`
            );
        }
    } catch (e) {
        record('signup-username-unique', false, String(e));
    }

    /* 6. Optional: burn the signup bucket end-to-end ────────────────── */
    if (FULL_LIMITS) {
        console.log('\n⚠️  --full-limits: creating throwaway accounts to test the signup limiter. Prune afterwards!');
        const tag = `prodprobe${Date.now()}`;
        const statuses = [];
        for (let i = 1; i <= 6; i++) {
            const r = await req('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: `${tag}-${i}@example.test`,
                    password: 'probe-probe-1',
                    username: `${tag}_${i}`,
                }),
            });
            statuses.push(r.status);
        }
        record(
            'signup-ip-limit',
            statuses[5] === 429,
            `statuses=${statuses.join(',')}${statuses[5] === 429 ? '' : ' — 6th signup was NOT limited'}`
        );
        console.log(`   → prune these later:  node scripts/prune-test-accounts.mjs --apply   (prefix "prodprobe" is in the list)`);
    }

    /* ── Verdict ─────────────────────────────────────────────────────── */
    const failed = results.filter((r) => !r.ok && !warn.some((w) => w.startsWith(r.name)));
    const dur = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`${results.length - failed.length}/${results.length} guards passed in ${dur}s${warn.length ? ` · ${warn.length} warning(s)` : ''}`);
    if (failed.length > 0) {
        console.log('\n❌ FAILED GUARDS:');
        for (const f of failed) console.log(`   - ${f.name}: ${f.detail}`);
        process.exit(1);
    }
    console.log('✅ ALL PRODUCTION GUARDS VERIFIED');
}

main().catch((e) => {
    console.error('probe crashed:', e);
    process.exit(1);
});
