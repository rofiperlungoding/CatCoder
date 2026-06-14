# CatCoder — Holistic Project Report

**Prepared for:** External expert/consultant review
**Date:** 14 June 2026
**Repository:** https://github.com/rofiperlungoding/CatCoder
**Primary author:** Muhammad Rofi Darmawan (`rofiperlungoding`)
**Version:** 1.0.0
**License:** MIT

---

## 0. How to read this document

This report is intended to give an external reviewer a complete, no-prior-context
picture of the CatCoder codebase: what it is, how it is built, what state it is
in, what was recently changed, and where the real risks and open decisions are.
It is deliberately candid about technical debt and unfinished areas. Nothing
here is marketing copy.

---

## 1. Executive summary

CatCoder is a single-page web application: an AI-accelerated, gamified platform
for learning to code (Python, JavaScript, C++) with interactive lessons,
practice problems, in-browser code execution, XP/levels/leagues, and a
leaderboard.

- **Frontend:** React 19 + TypeScript + Vite 7 + Tailwind CSS 4, deployed as a
  PWA. Client-side rendered SPA with `react-router`.
- **Backend:** Pluggable. A single abstraction (the "Supabase client surface")
  is satisfied by **three interchangeable backends** selected at build time via
  `VITE_BACKEND`:
  1. **local** — in-browser `localStorage` (zero setup, testing only)
  2. **turso** — Cloudflare Worker + Turso (libSQL/SQLite) — the current target
  3. **supabase** — original Postgres + Auth + Realtime + RLS backend
- **Hosting:** Cloudflare Workers (static assets + `/api/*` in one Worker).
  Netlify was fully removed.
- **Current state:** Builds clean, type-checks clean, lints clean, 255 unit
  tests pass. The Turso backend has been verified end-to-end against a live
  Turso database locally (`wrangler dev`). Production deploy to Cloudflare has
  **not** yet been performed.

**Headline risk:** the migration away from Supabase trades a managed
auth/realtime/RLS platform for a **hand-rolled auth system** in a Cloudflare
Worker and **polling-based "realtime."** This is functional and tested but is
the single biggest area that warrants expert scrutiny (see §13, §14).

---

## 2. Product overview

| Area | Description |
| --- | --- |
| **Learn** | Tiered curriculum (5 tiers, "Seedling"→"Expert") for Python, JavaScript, C++. Lessons rendered from data modules, with embedded code editor + validation. |
| **Practice** | Algorithmic problems across difficulty tiers, in-browser execution, speedrun timer, auto-submit on validation pass. |
| **Compete** | Global XP leaderboard, speed-run feed, league progression (Bronze→Silver→Gold→Platinum→Diamond). |
| **Profile** | XP/level/rank, streaks, contribution graph, per-language progress breakdown, shareable public profile (`/catcoder/:username`). |
| **AI mentor** | Context-aware hints, code review, learning-path analysis (optional; requires an AI proxy — see §11). |
| **PWA** | Installable, offline service-worker caching, Web Vitals reporting. |

XP rules (server-authoritative in turso/supabase modes): lesson = 50 XP,
problem = 100 XP, challenge = 25 XP. Level curve and rank thresholds are defined
in `src/lib/utils.ts` (`calculateLevel`, `getRank`) and mirrored server-side.

---

## 3. Technology stack

### Runtime / framework
- **React** 19.2, **react-dom** 19.2
- **TypeScript** ~5.9 (strict, `erasableSyntaxOnly`, `verbatimModuleSyntax`)
- **Vite** 7.3 (build + dev), **@vitejs/plugin-react**
- **react-router-dom** 7.x
- **Zustand** 5.x (state, with `persist` + encrypted storage adapter)
- **Tailwind CSS** 4.x (`@tailwindcss/postcss`, `@config` bridge)

