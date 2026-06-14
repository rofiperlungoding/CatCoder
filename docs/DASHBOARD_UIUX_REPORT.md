# CatCoder — Dashboard UI/UX Design-System Report

> **Canonical spec.** Every value below is read from the live codebase, not approximated.
> Primary sources: `src/index.css` (`:root` tokens + `.cc-*` utilities), `src/components/ds/*`,
> `src/components/layout/{Sidebar,MainLayout,CommandPalette}.tsx`, `src/pages/Home/index.tsx`,
> `tailwind.config.js`, `src/main.tsx`.
>
> The design system is **opt-in**: tokens live on `:root`, but the look is scoped behind the
> `.cc-root` wrapper class. Any new page must render inside a `.cc-root` container to inherit
> the fonts and base color. Utility classes are prefixed `cc-`.

---

## 1. Foundations / Design Tokens

### 1.1 Color palette

All colors are CSS custom properties on `:root` (defined in `src/index.css`). Use the **token**, not the raw hex, in new code.

#### Surfaces / backgrounds

| Token | Value | Role / where used |
|---|---|---|
| `--cc-bg` | `#0a0b0d` | App canvas behind everything; focus-ring inner color; mobile drawer bg |
| `--cc-surface-1` | `#121316` | Sidebar surface; recessed wells; progress track base; lowest card layer |
| `--cc-surface-2` | `#181a1e` | Default card surface (`.cc-card`); flyout/command-palette panel |
| `--cc-surface-3` | `#202329` | Raised chips, pills, icon-wells fill, secondary button, active nav chip |
| `--cc-edge-light` | `rgba(255,255,255,0.06)` | 1px top “light edge” on raised elements, flyout/tooltip borders |
| `--cc-border` | `rgba(255,255,255,0.08)` | Default hairline border on cards, dividers, inputs |

#### Text levels

| Token | Value | Role |
|---|---|---|
| `--cc-tx-1` | `#f7f8f8` | Primary text: titles, values, active labels |
| `--cc-tx-2` | `#a0a4ad` | Secondary text: body copy, descriptions, inactive nav |
| `--cc-tx-3` | `#686d77` | Tertiary text: eyebrows, meta, captions, muted icons |

#### Brand (lime)

| Token | Value | Role |
|---|---|---|
| `--cc-brand-1` | `#bef264` | Brand text/icon accent, active-state text, light end of gradients |
| `--cc-brand-2` | `#a3e635` | Brand fill, focus ring, dark end of gradients |

> Brand gradient used on primary button & progress fill: `linear-gradient(180deg, #c8f56e, #a3e635)` — note the **`#c8f56e`** top stop is a literal (slightly lighter than `--cc-brand-1`), used directly in `--cc-btn-primary-bg`, `.cc-progress-fill`, sparklines, and SVG ring gradients.

#### Semantic

| Token | Value | Meaning | Usage |
|---|---|---|---|
| `--cc-ac` | `#4ade80` | Accepted / easy | “easy” difficulty chip text |
| `--cc-wa` | `#fb7185` | Wrong / hard | “hard” difficulty chip text; destructive |
| `--cc-tle` | `#fbbf24` | Time-limit / medium | “medium” difficulty chip; streak flame |
| `--cc-info` | `#60a5fa` | Info | informational accents |

#### Tailwind accent classes seen on Dashboard (icon tints only)

`text-lime-300` (Experience / brand icon-well), `text-orange-300` (Day Streak), `text-sky-300` (Solved), `text-amber-300` (Leaderboard trophy + rank 1), `text-slate-300` (rank 2), `text-orange-300` (rank 3). These tint **icons inside wells only** — never body text.

### 1.2 Elevation / shadow tokens

Soft-UI recipe = **inset top light edge** + **layered drop shadow**. Applied via `.cc-e1/.cc-e2/.cc-e3` helpers or the token directly.

| Level | Token | Value | Intended use |
|---|---|---|---|
| L1 | `--cc-e1` | `inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.45)` | Resting cards, stat cards, pills, active nav chip, avatars |
| L2 | `--cc-e2` | `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 14px rgba(0,0,0,0.40)` | Hero card; tooltip; current-user leaderboard row |
| L3 | `--cc-e3` | `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 36px rgba(0,0,0,0.50)` | Floating rail (sidebar); guest hero; modals |
| Pop | `--cc-pop-elev` | `inset 0 1px 0 rgba(255,255,255,.07), 0 14px 36px rgba(0,0,0,.5)` | Flyout popovers, command palette (same recipe as L3) |
| Recessed | `--cc-well` | `inset 0 2px 5px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)` | Inset wells: progress track, icon-wells, search field |
| Brand glow | `--cc-glow-brand` | `0 0 24px rgba(163,230,53,0.18)` | Ambient lime glow on progress fill, active rows |
| Sheen | `--cc-surface-sheen` | `linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0) 38%)` | Top sheen overlay on `.cc-card` |
| Primary btn | `--cc-btn-primary-shadow` | `inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 18px rgba(163,230,53,0.22)` | Resting primary button |

> **L0** = a flat element with no shadow (transparent ghost surfaces, sub-nav items). There is no token; it simply omits a shadow.

