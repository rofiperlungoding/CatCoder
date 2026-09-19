#!/usr/bin/env node
/**
 * Fail-fast production build for Cloudflare (npm run cf:build).
 *
 * `vite build --mode cloudflare` reads .env.cloudflare — a git-ignored file —
 * so a build from a clean checkout (CI, a new machine) would silently produce
 * a SPA running in "local" mode: auth and every API call dead, and
 * secureStorage refusing to boot because VITE_STORAGE_ENCRYPTION_KEY is
 * missing in production. This guard turns that silent mis-build into an
 * immediate, actionable error instead of a "successful" broken bundle.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = resolve(root, '.env.cloudflare');
const require = createRequire(import.meta.url);

const REQUIRED_VARS = ['VITE_BACKEND', 'VITE_STORAGE_ENCRYPTION_KEY'];

function fail(message) {
    console.error(`\n✖ cf:build aborted: ${message}\n`);
    console.error('  cf:build compiles the production SPA in --mode cloudflare, which reads');
    console.error('  the git-ignored .env.cloudflare file. Building without it would ship a');
    console.error('  bundle with the dead in-browser "local" backend.\n');
    console.error('  Fix (local machine): create .env.cloudflare in the project root with at least:');
    console.error('    VITE_BACKEND=turso');
    console.error('    VITE_STORAGE_ENCRYPTION_KEY=<random string>\n');
    console.error('  Fix (CI): set the repo secrets VITE_BACKEND and');
    console.error('  VITE_STORAGE_ENCRYPTION_KEY — the workflow injects them into');
    console.error('  .env.cloudflare before this script runs.\n');
    process.exit(1);
}

/** Parse KEY=VALUE pairs; values may be quoted. Empty values count as missing. */
function parseEnvFile(content) {
    const out = new Map();
    for (const line of content.split(/\r?\n/)) {
        const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        let value = m[2].trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        out.set(m[1], value);
    }
    return out;
}

if (!existsSync(envFile)) fail('.env.cloudflare not found');

const vars = parseEnvFile(readFileSync(envFile, 'utf8'));
const missing = REQUIRED_VARS.filter((v) => !vars.get(v));
if (missing.length > 0) {
    fail(`.env.cloudflare is missing or has empty values for: ${missing.join(', ')}`);
}

/** Resolve a package's bin script via its package.json (exports-map safe). */
function resolveBin(pkgName, binKey) {
    const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[binKey];
    if (!binRel) fail(`Cannot locate the ${pkgName} CLI binary`);
    return resolve(dirname(pkgJsonPath), binRel);
}

console.log('✔ .env.cloudflare OK — running tsc + vite build (cloudflare mode)…');

const tscBin = resolveBin('typescript', 'tsc');
const viteBin = resolveBin('vite', 'vite');

const tsc = spawnSync(process.execPath, [tscBin, '-b'], { stdio: 'inherit', cwd: root });
if (tsc.status !== 0) process.exit(tsc.status ?? 1);

const vite = spawnSync(process.execPath, [viteBin, 'build', '--mode', 'cloudflare'], {
    stdio: 'inherit',
    cwd: root,
});
process.exit(vite.status ?? 1);