### Editor / execution
- **@monaco-editor/react** (lazy-loaded code editor)
- **Pyodide** (Python via WASM, lazily loaded from CDN — `pyodideLoader.ts`)
- **Web Worker sandbox** (`public/sandbox-worker.js`) for JavaScript execution
- **vite-plugin-wasm** + **vite-plugin-top-level-await**

### Content / UI
- **react-markdown** 10 + **remark-gfm** + **rehype-sanitize** (lesson content)
- **@hugeicons/react** + **@hugeicons/core-free-icons** (icon system)
- **clsx**, **focus-trap-react**

### Backend / data
- **@libsql/client** (Turso, used inside the Cloudflare Worker via `/web` build)
- **@supabase/supabase-js** (supabase mode)
- **Cloudflare Workers** + **wrangler** 4.x + **@cloudflare/workers-types**

### Crypto / security
- **crypto-js** (AES localStorage encryption)
- **@noble/hashes**, **@noble/post-quantum** (ML-KEM device vault)
- **@fingerprintjs/fingerprintjs** (device fingerprinting)

### Testing / docs
- **Vitest** 4.x, **fast-check** (property-based), **@testing-library/react**,
  **jsdom**, **playwright** (storybook browser tests), **Storybook** 10.

---

## 4. Architecture

### 4.1 High level

```
Browser (React SPA, PWA)
   │
   │  uses a single "supabase-shaped" client (src/lib/supabase.ts)
   ▼
Backend adapter (chosen at build time by VITE_BACKEND)
   ├─ local   → src/lib/localBackend.ts      (localStorage; no network)
   ├─ turso   → src/lib/tursoBackend.ts  ──►  Cloudflare Worker /api/* ──► Turso (libSQL)
   └─ supabase→ @supabase/supabase-js     ──►  Supabase (Postgres/Auth/Realtime/RLS)
```

### 4.2 The backend abstraction (key design decision)

Every data/auth call in the app goes through `supabase` exported from
`src/lib/supabase.ts`. That module picks one of three implementations and casts
it to the Supabase client type, so **all call sites are identical regardless of
backend.** The two non-Supabase implementations re-implement the exact subset of
the Supabase client surface the app uses:

- `auth`: `signUp`, `signInWithPassword`, `signInWithOAuth`, `signInWithOtp`,
  `signOut`, `getSession`, `getUser`, `updateUser`, `onAuthStateChange`
- `from(table)`: a chainable, thenable query builder
  (`select/eq/neq/gt/order/limit/single/maybeSingle/insert/upsert/update/delete`,
  plus `count`/`head`)
- `rpc(fn, args)`: server-style functions (`submit_completion`,
  `get_server_time`, device-session stubs, log sinks)
- `channel()/removeChannel()`: realtime (native in Supabase; polling elsewhere)

Selection logic (`src/lib/supabase.ts`):
- `VITE_BACKEND=local` → local
- `VITE_BACKEND=turso` → turso
- `VITE_BACKEND=supabase` → supabase
- unset → auto: supabase if valid creds present, otherwise local

`isSupabaseConfigured()` returns true for local/turso (a backend IS present);
`isLocalBackend()` / `isTursoBackend()` expose the active mode to the UI.

### 4.3 Cloudflare Worker (`worker/`)

A single Worker serves both the SPA and the API:
- `wrangler.toml`: `assets.directory = ./dist`,
  `not_found_handling = single-page-application`, `run_worker_first = ["/api/*"]`,
  `nodejs_compat`.
- `worker/index.ts` routes `/api/*` to handlers; everything else falls through to
  static assets (with SPA fallback to `index.html`).
- Turso is reached with `@libsql/client/web` (the only build that runs in the
  Workers runtime). The Turso token lives in Worker secrets and never reaches the
  browser.

### 4.4 Code execution

- **JavaScript** runs in a fresh **Web Worker** per execution
  (`public/sandbox-worker.js`): blocked globals (`fetch`, `localStorage`,
  `document`, etc.), strict mode, 3-second timeout, output via `postMessage`.