### 1.3 Border-radius scale

| Token | Value | Usage |
|---|---|---|
| `--cc-r-sm` | `12px` | Buttons (all sizes), icon-wells, tooltips, search field |
| `--cc-r` | `16px` | Flyout popover, medium containers |
| `--cc-r-lg` | `20px` | `.cc-card` default (all Surfaces), progress-pod card |
| `--cc-r-xl` | `24px` | Large containers |
| `--cc-r-pill` | `999px` | Pills, badges, progress track + fill, rank circles |
| — | `2rem` (32px) | Floating sidebar rail shell (`rounded-[2rem]`, literal) |

Tailwind config (`tailwind.config.js`) also defines legacy radii used by older `ui/` components: `lg: 1.5rem`, `md: 1rem`, `sm: 0.5rem`. **New DS work should prefer the `--cc-r-*` tokens.**

### 1.4 Spacing scale (8pt rhythm)

The system follows a **4 / 8 / 12 / 16 / 24 / 32 / 40** scale (Tailwind steps `1/2/3/4/6/8/10`). Use only these.

| px | rem | Tailwind | Typical use |
|---|---|---|---|
| 4 | 0.25 | `1` / `gap-1` | icon↔text micro gaps, sparkline bars |
| 6 | 0.375 | `1.5` | eyebrow→title, title→subtitle tight pairs |
| 8 | 0.5 | `2` | chip row gaps, list item padding |
| 12 | 0.75 | `3` | icon↔label, row padding |
| 16 | 1 | `4` | grid gutter (stat/lower rows = `gap-4`), header gap |
| 20 | 1.25 | `5` | **standard card padding** (`p-5`), in-card section gaps |
| 24 | 1.5 | `6` | dashboard section gap (`space-y-6`), hero inner gaps |
| 28 | 1.75 | `7` | hero card padding mobile (`p-7`) |
| 32 | 2 | `8` | page edge padding (`lg:p-8`), hero card padding desktop (`md:p-8`) |
| 40 | 2.5 | `10` | large column gaps |

**Rhythm rule:** related elements tighten (6–12px); section breaks widen (24–32px). More space ⇒ weaker relationship.

### 1.5 Typography

Fonts loaded as variable fonts in `src/main.tsx` (`@fontsource-variable/*`) and mapped to tokens:

| Token | Stack |
|---|---|
| `--cc-font-display` | `"Space Grotesk Variable", "Inter Variable", system-ui, sans-serif` |
| `--cc-font-sans` | `"Inter Variable", system-ui, -apple-system, sans-serif` |
| `--cc-font-mono` | `"JetBrains Mono Variable", ui-monospace, monospace` |

`.cc-root` sets body font to `--cc-font-sans` + `-webkit-font-smoothing: antialiased`. Headings (`.cc-root h1/h2/h3`, `.cc-display`) auto-use `--cc-font-display` with `letter-spacing: -0.02em; line-height: 1.1`.

| Role | Font | Size | Weight | Line-height | Tracking | Color | Source class/usage |
|---|---|---|---|---|---|---|---|
| Display / H1 (“Welcome back”) | display | `text-3xl` = 1.875rem/30px | 700 | 1.1 | -0.02em | `--cc-tx-2` w/ `--cc-tx-1` name span | `Home` header |
| Hero H2 (course title) | display | `text-2xl` = 1.5rem/24px | 700 | 1.1 | -0.02em | `--cc-tx-1` | hero |
| Card H3 (challenge title) | display | `text-lg` = 1.125rem/18px | 700 | 1.1 | -0.02em | `--cc-tx-1` | Daily Challenge |
| Guest H1 | display | `text-4xl md:text-5xl` (2.25/3rem) | 800 | 1.1 | -0.02em | `--cc-tx-1` | guest hero |
| Body | sans | `text-sm` = 0.875rem/14px | 400 | 1.5 | normal | `--cc-tx-2` | descriptions, subtitle |
| Caption / meta | sans | `text-xs` = 0.75rem/12px | 400 | 1.5 | normal | `--cc-tx-3` | meta lines |
| Eyebrow (`.cc-eyebrow`) | mono | `0.6875rem`/11px | 600 | — | +0.08em, UPPERCASE | `--cc-tx-3` | section labels |
| Stat value | mono | `1.75rem`/28px | 700 | 1 (leading-none) | normal | `--cc-tx-1` | StatCard |
| Numeric (`.cc-mono`) | mono | inherits | inherits | — | — | inherits | `font-variant-numeric: tabular-nums` |
| Nav label | sans | `text-sm`/14px | 500 | — | — | `--cc-tx-2` / active `--cc-brand-1` | Sidebar |
| Pill / chip | sans | `0.75rem`/12px (or `text-[11px]`) | 600 | — | — | varies | `.cc-pill` |

### 1.6 Iconography

