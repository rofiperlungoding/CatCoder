# Security Post-Audit Notes

This file documents actions needed after the security hardening pass.

## Turso Token Rotation (REQUIRED)

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