- **Python** runs via **Pyodide** (WASM) loaded lazily from `cdn.jsdelivr.net`
  through `src/lib/pyodideLoader.ts` (memoized, retry-on-failure).
- **C++** is currently a regex-based mock (parses `cout` statements) — not a real
  compiler. This is a known limitation.

---

## 5. Repository structure

```
CatCoder/
├─ src/
│  ├─ App.tsx, main.tsx, index.css, App.css
│  ├─ components/
│  │  ├─ ai/        (AIHintPanel, AIInsightsPanel, AILearningGuide,
│  │  │             AIReviewCard, AIUsageIndicator, InsightCard, …)
│  │  ├─ common/    (ErrorBoundary)
│  │  ├─ editor/    (CodeEditor — lazy Monaco)
│  │  ├─ layout/    (MainLayout, PublicLayout, Sidebar, ScrollToTop)
│  │  ├─ profile/   (ContributionGraph, PublicContributionGraph,
│  │  │             EditProfileModal, LanguageProgress)
│  │  ├─ pwa/       (ReloadPrompt)
│  │  ├─ settings/  (AISettings)
│  │  └─ ui/        (Button, Card, Modal, Toaster, MarkdownContent, Icon, …)
│  ├─ data/         (lessons/{python,javascript,cpp}.ts, problems/)
│  ├─ hooks/        (useCodeRunner, useSecureCodeRunner, useSecureCore,
│  │                useAIHint, useCodeReview, useAIAnalytics)
│  ├─ lib/          (supabase, localBackend, tursoBackend, pyodideLoader,
│  │                coreBridge, vault, secureStorage, securityLogger,
│  │                requestFirewall, domMonitor, deviceFingerprint,
│  │                serverTime, leaderboard, sync, errorReporter, logger,
│  │                utils, speedruns)  + __tests__/ + *.test.ts
│  ├─ pages/        (Auth, Home, Learn, Practice, Compete, Roadmap, Profile,
│  │                PublicProfile, Public, Onboarding, Landing, NotFound,
│  │                Honeypot)
│  ├─ services/     (analytics, reportWebVitals, ai/*)
│  ├─ stores/       (index.ts — user/progress/UI/theme; stores.test.ts)
│  ├─ types/        (index, analytics, database.types)
│  └─ test/         (setup.ts)
├─ worker/          (Cloudflare Worker: index, auth, data, rpc, db, crypto,
│                   types, schema.sql, tsconfig.json, .dev.vars.example)
├─ supabase/        (migrations/, functions/ai-proxy/, schema.sql, emails/)
├─ scripts/         (apply-schema.mjs — applies worker/schema.sql to Turso)
├─ public/          (sandbox-worker.js, python/{secure_core,fuzz_logic}.py,
│                   logo, fonts, screenshots, robots.txt, sitemap.xml)
├─ docs/            (TECHNICAL_REPORT.html, plans/, THIS report)
├─ .github/         (workflows/ci.yml, scripts/generate_email.sh)
├─ wrangler.toml, vite.config.ts, eslint.config.js, tailwind.config.js
├─ tsconfig*.json, package.json, .env.example, .env.local.example,
│  .env.cloudflare
└─ (gitignored: dist/, node_modules/, .env*, .dev.vars, .wrangler/)
```

### Env files
- `.env.example` — documents all `VITE_*` vars + backend selection
- `.env.local.example` — quick local-mode template
- `.env.cloudflare` — committed; sets `VITE_BACKEND=turso` for the CF build
- `.env.local`, `.dev.vars` — gitignored (local secrets; the Turso token lives
  in `.dev.vars` for `wrangler dev`)

---

## 6. Data model

### 6.1 Turso schema (`worker/schema.sql`)