- **Set:** HugeIcons (`@hugeicons/core-free-icons` rendered via `@hugeicons/react` `<HugeiconsIcon>`; some via `ui/Icon` wrapper).
- **Default sizes (px):** `12` inline with eyebrows; `13–16` inside pills/buttons; `18–20` nav + stat icon-wells; `24–26` hero icon-well; `40` decorative.
- **Stroke width:** default; `strokeWidth={1.5}` for large/hero icons, `1.8` for stat-well icons.
- **Color rule:** icons inherit `currentColor`. Inside a `cc-icon-well` they are tinted with a Tailwind accent class (`text-lime-300`, etc.). Active nav icons inherit `--cc-brand-1`. Standalone icons use a text token.

---

## 2. Layout System

### 2.1 App shell

Defined in `src/components/layout/MainLayout.tsx` + `Sidebar.tsx`.

| Property | Expanded | Collapsed (icon-rail) |
|---|---|---|
| Sidebar width | `w-72` = **288px** | `w-[72px]` = **72px** |
| Rail position | `fixed left-6 top-6 bottom-6` (24px inset, floating) | same |
| Rail shape | `rounded-[2rem]`, `border: 1px solid var(--cc-border)`, `box-shadow: var(--cc-e3)` | same |
| Rail overflow | `hidden` (clips to radius) | `visible` (lets flyouts/tooltips escape) |
| Width transition | `width 180ms ease` | `width 180ms ease` |
| Content left padding | `lg:pl-[22rem]` = **352px** | `lg:pl-[7rem]` = **112px** |
| Content pad transition | `padding-left 180ms ease` | same |

- **Content centering:** `<main>` has `p-4 lg:p-8` (16px → 32px edge padding) and left padding above; inner wrapper is `max-w-[1600px] mx-auto`. The **Dashboard page** further constrains its own content to `max-w-[1120px] mx-auto`.
- **Collapse state** is persisted to `localStorage['cc-sidebar-collapsed']` (`'1'`/`'0'`) via `useUIStore`.
- **Push vs overlay:**
  - `lg` (≥1024px): sidebar is a fixed floating rail; content is **pushed** via left padding. Collapse animates both rail width and content padding (180ms).
  - `< lg`: rail hidden. A fixed top bar (`h-16` = 64px, `rgba(10,11,13,.85)` + blur, bottom hairline) shows brand + search + menu button. Opening the menu renders a **full-screen overlay drawer** (`fixed inset-0 pt-16`, bg `--cc-bg`) that always uses the expanded layout.

### 2.2 Page grid (Dashboard)

| Region | Structure | Gap | Padding |
|---|---|---|---|
| Page container | `max-w-[1120px] mx-auto space-y-6` | 24px between sections | (edge padding from `<main>`) |
| Header | `flex flex-col md:flex-row md:items-center justify-between gap-4` | 16px | — |
| Hero card | single `Surface elevation={2} glow` | inner `mb-5/mb-6` | `p-7 md:p-8` (28/32px) |
| Stat row | `grid grid-cols-1 sm:grid-cols-3 gap-4` | 16px gutter | cards `p-5` (20px) |
| Lower row | `grid grid-cols-1 lg:grid-cols-3 gap-4` | 16px gutter | cards `p-5` (20px) |

Standard **card padding = 20px (`p-5`)**; the hero is the exception at 28–32px.

### 2.3 Responsive breakpoints (Tailwind defaults)

| Name | Min width | Dashboard behavior |
|---|---|---|
| base | 0 | single column; mobile top bar + drawer; cards stack |
| `sm` | 640px | stat row → 3 columns; hero icon+text row |
| `md` | 768px | header goes row + space-between; “Daily Code” button shows; hero `p-8` |
| `lg` | 1024px | sidebar rail appears (content padded); lower row → 3 columns |
| `xl` | 1280px | — |
| `2xl` | 1536px | content capped by `max-w-[1600px]` / page `max-w-[1120px]` |

---

## 3. Component Inventory

> Shared base: **`.cc-card`** = `position:relative; background:var(--cc-surface-2); background-image:var(--cc-surface-sheen); border:1px solid var(--cc-border); border-radius:var(--cc-r-lg); box-shadow:var(--cc-e1)`. The `Surface` component layers `cc-e1/e2/e3` on top and optionally `.cc-glow`.

### 3.1 Sidebar  (`components/layout/Sidebar.tsx`)

**Anatomy (expanded, top→bottom):** brand block → search trigger → `MENU` eyebrow → scrollable nav → flexible slack → “You” zone (progress pod + Daily Challenge button) → divider → user card.

