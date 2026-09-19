# Security Post-Audit Notes

This file documents actions needed after the security hardening pass.

## Status of Older Items

- **`.env.cloudflare` untracking: DONE.** The file is no longer in the git
  index and is listed in `.gitignore`. Nothing further to do.
- **Turso token rotation and `AUTH_SECRET` generation: still on you** if the
  values were ever exposed; commands below still apply.

## Known Dev-Dependency Advisories (accepted, 2026-09)

`npm audit` reports 4 critical advisories in `@vitest/browser` (browser-mode
API exposure / CDP proxy class, fixed upstream in vitest `>= 4.1.11`). They are
**dev-only** — none of it ships in the production Worker or SPA bundle, which
is why the CI audit gate runs with `--omit=dev`.

The version is pinned by `@storybook/addon-vitest@10.4.1`, which does not yet
accept vitest `>= 4.1.11`. When a compatible Storybook release lands:

```bash
npm update storybook @storybook/addon-vitest vitest @vitest/browser-playwright @vitest/coverage-v8
npm audit   # expect: 0 vulnerabilities
npm test && npx playwright test
```

Until then, do not weaken the `--omit=dev` gate to "fix" the count; production
runtime dependencies are currently at 1 low-severity advisory (esbuild via
Storybook's dev toolchain, not bundled).

## Local Dev Gotcha: `wrangler dev` Rewrites CORS Headers

While smoke-testing the CORS allowlist locally we observed `Access-Control-Allow-Origin`
values on `/api/*` responses appearing as `http://127.0.0.1:8787` regardless of what the
Worker code emits — even a **hardcoded** header value gets rewritten. This is the wrangler
v4 local dev proxy adjusting CORS for the locally-served SPA; it is **not** our code and
**does not happen in production**. Unit tests (`worker/shared/cors.test.ts`) pin the real
behavior. To verify CORS truth, test the deployed Worker (or `curl` the production URL),
never `wrangler dev` responses.

## Turso Token Rotation (CONDITIONAL)

The `.dev.vars` file on disk contains a live Turso JWT auth token. Although this
file is gitignored and was never committed to git history, the token should be
rotated if there is any chance it was leaked (e.g. shared screen, clipboard).

```bash
turso db tokens invalidate catcoder-rofidarmawan
turso db tokens create catcoder-rofidarmawan
```

Replace the token in `.dev.vars` with the new one.

## .env.cloudflare Untracking

`.env.cloudflare` was previously tracked in git. It contains only a client-side
obfuscation key (`VITE_STORAGE_ENCRYPTION_KEY`) that is intentionally inlined
into the production bundle — it is NOT a real secret. However, maintaining a
clean no-dotenv-in-git policy is best practice. Run:

```bash
git rm --cached .env.cloudflare
```

This removes it from the index while keeping the file on disk.

## AUTH_SECRET in .dev.vars

`AUTH_SECRET` is used by `worker/auth.ts` for PBKDF2 key derivation and session
token signing. It was never committed to git. Generate a new one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