| Table | Purpose |
| --- | --- |
| `users` | id, email (unique), password_hash (PBKDF2 `salt:hash`), username, created_at |
| `sessions` | token (PK), user_id, created_at, expires_at (30-day TTL) |
| `profiles` | id (FK users), username, avatar_url, xp, level, rank, streak_current, streak_best, created_at, last_activity_date |
| `user_progress` | id, user_id, content_type, content_id, status, score, duration_seconds, completed_at, created_at; UNIQUE(user_id, content_type, content_id) |
| `app_logs` | id, kind ('security'\|'app_error'), user_id, payload, created_at |

Indexes on `profiles.xp DESC`, `user_progress.user_id`, the unique progress
triple, and `sessions.user_id`.

### 6.2 Supabase schema (legacy/alternative)

`supabase/schema.sql` + `supabase/migrations/*` define the equivalent Postgres
model **plus** Row-Level Security policies and SECURITY DEFINER RPCs
(`submit_completion`, `validate_and_complete`, `get_server_time`,
`register_device_session`, `verify_device_fingerprint`,
`invalidate_all_sessions`, `log_security_event`, `log_app_error`). There is also
`supabase/migrations/20260526_001_app_error_logs.sql` adding the `error_logs`
table + `log_app_error` RPC.

> Note: the Turso backend does NOT enforce RLS at the database layer (Turso has
> no RLS). Equivalent access control is enforced in `worker/data.ts` (allowlist
> tables/columns, parameterized SQL, writes scoped to the authenticated user).

---

## 7. Security posture

CatCoder carries an unusually heavy security layer for an education app — much of
it built under a self-styled "Unbreakable Bastion" plan (see `docs/plans/`).

| Mechanism | File | What it does |
| --- | --- | --- |
| Content Security Policy | `index.html` | Strict CSP: `default-src 'none'`, scripted sources limited to self + jsdelivr/pyodide, connect-src to supabase/jsdelivr. Uses `'unsafe-eval'` (needed by Pyodide/Monaco). |
| JS sandbox | `public/sandbox-worker.js` | Web Worker, blocked globals, strict mode, 3s timeout. |
| Request firewall | `lib/requestFirewall.ts` | Intercepts fetch/XHR, allowlists domains (prod only). |
| DOM monitor | `lib/domMonitor.ts` | Removes injected `<script>`/`<iframe>` (prod only). |
| Encrypted storage | `lib/secureStorage.ts` | AES + HMAC over localStorage; **fails closed in prod if `VITE_STORAGE_ENCRYPTION_KEY` is unset**. |
| Device vault | `lib/vault.ts` | Post-quantum (ML-KEM) device identity keys. |
| Device fingerprint | `lib/deviceFingerprint.ts` | FingerprintJS; session binding (server RPC). |
| Server time | `lib/serverTime.ts` | Server-synced time to prevent streak clock manipulation. |
| Security logger | `lib/securityLogger.ts` | Logs blocked requests, DOM violations, fingerprint mismatches, honeypot hits. |
| Honeypot | `pages/Honeypot` | `/admin`, `/wp-admin`, etc. log attacker probes then redirect. |
| Secure core | `lib/coreBridge.ts` + `public/python/secure_core.py` | Optional Python (Pyodide) "secure logic engine" with Pydantic-style validation. |
| App error reporting | `lib/errorReporter.ts` | ErrorBoundary → `log_app_error` RPC (Supabase/Turso). |

### Auth model by backend
- **supabase:** Supabase Auth (email/password, Google OAuth, magic link), RLS.
- **turso:** **hand-rolled** in the Worker — email/password only, PBKDF2-SHA256
  (100k iterations, Web Crypto), opaque session tokens in a `sessions` table,
  sent as `Authorization: Bearer`. OAuth and magic links are intentionally
  disabled (return a friendly error).
- **local:** fake auth in localStorage (testing only; base64-obfuscated password).

### Pentest suite
`src/lib/__tests__/security-pentest.test.ts` contains 81 property-based
invariants across 9 domains (sandbox escape, prototype pollution, ciphertext
tampering, CSP, etc.). A separate `vitest.pentest.config.ts` runs it without
Storybook.