- **Surface:** `--cc-surface-1`, faint top radial glow `radial-gradient(120% 80% at 50% 0%, rgba(163,230,53,.10), transparent 70%)`.
- **Brand:** `cc-icon-well` 40×40 (`w-10 h-10`, bg `--cc-surface-3`, `--cc-e1`) holding the inline `CatMark` SVG (lime cat head + `< >` chevron eyes); wordmark `--cc-font-display` 700, 18px, `--cc-tx-1`. Collapse toggle = ghost icon button (chevron) on the right.
- **Search trigger (`.cc-search`):** inset-well field, height 38px, `border-radius:var(--cc-r-sm)`, `box-shadow:var(--cc-well)`, placeholder `--cc-tx-3`, plus a raised **kbd chip** (`.cc-kbd`: `--cc-surface-2`, border `--cc-border`, `--cc-e1`, mono 11px) reading `Ctrl K`. Opens the command palette. Collapsed → square search icon button.
- **Nav item (`.cc-nav-item`):** flex, `gap-3`, `px-4 py-3`, `rounded-xl`, label Inter 500 14px, icon 19px.
  - default: `color:var(--cc-tx-2)`, transparent 1px border (reserves space).
  - hover (non-active): `background:var(--cc-surface-2); color:var(--cc-tx-1); box-shadow: inset 0 1px 0 var(--cc-edge-light)`.
  - **active (`.cc-nav-item-active`):** `background:var(--cc-surface-3); color:var(--cc-brand-1); box-shadow:var(--cc-e1), 0 0 18px rgba(163,230,53,.10); border:1px solid var(--cc-border)`, plus a 3px lime left accent bar (`::before`, `linear-gradient(180deg,var(--cc-brand-1),var(--cc-brand-2))`, glow `0 0 8px rgba(163,230,53,.55)`). `aria-current="page"`.
  - focus-visible: `ring-2 ring-lime-400/60`.
- **Nested nav:** Learn / Practice / Compete are expandable (chevron toggles a `.cc-collapsible` grid-rows 0fr→1fr animation, 240ms `cubic-bezier(.4,0,.2,1)` + opacity fade). Sub-items `.cc-subnav-item` indented under a 1px tree-connector (`.cc-subnav::before`); active sub-item = `--cc-brand-1` text + lime glowing `.cc-subnav-dot`. Home & Roadmap are flat.
- **Collapsed rail:** icon-only nav (44×44). Plain items show a **tooltip** (`.cc-tooltip`: `--cc-surface-3`, `--cc-e2`); items with children show a **flyout** (`.cc-flyout`: `--cc-surface-2`, border `--cc-edge-light`, `--cc-pop-elev`, `border-radius:var(--cc-r)`, `cc-pop-in` 140ms).
- **Progress pod (“You”):** `.cc-card` `--cc-surface-2`, league badge chip (tier-colored `.cc-league-*`), XP bar (`.cc-progress-track` + fill), streak pill, SVG daily-goal ring. Collapsed → ring + tiny streak only.
- **League widget (`.cc-league-*` on a `.cc-pill`, `box-shadow:var(--cc-e1)`):** bronze `#d8975a`, silver `#cfd4da`, gold `#ffd770`, platinum `#a3e4d7`, diamond `#b9f2ff` — each with matching `rgba(...,.10)` bg and `.3` border.
- **User card:** avatar (ring `ring-1 ring-white/10` + `--cc-e1`) + username (`--cc-tx-1` 14/600) + league (`--cc-tx-3`); View Profile = ghost button, Sign Out = ghost icon button. Collapsed → avatar only.
- **Scrollbar (`.cc-scroll`):** thin, thumb `rgba(255,255,255,.10)` → hover `.18`, transparent track.

### 3.2 Top header  (`Home`)

- **Date kicker:** `.cc-eyebrow` + 12px calendar icon, `mb-1.5` (6px) above the title.
- **Title:** `text-3xl` 700 display, `--cc-tx-2` with the username in `--cc-tx-1`.
- **“Daily Code” button:** `Button variant="secondary" size="md"`, hidden below `md`, aligned to title baseline (`md:items-center`).

### 3.3 Hero “Current Course” card  (`Home`)

- **Surface:** `elevation={2}` + `glow`, padding `p-7 md:p-8` (28/32px), single column.
- **Anatomy:** icon row (`cc-icon-well` 48×48 `text-lime-300` + eyebrow + H2 title, `gap-4`, `mb-5`) → subtitle (`text-sm`, `--cc-tx-2`, `mb-6`) → progress block (`mb-6`: eyebrow “Progress” + mono `%·done/total`, then `Progress` `h-2`) → primary `Button size="lg"` (auto-width, label `Start`/`Continue` + 18px arrow).
- **Accent:** lime appears only on the icon tint, the progress fill, and the primary button. Glow sits behind the right void.
- **Zero/first-run state:** subtitle becomes “Start your first lesson and begin your streak.”; button label `Start`.

### 3.4 Stat cards  (`ds/StatCard.tsx`)

- **Surface:** `elevation={1}`, `p-5`, `flex flex-col gap-3` (12px).
- **Anatomy:** top row = eyebrow + optional `delta` pill (`.cc-pill .cc-pill-brand`, 11px); value row = `cc-icon-well` 40×40 (accent-tinted, 20px icon) + value (`cc-mono` 28px/700, `--cc-tx-1`); optional sparkline (`h-7`, lime gradient bars, empty bars `--cc-surface-3` @ .5 opacity); optional `Progress h-1.5`; optional meta (`text-xs`, `--cc-tx-3`).
- **Dashboard instances:** Experience (`text-lime-300`, delta `Lv n`, progress = level %), Day Streak (`text-orange-300`, sparkline = week activity), Solved (`text-sky-300`, meta).
- **Empty state:** Solved meta shows “Solve one for +100 XP” when first-run instead of a bare `0`.

### 3.5 Daily Challenge card  (`Home`)

