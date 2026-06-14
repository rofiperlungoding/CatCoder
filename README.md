# CATCODER(1) User Manual

![Branding: Industrial Luxury](https://img.shields.io/badge/DESIGN-INDUSTRIAL_LUXURY-black?style=for-the-badge&labelColor=555555)
![Core: AI Accelerated](https://img.shields.io/badge/CORE-AI_ACCELERATED-FF6F61?style=for-the-badge&labelColor=555555&logo=openai)
![Environment: React 19](https://img.shields.io/badge/ENV-REACT_19-61DAFB?style=for-the-badge&labelColor=555555&logo=react)
![Build: Vite](https://img.shields.io/badge/BUILD-VITE-646CFF?style=for-the-badge&labelColor=555555&logo=vite)

![Database: Supabase](https://img.shields.io/badge/PERSISTENCE-SUPABASE_POSTGRES-3ECF8E?style=for-the-badge&labelColor=555555&logo=supabase)
![Styling: Tailwind CSS 4](https://img.shields.io/badge/STYLING-TAILWIND_4-38B2AC?style=for-the-badge&labelColor=555555&logo=tailwind-css)
![State: Zustand](https://img.shields.io/badge/STATE-ZUSTAND-443322?style=for-the-badge&labelColor=555555)
![Editor: Monaco](https://img.shields.io/badge/EDITOR-MONACO-007ACC?style=for-the-badge&labelColor=555555&logo=visual-studio-code)

![Execution: Pyodide WASM](https://img.shields.io/badge/RUNTIME-PYODIDE_WASM-3776AB?style=for-the-badge&labelColor=555555&logo=python)
![Web: PWA](https://img.shields.io/badge/PLATFORM-PWA_OFFLINE-5A0FC8?style=for-the-badge&labelColor=555555&logo=pwa)
![Testing: Vitest](https://img.shields.io/badge/QUALITY-VITEST-6E9F18?style=for-the-badge&labelColor=555555&logo=vitest)
![Docs: Storybook](https://img.shields.io/badge/DOCS-STORYBOOK-FF4785?style=for-the-badge&labelColor=555555&logo=storybook)

## NAME
CatCoder — AI-accelerated learning platform for software development

## SYNOPSIS
npm run dev
npm run build
npm run storybook

## DESCRIPTION
CatCoder is a curriculum-driven platform designed to modernize the acquisition of software engineering skills. It combines structured learning paths with hands-on practice, gamification, and integrated artificial intelligence to provide a comprehensive educational environment.

The platform is architected to be accessible, open-source, and performance-optimized, supporting real-time code execution and personalized learning insights.

## VISUAL INTERFACE REPRESENTATION
The following sequence provides a technical overview of the platform's primary user interfaces and workflow cycles:

![Screenshot 1](public/ss%20catcoder/1.png)
![Screenshot 2](public/ss%20catcoder/2.png)
![Screenshot 3](public/ss%20catcoder/3.png)
![Screenshot 4](public/ss%20catcoder/4.png)
![Screenshot 5](public/ss%20catcoder/5.png)
![Screenshot 6](public/ss%20catcoder/6.png)
![Screenshot 7](public/ss%20catcoder/7.png)

## ARCHITECTURE
CatCoder utilizes a modern, performance-centric stack for optimal developer and user experience:

- UI Framework: React 19 with Vite.
- Styling: Tailwind CSS 4 using the Emerald design system.
- State Management: Zustand with persistence capabilities.
- Backend/Infrastructure: Supabase (PostgreSQL, Authentication, Row-Level Security).
- Code Execution Engine: Pyodide for WebAssembly-based Python execution and native JavaScript execution.
- Intelligence: OpenAI integration for personalized progress analysis and real-time mentorship.
- Deployment: Progressive Web App (PWA) with offline-first capabilities via Vite PWA.

## CORE MODULES

### AI-Powered Mentorship
- Integrated assistant providing context-aware hints and explanations.
- Insights panel offering personalized XP analysis and skill recommendations.
- Dynamic challenge suggestions based on historical performance metrics.

### Interactive Pedagogy
- Structured curriculum for Python, JavaScript, and C++.
- Browser-resident code execution for immediate feedback loops.
- Hands-on challenges with automated validation.

### Practice and Competition
- Curated repository of algorithmic challenges across three difficulty tiers.
- Global leaderboards and league-based progression (Bronze to Diamond).
- Daily challenges designed to encourage consistent practice and retention.

### Platform Resilience
- Full Progressive Web App (PWA) support for installability.
- Service-worker based caching for offline functionality.
- Performance monitoring via Web Vitals.

## SYSTEM REQUIREMENTS
- Node.js version 18.0.0 or higher.
- npm version 9.0.0 or higher.
- OpenAI API credentials (for mentorship features).
- Supabase Project credentials.

## INSTALLATION AND SETUP

### 1. Clone the Environment
```bash
git clone https://github.com/rofiperlungoding/CatCoder.git
cd CatCoder
```

### 2. Dependency Installation
```bash
npm install
```

### 3a. Quick start — local testing mode (no backend required)
Run the whole app with zero external services. Auth, profiles, progress, and
the leaderboard are backed by your browser's localStorage.
```bash
cp .env.local.example .env.local
npm run dev
```
Then open the app, hit "Create account", and sign up with any email and
password. A demo leaderboard is seeded automatically. This is the fastest way
to explore and test the platform.

### 3b. Full setup — real Supabase
Initialize the environment configuration by creating a `.env` file based on the
provided `.env.example`. Ensure the following keys are specified:
- Supabase URL and Anon Key.
- (Optional) AI proxy configuration for mentorship features.

Set `VITE_BACKEND=supabase` (or simply provide valid Supabase credentials and
omit `VITE_BACKEND`) to use the real backend.

### 4. Development Execution
Launch the local development environment:
```bash
npm run dev
```

### 5. Specialized Tooling
To view the UI component library:
```bash
npm run storybook
```

## BACKEND MODES
CatCoder ships with three interchangeable backends selected via `VITE_BACKEND`:

| Mode | Trigger | Storage |
| --- | --- | --- |
| Local | `VITE_BACKEND=local`, or no Supabase credentials present | Browser localStorage |
| Turso | `VITE_BACKEND=turso` | Cloudflare Worker + Turso (libSQL) via `/api/*` |
| Supabase | `VITE_BACKEND=supabase`, or valid credentials present | PostgreSQL + Auth + RLS |

The local backend implements the subset of the Supabase client the app uses
(auth, table queries, RPC, realtime). It is intended for development and
testing only — it stores credentials in the browser and performs no
server-side enforcement.

## DEPLOY TO CLOUDFLARE (Turso backend)

CatCoder deploys as a single Cloudflare Worker that serves the SPA *and* the
`/api/*` endpoints. The Turso token stays in Worker secrets and never reaches
the browser.

### 1. Create the database (Turso CLI)
```bash
turso db create catcoder
turso db shell catcoder < worker/schema.sql
turso db show catcoder --url        # -> LIBSQL_DB_URL
turso db tokens create catcoder     # -> LIBSQL_DB_AUTH_TOKEN
```

### 2. Configure the Worker
- Put `LIBSQL_DB_URL` into `wrangler.toml` under `[vars]`.
- Set secrets (never commit these):
```bash
npx wrangler secret put LIBSQL_DB_AUTH_TOKEN
npx wrangler secret put AUTH_SECRET
```

### 3. Local development
```bash
# build the SPA, then run the Worker (serves dist + /api) on :8787
npm run cf:dev
```
For live frontend reload, run `npm run cf:dev` in one terminal and
`VITE_BACKEND=turso npm run dev` in another — Vite proxies `/api` to the
Worker on :8787.

### 4. Deploy
```bash
npm run cf:deploy        # build + wrangler deploy
```
Add your custom domain in the Cloudflare dashboard (Workers & Pages → your
Worker → Settings → Domains & Routes).

> Heads up: Turso is a database only. It has no built-in auth, realtime, or
> RLS. CatCoder's Worker provides email/password auth and the leaderboard
> updates by polling. OAuth and magic links require the Supabase backend.

## DOCUMENTATION
Technical documentation and component specifications are maintained through Storybook interfaces for high visibility into the design system.

## SECURITY
Data access is enforced through Supabase Row-Level Security (RLS) policies, ensuring that student data remains isolated and secure.

## LICENSE
Copyright (c) 2026 CatCoder Project. Distributed under the MIT License.