---

## 8. AI features

- Client services live in `src/services/ai/` (`hintGenerator`, `codeReviewer`,
  `learningAnalyzer`, `aiCache`, `aiRateLimit`, `aiPersistence`,
  `promptTemplates`, `openaiClient`, `types`).
- The OpenAI key is **never** in the browser. `openaiClient.ts` is a thin
  **proxy client** that POSTs to a server endpoint:
  - supabase mode → `${VITE_SUPABASE_URL}/functions/v1/ai-proxy`
    (`supabase/functions/ai-proxy/index.ts`, a Deno edge function)
  - or an explicit `VITE_AI_PROXY_URL`
- **There is currently NO AI proxy for the Turso/Cloudflare backend.** In turso
  mode, AI features are off unless `VITE_AI_PROXY_URL` points at a running proxy.
  A Cloudflare Worker AI route would need to be added to enable AI on the Turso
  stack (small, not yet done).
- Client-side rate limiting (`aiRateLimit.ts`): 3 hints/challenge, 50
  requests/hour. `AIUsageIndicator` surfaces remaining quota in the Practice UI.
- `VITE_AI_ENABLED` toggles the feature flag (default false).

---

## 9. Testing

- **Runner:** Vitest 4, `--project unit` (jsdom). A second `storybook` project
  runs component stories in a real browser via Playwright.
- **Count:** **255 unit tests passing** across 19 files.
- **Notable suites:**
  - `localBackend.test.ts` (auth lifecycle, query builder, completion dedupe)
  - `tursoBackend.test.ts` (adapter ↔ `/api` contract, Bearer header)
  - `stores/stores.test.ts` (auth flow: signIn/up/out, toast id uniqueness)
  - `pyodideLoader.test.ts`, `logger.test.ts`, `errorReporter.test.ts`,
    `MarkdownContent.test.tsx` (XSS sanitization)
  - `__tests__/security-pentest.test.ts` (81 property invariants)
  - plus `csp`, `domMonitor`, `requestFirewall`, `secureStorage`,
    `securityLogger`, `serverTime`, `submitCompletion`, `security`,
    `useSecureCodeRunner`, `secure_core.fuzz`
- **Config:** the unit project runs with `fileParallelism: false` because the
  fast-check property tests share jsdom global state and were intermittently
  flaky under parallel runs.
- **Known flakiness:** the property-based pentest/domMonitor tests occasionally
  fail with a different random seed (~1 in several runs). This is a
  pre-existing characteristic of the fast-check seeds, not a logic regression.
  **Worth hardening** (pin seeds or make invariants deterministic).
- **Coverage gaps:** components (beyond MarkdownContent), pages, and most of the
  large `stores/index.ts` are not unit-tested. No E2E/browser test of the full
  turso stack (only API-level + adapter-level verification + manual `wrangler dev`).

### Verified end-to-end (manual, against live Turso via `wrangler dev`)
Signup → session, lesson (+50) & problem (+100) XP, duplicate-completion dedupe,
leaderboard query, scoped progress read, unauthenticated write → 401, SPA
deep-route fallback to `index.html`, same-origin `/api/*`. Test data was cleaned
up afterward (DB returned to 0 users).

---

## 10. Build & bundle

- **Build:** `npm run build` = `tsc -b && vite build`. Cloudflare build:
  `npm run cf:build` = `tsc -b && vite build --mode cloudflare`.
- **Code splitting:** route-level lazy loading + `manualChunks` in
  `vite.config.ts` (monaco, supabase, noble, crypto-js, hugeicons, router,
  zustand, a11y, markdown, vendor).
- **Approx chunk sizes (cloudflare build, gzip):** supabase ~63 KB, vendor
  ~94 KB, markdown ~39 KB, crypto-js ~26 KB, router ~16 KB, app entry ~28 KB.
  Largest raw chunk ~346 KB (Supabase SDK — only loaded in supabase mode).