- **Surface:** `elevation={1}`, `p-5`, `flex flex-col`.
- **Anatomy:** header row = eyebrow “Daily Challenge” + XP pill (`.cc-pill .cc-pill-brand` mono, `+150 XP`); H3 title (18/700); description (`text-xs`, `--cc-tx-2`, `line-clamp-2`, cleaned of markdown via `cleanDesc`); chip row (`gap-1.5`): difficulty chip (color = `--cc-ac`/`--cc-tle`/`--cc-wa`) + up to 2 tag chips + mono `~Nm` estimate; footer `Button variant="secondary" size="md" fullWidth` “Solve now” pinned with `mt-auto`.

### 3.6 Leaderboard card  (`Home` + `ds/LeaderboardRow.tsx`)

- **Surface:** `elevation={1}`, `p-5`. Header = trophy in `cc-icon-well` 28×28 (`text-amber-300`) + eyebrow.
- **Row (`LeaderboardRow`):** `flex items-center gap-3 p-2 rounded-xl`. Rank circle (`cc-mono` 24×24; ranks 1/2/3 tinted amber/slate/orange-300, else `--cc-tx-3`) + avatar (sm 32×32, ring + `--cc-e1`) + name (`text-sm` 700) + XP (`cc-mono` 10px, `--cc-tx-3`).
  - **current user:** bg `--cc-surface-3`, border `rgba(163,230,53,.25)`, `box-shadow:var(--cc-e2), var(--cc-glow-brand)`, name → `--cc-brand-1`, label “You”.
- **Loading:** 5 skeleton rows (`Skeleton` shimmer). **Empty:** centered faded trophy + “No pioneers yet — be the first.”
- **Footer:** divider + ghost button “View full standings →”.

### 3.7 This Week card  (`Home`)

- **Surface:** `elevation={1}`, `p-5`. Header = eyebrow + actions pill (`.cc-pill` mono).
- **Body:** 7 bars in inset wells (`cc-icon-well`, `min-h-[80px]`), height ∝ daily count, lime gradient fill with inset light edge; today’s weekday label tinted `--cc-brand-1`, others `--cc-tx-3`. Caption line in `--cc-tx-3`.

### 3.8 Buttons  (`ds/Button.tsx` + `.cc-btn*`)

Base `.cc-btn`: inline-flex, `gap-0.5rem`, weight 600, `border-radius:var(--cc-r-sm)` (12px), `transition: transform/box-shadow/background-color 180ms ease-out`, GPU-promoted (`translateZ(0)`, `backface-visibility:hidden`, `will-change:transform`, forced `-webkit-font-smoothing:antialiased` — fixes variable-font hover jitter).

| Size | Height | Padding-x | Text | Icon-only |
|---|---|---|---|---|
| `sm` | `h-8` = 32px | `px-3.5` | `text-xs` | 32×32 |
| `md` | `h-10` = 40px | `px-5` | `text-sm` | 40×40 |
| `lg` | `h-11` = 44px | `px-6` | `text-base` | 44×44 |

| Variant | Rest | Hover | Active |
|---|---|---|---|
| `primary` (`.cc-btn-primary`) | bg `--cc-btn-primary-bg`, text `#14310a`, shadow `--cc-btn-primary-shadow` | `translate3d(0,-1px,0)` + `inset 0 1px 0 rgba(255,255,255,.5), 0 10px 24px rgba(163,230,53,.3)` | `translate3d(0,1px,0)` + reduced glow |
| `secondary` (`.cc-btn-secondary`) | bg `--cc-surface-3`, text `--cc-tx-1`, border `--cc-border`, `--cc-e1` | `translate3d(0,-1px,0)`, bg `#262a31` | `translate3d(0,1px,0)` |
| `ghost` (`.cc-btn-ghost`) | transparent, text `--cc-tx-2` | `translate3d(0,-1px,0)`, bg `rgba(255,255,255,.05)`, text `--cc-tx-1` | `translate3d(0,1px,0)` |
| `icon` | = secondary, square | = secondary | = secondary |

- **focus-visible:** `box-shadow: 0 0 0 2px var(--cc-bg), 0 0 0 4px var(--cc-brand-2)` (lime ring on a bg-colored gap).
- **disabled:** `opacity:0.5; cursor:not-allowed`.
- **Discipline:** exactly **one `primary` per screen** (Dashboard = hero “Continue”). Everything else secondary/ghost.

### 3.9 Chips / Pills / Badges  (`.cc-pill`, `ds/Pill.tsx`)

- Base: `display:inline-flex; gap:0.375rem; padding:0.125rem 0.625rem` (2px 10px); `border-radius:var(--cc-r-pill)`; `font-size:0.75rem; font-weight:600`; bg `--cc-surface-3`; text `--cc-tx-2`; border `--cc-border`; `box-shadow:var(--cc-e1)`.
- **brand variant (`.cc-pill-brand`):** bg `rgba(163,230,53,.12)`, text `--cc-brand-1`, border `rgba(163,230,53,.25)`.
- Difficulty chips override `color` inline with the semantic token; sizes often `text-[11px]`.