- **Lessons** are lazy per-language chunks (python/javascript/cpp) to keep the
  initial bundle small.
- **PWA:** `vite-plugin-pwa` generates `sw.js` + workbox; precaches ~56 entries.
- **Build target:** `esnext` (so `vite-plugin-top-level-await` emits modern
  syntax without esbuild downleveling errors).

---

## 11. Deployment

### Target: Cloudflare Workers (Netlify fully removed)

One Worker hosts the SPA static assets **and** the API. Steps:

```bash
# 1. Database (Turso)
turso db create catcoder
turso db shell catcoder < worker/schema.sql      # or: npm run cf:schema
turso db show catcoder --url                     # -> LIBSQL_DB_URL
turso db tokens create catcoder                  # -> LIBSQL_DB_AUTH_TOKEN

# 2. Worker config + secrets
#    put LIBSQL_DB_URL in wrangler.toml [vars]
npx wrangler secret put LIBSQL_DB_AUTH_TOKEN
npx wrangler secret put AUTH_SECRET

# 3. Local verification
npm run cf:dev        # builds (cloudflare mode) + wrangler dev on :8787

# 4. Deploy
npm run cf:deploy     # builds + wrangler deploy
```

Custom domain is attached in the Cloudflare dashboard (Workers & Pages → Worker →
Settings → Domains & Routes). Cloudflare auth (`wrangler`) is already configured
on the author's machine.

### NPM scripts
`dev`, `build`, `preview`, `lint`, `test`, `test:watch`, `test:coverage`,
`storybook`, `build-storybook`, `cf:typecheck`, `cf:schema`, `cf:build`,
`cf:dev`, `cf:deploy`.

### CI
`.github/workflows/ci.yml` runs setup, security checks, quality (lint/types),
and build, with an email-report step (`.github/scripts/generate_email.sh`).
CI env was scrubbed of unused Firebase/OpenAI client secrets and Netlify refs.

### Important operational note
`npm run cf:dev` (and a deployed Worker) must be **running** to serve the app.
A common confusion during testing was opening `http://127.0.0.1:8787` while no
Worker process was running → "Unable to connect." There is no bug here; the
process simply must be up and finished building before the browser is opened.

---

## 12. Engineering history (recent audit trail)

The codebase was put through several structured audit/refactor passes. Each is a
PR on GitHub (branch names shown). `main` currently contains PR #1; #2–#4 are
open/stacked.

1. **PR #1 — repo cleanup & production hardening** (`chore/repo-cleanup-and-hardening`, merged)
   - Removed 18+ MB of committed binaries (`rustup-init.exe`, `wasm-pack-init.exe`),
     `__pycache__`, dead scripts, stale outputs, dead code (`src/store/aiStore.ts`),
     a leaked `.code-workspace`.
   - **Wired up Pyodide** (was never actually loaded → Python lessons were dead).
   - Moved `secure_core.py`/`fuzz_logic.py` to `public/python/` (fetchable in prod).
   - **Moved the OpenAI key server-side** (was bundled into the client) via a
     Supabase Edge Function proxy; dropped `openai`/`firebase`/`lucide-react` deps.
   - secureStorage now fails closed in production without an encryption key.
   - Code-splitting + `manualChunks`: initial chunk 938 KB → ~312 KB.
   - Muted ~30 `console.log`s leaking auth/user data via a gated `logger`.

2. **PR #2 — CVE patches, a11y, tests** (`chore/audit-followup`, open)
   - `npm overrides` for dompurify/uuid/picomatch → 0 prod vulnerabilities.
   - Removed a fake `ThemeToggle` (no-op control); a11y on Toaster;
     `crypto.randomUUID()` for toast/activity ids; +7 tests.