### 3.10 Progress bar  (`ds/Progress.tsx`, `.cc-progress-*`)

- Track `.cc-progress-track`: bg `--cc-surface-1`, `border-radius:var(--cc-r-pill)`, `overflow:hidden`, `box-shadow:var(--cc-well)`. Height via class (`h-2` default, `h-1.5` in StatCard).
- Fill `.cc-progress-fill`: `linear-gradient(180deg,#c8f56e,var(--cc-brand-2))`, `box-shadow: inset 0 1px 0 rgba(255,255,255,.4), var(--cc-glow-brand)`, `transition: width 400ms ease-out`.
- Role `progressbar` with `aria-valuenow/min/max`.

### 3.11 Progress ring (SVG, inline in pages)

- Two stacked `<circle>` on a 0–100 normalized arc: track `rgba(255,255,255,.08)`, fill `url(#…)` gradient `#c8f56e → #a3e635`, `stroke-linecap:round`, `transform: rotate(-90 …)`, `transition: stroke-dashoffset 400ms ease-out`. Stroke width 6–8px depending on size. Center shows mono value. (Used by the sidebar daily-goal ring.)

### 3.12 Avatars  (`ui/Avatar.tsx`)

| Size | Dimensions | Text |
|---|---|---|
| `sm` | 32×32 (`w-8 h-8`) | `text-xs` |
| `md` | 40×40 | `text-sm` |
| `lg` | 48×48 | `text-base` |
| `xl` | 64×64 | `text-lg` |

Round, `overflow-hidden`; fallback = uppercase initial. In the DS, wrap in a `rounded-full` div with `box-shadow:var(--cc-e1)` and `ring-1 ring-white/10`.

### 3.13 Tooltips / menus / command palette

- **Tooltip (`.cc-tooltip`):** `--cc-surface-3`, border `--cc-edge-light`, `--cc-e2`, `border-radius:var(--cc-r-sm)`, 12/600 text, `cc-pop-in` 120ms. Appears right of collapsed rail items.
- **Flyout (`.cc-flyout`):** see §3.1.
- **Command palette (`CommandPalette.tsx`):** centered modal (`pt-[12vh]`, scrim `rgba(0,0,0,.6)` + blur), panel `max-w-xl` `--cc-surface-2` + sheen + `--cc-edge-light` border + `--cc-pop-elev`, `rounded-2xl`. Search row (height `h-14`) + grouped results (Pages/Problems) with active row bg `--cc-surface-3`, active icon `--cc-brand-1`. Footer kbd hints. Opens on `Ctrl/Cmd+K`; `↑/↓` move, `Enter` selects, `Esc` closes.
- **Skeleton (`.cc-skeleton`):** bg `--cc-surface-3`, `border-radius:var(--cc-r-sm)`, sliding shimmer `cc-shimmer` 1.4s infinite.

---

## 4. Interaction & Motion

| Interaction | Properties | Duration | Easing |
|---|---|---|---|
| Button hover/press | `transform, box-shadow, background-color` | 180ms | `ease-out` |
| Nav item state | `background-color, color, box-shadow` | 180ms | `ease-out` |
| Sidebar collapse | `width` (rail) + `padding-left` (content) | 180ms | `ease` |
| Sub-nav expand/retract | `grid-template-rows` 0fr→1fr (+opacity 200ms) | 240ms | `cubic-bezier(.4,0,.2,1)` |
| Progress fill / ring | `width` / `stroke-dashoffset` | 400ms | `ease-out` |
| Flyout enter | `cc-pop-in` (opacity + 6px slide) | 140ms | `ease-out` |
| Tooltip enter | `cc-pop-in` | 120ms | `ease-out` |
| Skeleton shimmer | `cc-shimmer` translateX | 1.4s loop | linear |
| Page content enter | `animate-in fade-in slide-in-from-bottom-4` (tailwindcss-animate) | 500ms | default |

- **Press feedback:** primary/secondary buttons physically dip (`translate3d(0,1px,0)`) on `:active`.
- **GPU promotion:** `.cc-btn` is layer-promoted so transforms don’t re-rasterize variable-font glyphs (prevents hover “text jitter”).
- **focus-visible:** lime double-ring on buttons; `ring-2 ring-lime-400/60` on nav/links.

---

## 5. Accessibility

- **Contrast (computed on `--cc-bg` `#0a0b0d` unless noted):**
  - `--cc-tx-1` `#f7f8f8` on bg ≈ **18.9:1** (AAA).
  - `--cc-tx-2` `#a0a4ad` on bg ≈ **8.0:1** (AAA for normal text).
  - `--cc-tx-3` `#686d77` on bg ≈ **3.6:1** — **AA for large/bold & UI text only**; do not use for long body copy.
  - `--cc-brand-1` `#bef264` on bg ≈ **13.7:1** (AAA).
  - Primary button text `#14310a` on lime `#a3e635` ≈ **9.8:1** (AAA).
  - Difficulty/semantic colors on surface-3 `#202329` clear AA for chip text (`--cc-ac` ~7.7:1, `--cc-tle` ~9.1:1, `--cc-wa` ~5.7:1).