3. **PR #3 — content, observability, UX** (`feat/audit-pass-3`, open)
   - `MarkdownContent` → sanitized `react-markdown` (was a regex parser).
   - App error reporter + Supabase `error_logs` migration; ErrorBoundary wired.
   - `AIUsageIndicator` in Practice; auth-flow store tests.
   - Live leaderboard (Supabase Realtime), lesson 404 fallback, noindex on 404
     public profiles; per-language progress card.
   - `npm update` (minor/patch) across 283 packages; ESLint v8 react-hooks tweak.

4. **PR #4 — drop Netlify, add Cloudflare + Turso** (`feat/cloudflare-turso`, open, current)
   - Deleted all Netlify config/refs.
   - Added the Cloudflare Worker backend (`worker/`) + `tursoBackend.ts` client
     adapter + `VITE_BACKEND=turso`.
   - Added `.env.cloudflare` + `cf:build`/`cf:dev`/`cf:deploy` so the SPA is
     actually built in turso mode (fixed a bug where it silently built local).
   - Verified end-to-end against a live Turso DB.

### Branch/PR state
- `main` ← PR #1 merged.
- Open PRs: #2 (`chore/audit-followup`), #3 (`feat/audit-pass-3`),
  #4 (`feat/cloudflare-turso`). They are **stacked** in that order; merging out
  of order will need rebasing. The Cloudflare/Turso work (#4) currently sits on
  top of #3's history.

---

## 13. Known issues, technical debt & risks

### High
1. **Hand-rolled auth in the Turso Worker.** Email/password with PBKDF2 +
   opaque tokens. Functional and tested, but lacks: email verification,
   password reset (no mail), rate limiting / brute-force protection on
   `/api/auth/*`, account lockout, CSRF considerations, and refresh-token
   rotation. **This is the #1 thing to review.**
2. **No RLS at the DB layer in Turso mode.** Access control is entirely in
   `worker/data.ts` (allowlist + ownership scoping). Correct as written, but a
   single mistake in that file = data exposure. Worth an independent review of
   the query executor.
3. **Secrets were shared in plaintext during setup.** The Turso DB token was
   pasted during local wiring; it should be rotated before any real launch
   (tracked separately by the owner; not yet done).
4. **Property-based tests are intermittently flaky** (random seeds). CI could
   fail spuriously. Pin seeds or make invariants deterministic.

### Medium
5. **No AI proxy for the Cloudflare/Turso stack.** AI features only work in
   supabase mode (or with an external `VITE_AI_PROXY_URL`). A Worker AI route is
   needed to enable AI on Turso.
6. **"Realtime" on Turso is 15-second polling**, not push. Acceptable for a
   small leaderboard; not for anything latency-sensitive.
7. **C++ "execution" is a regex mock**, not a compiler. Misleading to users who
   expect real C++ output.
8. **Three backends = triple maintenance surface.** Behavior can drift between
   local/turso/supabase. Only turso+local are unit-tested; supabase is largely
   untested in this repo.
9. **Large untested areas:** `stores/index.ts` (big auth/progress store),
   pages, most components. No full E2E.
10. **`'unsafe-eval'` in CSP** (required by Pyodide/Monaco) widens XSS surface.

### Low
11. Storybook `addon-vitest` emits deprecation warnings on every test run.
12. Heavy "security theater" subsystems (PQC vault, DOM monitor, request
    firewall, honeypot) add complexity that may exceed the threat model for an
    education app — worth a cost/benefit review.
13. Several dependencies are a major version behind (vite 7→8, typescript 5.9→6,
    eslint 9→10) — deferred intentionally; needs a dedicated bump+test pass.
14. `docs/TECHNICAL_REPORT.html` is an older generated report; this markdown
    supersedes it.

---

## 14. Recommendations (for the consultant to weigh)

**Before any production launch on Turso/Cloudflare:**
1. Independent review of `worker/auth.ts`, `worker/crypto.ts`, `worker/data.ts`
   — the entire trust boundary now lives here. Add brute-force/rate limiting on
   auth endpoints (Cloudflare Rate Limiting or KV-based), and CSRF/replay
   considerations for the Bearer-token model.
2. Decide the auth strategy honestly: either (a) accept hand-rolled auth and
   harden it (verification email, reset, lockout), or (b) keep a managed auth
   provider (Supabase Auth, Clerk, WorkOS, Cloudflare Access) in front of Turso.
   Turso-as-DB + managed-auth is often the pragmatic middle ground.
3. Rotate the Turso token and set production secrets via `wrangler secret put`.
4. Add an AI proxy Worker route if AI features are in scope for launch.
5. Stabilize the flaky property tests; add a minimal E2E (Playwright) that signs
   up, completes a lesson, and checks the leaderboard against the Worker.

**Architecture decisions to validate:**
- Is the three-backend abstraction worth its maintenance cost, or should the
  project commit to one (Turso+Worker) and delete the others?
- Is the heavy security subsystem proportionate to the threat model?
- Should C++ get a real execution path (e.g., a WASM toolchain) or be removed?

**Quick wins:**
- Pin fast-check seeds; bump deps in a dedicated PR; add auth-endpoint rate
  limiting; document the chosen backend and delete the unused ones.

---

## 15. Open questions for the reviewer

1. Auth: harden the hand-rolled Worker auth, or adopt a managed provider in
   front of Turso?
2. Is RLS-in-application-code (`worker/data.ts`) acceptable, or is DB-level
   enforcement required for the threat model?
3. Which backend is the committed long-term target? (Recommendation: Turso +
   Worker, drop Supabase + local-as-prod.)
4. Is the security subsystem (PQC vault, DOM monitor, firewall, honeypot)
   in-scope, or over-engineered for the product?
5. Launch scope for AI features (and therefore whether the Worker AI proxy is
   needed now)?

---

## 16. Appendix

### A. Environment variables
| Var | Where | Purpose |
| --- | --- | --- |
| `VITE_BACKEND` | client build | `local` \| `turso` \| `supabase` |
| `VITE_STORAGE_ENCRYPTION_KEY` | client build | localStorage AES key (required in prod) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | client build | supabase mode only |
| `VITE_API_BASE_URL` | client build | override turso API origin (default same-origin) |
| `VITE_AI_ENABLED` / `VITE_AI_PROXY_URL` / `VITE_OPENAI_MODEL` | client build | AI proxy config |
| `LIBSQL_DB_URL` | Worker var | Turso database URL |
| `LIBSQL_DB_AUTH_TOKEN` | Worker secret | Turso token (never client-side) |
| `AUTH_SECRET` | Worker secret | session signing/scoping secret |

### B. Key commands
- `npm run dev` — local-backend SPA (hot reload, no backend)
- `npm run cf:dev` — build (turso mode) + Worker on :8787 (full Turso stack)
- `npm run cf:deploy` — deploy to Cloudflare
- `npm run cf:schema` — apply `worker/schema.sql` to Turso (reads `.dev.vars`)
- `npm test` — unit tests (255)
- `npm run lint` / `npx tsc -b` / `npm run cf:typecheck` — quality gates

### C. Current quality gate status (as of this report)
- TypeScript (app + worker): clean
- ESLint: clean
- Unit tests: 255 passing (property tests occasionally flaky)
- Build (`build` and `cf:build`): clean, 0 warnings
- `npm audit --omit=dev`: 0 vulnerabilities
- Turso end-to-end (local `wrangler dev`): verified

### D. Source-of-truth files for a reviewer to start with
`src/lib/supabase.ts` (backend selection) → `src/lib/tursoBackend.ts` (client
adapter) → `worker/index.ts` → `worker/auth.ts` + `worker/data.ts` +
`worker/rpc.ts` → `worker/schema.sql`. Then `src/stores/index.ts` for app state.

---

*End of report.*