- **Focus visibility:** every interactive element has a `focus-visible` ring (lime). Never remove it.
- **Keyboard:** nav via `NavLink`s; expandable items expose `aria-expanded`; active item `aria-current="page"`; command palette fully keyboard-driven (`Ctrl/Cmd+K`, arrows, Enter, Esc); collapsed sub-links are `tabIndex=-1` + `aria-hidden` while closed; mobile drawer is `role="dialog" aria-modal="true"`.
- **Semantics:** progress bars use `role="progressbar"` + `aria-valuenow/min/max`; decorative icons/glows are `aria-hidden`; rings carry `role="img"` + `aria-label`.
- **Reduced motion:** ⚠️ **Gap** — there is currently no `@media (prefers-reduced-motion: reduce)` handling. New work should add it to disable the 180–400ms transitions and shimmer for users who request it.

---

## 6. Reuse Rules — “How to apply to a new page”

### 6.1 Do / Don’t

**Do**
- Wrap the page root in `.cc-root` and constrain with `max-w-[1120px] mx-auto`.
- Use `Surface` for every card; default `elevation={1}`, raise the single focal tile to `2`.
- Use `--cc-*` tokens for all color/shadow/radius; use the spacing scale (4/8/12/16/24/32/40).
- Use `.cc-eyebrow` for section labels, `.cc-mono` for all numbers.
- Use the `ds/` components (`Button`, `Pill`, `Progress`, `StatCard`, `Skeleton`, `LeaderboardRow`, `Surface`) instead of re-styling.
- Keep exactly one `primary` button per screen; everything else `secondary`/`ghost`.
- Provide loading (`Skeleton`) and empty states (short prompt, not bare `0`s).

**Don’t**
- Don’t introduce new hex values, radii, or one-off shadows — extend tokens instead.
- Don’t tint body text lime; lime is for the single primary action, active state, brand mark, and progress fill only.
- Don’t raise every card — most stay flat/L1; over-elevation kills hierarchy.
- Don’t use more than ~one ambient `glow` per screen.
- Don’t add borders to separate blocks when spacing will do.
- Don’t stack all-caps eyebrows everywhere — label only what needs it.

### 6.2 Discipline cheatsheet

- **Accent (lime):** primary button · active nav/route · brand mark · progress fill/ring · current-user highlight. Nothing else.
- **Elevation:** L1 resting cards → L2 one focal card → L3 floating/overlay only.
- **Eyebrow:** one per card section, mono uppercase `--cc-tx-3`.
- **Spacing:** card padding 20px; section gap 24px; grid gutter 16px; page edge 32px (`lg:p-8`).
- **Empty state:** replace zeros with an action prompt (“Solve one for +100 XP”, “Start your first lesson”).

### 6.3 Page skeleton template

```tsx
import { Surface, Button } from '../../components/ds';

export const SomePage = () => (
  <div className="cc-root max-w-[1120px] mx-auto space-y-6">
    {/* Header */}
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span className="cc-eyebrow">Section</span>
        <h1 className="text-3xl font-bold mt-1.5" style={{ color: 'var(--cc-tx-1)' }}>
          Page Title
        </h1>
      </div>
      {/* optional secondary action */}
      <Button variant="secondary" size="md">Action</Button>
    </header>

    {/* Focal tile (the only elevation-2 / glow on the page) */}
    <Surface elevation={2} glow className="p-7 md:p-8">
      {/* eyebrow → title → body → progress → ONE primary button */}
      <Button size="lg">Primary action</Button>
    </Surface>

    {/* Content grid — flat L1 cards, 16px gutter */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Surface elevation={1} className="p-5">…</Surface>
      <Surface elevation={1} className="p-5">…</Surface>
      <Surface elevation={1} className="p-5">…</Surface>
    </div>
  </div>
);
```

---

## 7. Token Reference Appendix

### 7.1 CSS custom properties (verbatim from `src/index.css` `:root`)

```css
:root {
  /* surfaces */
  --cc-bg: #0a0b0d;
  --cc-surface-1: #121316;
  --cc-surface-2: #181a1e;
  --cc-surface-3: #202329;
  --cc-edge-light: rgba(255, 255, 255, 0.06);
  --cc-border: rgba(255, 255, 255, 0.08);

  /* brand + text */
  --cc-brand-1: #bef264;
  --cc-brand-2: #a3e635;
  --cc-tx-1: #f7f8f8;
  --cc-tx-2: #a0a4ad;
  --cc-tx-3: #686d77;

  /* semantic */
  --cc-ac: #4ade80;
  --cc-wa: #fb7185;
  --cc-tle: #fbbf24;
  --cc-info: #60a5fa;

  /* elevation (light edge on top + layered drop shadow) */
  --cc-e1: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 2px rgba(0, 0, 0, 0.45);
  --cc-e2: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 14px rgba(0, 0, 0, 0.40);
  --cc-e3: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 14px 36px rgba(0, 0, 0, 0.50);
  --cc-surface-sheen: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0) 38%);

  /* primary button (clay-lite) */
  --cc-btn-primary-bg: linear-gradient(180deg, #c8f56e, #a3e635);
  --cc-btn-primary-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 6px 18px rgba(163, 230, 53, 0.22);

  /* recessed / cekung + brand glow (v2) */
  --cc-well: inset 0 2px 5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  --cc-glow-brand: 0 0 24px rgba(163, 230, 53, 0.18);

  /* radius */
  --cc-r-sm: 12px;
  --cc-r: 16px;
  --cc-r-lg: 20px;
  --cc-r-xl: 24px;
  --cc-r-pill: 999px;

  /* fonts */
  --cc-font-display: "Space Grotesk Variable", "Inter Variable", system-ui, sans-serif;
  --cc-font-sans: "Inter Variable", system-ui, -apple-system, sans-serif;
  --cc-font-mono: "JetBrains Mono Variable", ui-monospace, monospace;

  /* Sidebar Pack #4 */
  --cc-pop-elev: inset 0 1px 0 rgba(255,255,255,.07), 0 14px 36px rgba(0,0,0,.5);
}
```

### 7.2 League tier colors (`.cc-league-*`)

```css
.cc-league { box-shadow: var(--cc-e1); }
.cc-league-bronze   { color: #d8975a; border-color: rgba(216,151,90,.3);  background-color: rgba(216,151,90,.10); }
.cc-league-silver   { color: #cfd4da; border-color: rgba(207,212,218,.3); background-color: rgba(207,212,218,.10); }
.cc-league-gold     { color: #ffd770; border-color: rgba(255,215,112,.3); background-color: rgba(255,215,112,.10); }
.cc-league-platinum { color: #a3e4d7; border-color: rgba(163,228,215,.3); background-color: rgba(163,228,215,.10); }
.cc-league-diamond  { color: #b9f2ff; border-color: rgba(185,242,255,.3); background-color: rgba(185,242,255,.10); }
```

### 7.3 Tailwind theme extensions (`tailwind.config.js`)

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['"SF Pro Display"', 'system-ui', '-apple-system', 'sans-serif'],
    },
    colors: {
      gray: colors.neutral,            // neutral gray, no blue tint
      border: "var(--border-color)",
      input: "var(--border-color)",
      ring: "#84CC16",                 // lime
      background: "var(--bg-color)",
      foreground: "var(--fg-color)",
      primary:     { DEFAULT: "var(--fg-color)",     foreground: "var(--bg-color)" },
      secondary:   { DEFAULT: "var(--secondary-bg)", foreground: "var(--secondary-fg)" },
      accent:      { DEFAULT: "#84CC16",             foreground: "#FFFFFF" },
      destructive: { DEFAULT: "#ef4444",             foreground: "#FFFFFF" },
      muted:       { DEFAULT: "var(--muted-bg)",     foreground: "var(--muted-fg)" },
      popover:     { DEFAULT: "var(--card-bg)",      foreground: "var(--fg-color)" },
      card:        { DEFAULT: "var(--card-bg)",      foreground: "var(--fg-color)" },
    },
    borderRadius: { lg: "1.5rem", md: "1rem", sm: "0.5rem" },
  },
}
```

> **Note on two color systems:** the legacy `ui/` components use the Tailwind `var(--bg-color)/--fg-color/...` theme (auto-flipping light/dark, lime `#84CC16`). The **DS (`ds/` + `cc-*`)** is the canonical dark system using `--cc-*` tokens and lime `#a3e635/#bef264`. **New pages must use the `cc-*` / `ds/` system**; the legacy theme is retained only for older shared widgets (modals, inputs, toasts).

### 7.4 Key utility classes (quick map)

| Class | Purpose |
|---|---|
| `.cc-root` | opt-in wrapper: sans font + `--cc-tx-1` + antialiasing |
| `.cc-card` | base card surface (surface-2 + sheen + border + r-lg + e1) |
| `.cc-e1/.cc-e2/.cc-e3` | elevation shadows |
| `.cc-surface-1/2/3` | background-color helpers |
| `.cc-eyebrow` | mono uppercase 11px label, `--cc-tx-3` |
| `.cc-mono` | mono + tabular-nums |
| `.cc-display` | display font heading |
| `.cc-btn` + `.cc-btn-primary/secondary/ghost` | buttons |
| `.cc-pill` + `.cc-pill-brand` | chips/badges |
| `.cc-progress-track` + `.cc-progress-fill` | progress bar |
| `.cc-icon-well` | recessed square icon container |
| `.cc-divider` | 1px groove divider |
| `.cc-skeleton` | shimmer placeholder |
| `.cc-nav-item` + `.cc-nav-item-active` | sidebar nav |
| `.cc-search`, `.cc-kbd` | sidebar search + kbd chip |
| `.cc-flyout`, `.cc-tooltip` | collapsed-rail popovers |
| `.cc-collapsible` (+ `[data-open]`) | animated expand/retract |
| `.cc-subnav`, `.cc-subnav-item`, `.cc-subnav-dot` | nested nav |
| `.cc-league-*` | league tier chips |
| `.cc-scroll` | thin themed scrollbar |
| `.cc-glow` | ambient brand glow (`::before`) |

---

*End of report. Regenerate whenever `src/index.css` tokens or `ds/` components change so this stays the source of truth.*
