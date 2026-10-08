# Feature: astro-migration

## Objective
Migrate the Mink'a prototype from hand-written vanilla HTML pages to Astro (static output, GitHub Pages), with one shared design-token set and one shared component library used by both the landing and the app pages.

## Problem
- Two parallel token systems: `--color-*` (assets/styles/core/base.css) and `--l-*` (assets/styles/pages/landing.css), with mismatched radii and a duplicated Fraunces @font-face.
- Three header/footer implementations (landing, about, auth) plus a JS string-injected app shell (assets/scripts/core/components.js) that flashes and fails without JS.
- ~450 duplicated `<head>` lines across 11 app pages; pages import other pages' CSS.
- "Trueque Editorial" redesign only finished on auth and busqueda; 6 page stylesheets + about are legacy.
- `.gitignore` rule `scripts/` silently ignores new files under `assets/scripts/`.
- Heavy unoptimized images (LCP 691 KB JPG, no srcset/dimensions), Fraunces as 360 KB TTF, 23.7 MB of fonts deployed.

## Why
Components remove duplication and give every page the same primitives; Astro keeps static output for GitHub Pages, reuses the existing vanilla JS as client scripts, and optimizes images via `astro:assets`.

## Scope
- In: Astro scaffold, deploy pipeline, unified tokens, shared layout/components, porting every page with behavior parity, a11y/perf fixes, 404.
- Out (deferred to a follow-up feature): new visual language (vivid organic/nature direction, saturated green) and landing layout redesign. User decision 2026-10-07: tackle after internal architecture.

## Constraints
- Static output only; GitHub Pages at `https://trinity-bytes.github.io/minka/` (base `/minka`).
- Reuse existing vanilla JS (store, session, toast, guard, i18n) with minimal changes.
- UI copy stays in Spanish (existing project language); code, comments and identifiers in English.
- Commits: Conventional Commits, no AI attribution.
- No test runner exists: test-first exception. Checks = `npm run build` (and `npx astro check` once available) + structural readback + manual run of key flows.

## Delivery
- Strategy: ask-on-risk; chain strategy chosen by user: `feature-branch-chain` (slice PRs chain onto `feat/astro-migration`, merged to main once at the end).
- Branch: `feat/astro-migration`.

## Tasks
- [x] T1 Scaffold Astro: package.json, astro.config (site/base), legacy pages moved under `public/` so everything keeps working, Pages workflow builds `dist/`, fix `.gitignore`, drop unused fonts from the deploy. Route: delegated (multi-file).
- [x] T2 Unified tokens + shared components (BaseLayout, AppHeader/Footer server-rendered, Button, Card, Sticker, PageHead, Chip, Stat, Testimonial) and port the landing to `src/pages/index.astro` with visual parity. Route: delegated.
- [x] T3 Port auth, busqueda, home. Route: delegated.
- [x] T4 Port detalle, publicar, dashboard. Route: delegated.
- [x] T5 Port comunidad, notificaciones, gamification. Route: delegated.
- [x] T6 Port perfil, settings, chat, about. Route: delegated.
- [x] T7 Polish: images via astro:assets, Fraunces WOFF2, landing a11y (pausable rotating word, menu focus/Escape, invalid ARIA), real or disabled links, global high-contrast pref, empty/loading/error states, 404. Route: delegated.

## Acceptance criteria
- `npm run build` succeeds and deploys to Pages.
- Every current page is reachable and functionally equivalent (auth/demo login, search, publish, chat, profile, settings).
- One token file, one component set; no `--l-*` tokens; no JS-injected header.

## Progress
- 2026-10-07: branch created, feature document created.
- 2026-10-07: T1 done in 66fb3ae (delegated). Checks: `npm run build` OK (parent spot check), `astro check` 0 errors, preview `/minka/` 200. Astro 7.3.7, TypeScript ^6 (peer range of @astrojs/check). Removed 70 unused static fonts (~20 MB). Known: dev server 404 on bare `/minka/` until `src/pages/index.astro` exists.
- 2026-10-07: T2 done in d529ae0 (delegated; ~4.2k new src lines, -2.7k legacy, exceeds heuristic because tokens + full component set + 1.7k-line CSS port are one coherent unit). Checks: build OK (parent spot check), `astro check` 0 errors, 43/43 landing URLs 200 on preview. Visual side-by-side confirmed identical by user (2026-10-07).
  - Carry-overs: reveal cascade wipes tilts (kept for parity, fix in visual-language feature); CTA wave clipped (parity); tokens duplicated in public/assets/styles/core until T3–T6; `.container` mobile padding to reconcile in T3; ported pages must load Font Awesome and must not load legacy components.js; about.html relative links bug for T6.
- 2026-10-07: T3 done in ad3ce30 (delegated; ~3.0k added / 1.6k removed, mostly moved CSS). Checks: build OK (parent spot check), `astro check` 0 errors, 60/60 URLs 200 on preview; login → guard → search traced in code only. User browser check of auth/busqueda/home passed (2026-10-07).
  - Added AppLayout + AuthHeader, src/styles/app.css, Font Awesome 6.7.2 via npm. Page scripts are ES modules in src/scripts/pages; core scripts remain classic in public/.
  - Fixed: search.js TDZ crash with saved district filter; Google button hover leak.
  - Carry-overs: landing `.container` padding changed slightly (unified scale); legacy home.css still linked by chat/detalle/publicar (likely droppable); filter-chip CSS duplicates Chip; "Limpiar" doesn't clear exclude/district (pre-existing).
- 2026-10-07: T4 done in cdfeddd (delegated; ~2.4k added / 2.1k removed, mostly moved markup/CSS). Checks: build OK (parent spot check), `astro check` 0 errors, 50/50 URLs 200; flows traced in code. User browser check of detalle/publicar/dashboard passed (2026-10-07).
  - Added ui/Modal, CardSection, Breadcrumb; chart.js 4.5.1 via npm; src/scripts/tokens.ts for canvas colors.
  - Fixed: paused/reserved status shown as active on detalle (EN/ES status mismatch); breadcrumb alignment.
  - Carry-overs: legacy detail.css only used by perfil, home.css only by chat (T6); Nunito only by about (drop after T6); publish form not cleared after submit; unescaped innerHTML of Store strings (pre-existing).
- 2026-10-07: T5 done in efea179 (delegated; small diff, mostly moves). Checks: build OK (parent spot check), `astro check` 0 errors, 53/53 URLs 200; flows traced in code. User browser check of comunidad/notificaciones/gamification passed (2026-10-07).
  - Fixed: undefined `--text-secondary` / `--primary-color` vars (slight visual change: secondary gray text, green points), inline hex in ranking, inline onclick for redeem, small a11y.
  - Carry-overs (pre-existing): challenge deadline off by one day (UTC date parsing); gamification tabs lack tablist ARIA; dead `updateSummary` in notifications.js; badge variant colors approximated to tokens.
- 2026-10-07: T6 done in cfc0f8a (delegated; ~1.3k added / 6.5k removed). Checks: build 14 pages OK (parent spot check), `astro check` 0 errors, 96/96 URLs 200, no legacy/CDN refs in dist. User browser check of perfil/settings/chat/about passed (2026-10-07).
  - Legacy shell retired: public/pages, all legacy CSS, components.js, main.js, Nunito removed. public/ keeps fonts, images, favicon and 8 classic core scripts (guard must run sync in head).
  - Accessibility prefs (`minka_preferences`) applied on every page pre-paint via BaseLayout inline script; HC/low-data CSS in global.css.
  - Fixed: perfil identity tabs (never styled/hidden), about links, dead footer links → plain text, perfil char counter, settings switch labels.
  - Visual changes: about now uses landing shell; modals on perfil/settings use ui/Modal with close button.
  - Carry-overs for T7: AppFooter Términos/Privacidad both → about; console.log in profile.js; inline onclick in profile/settings rendered HTML; 5 unreferenced images in public/assets/images.
- 2026-10-08: T7 done in aa1b738 (delegated; interrupted once by a rate limit and resumed; ~820 authored lines across 7 independent goals). Checks: build 15 pages OK (parent spot check), `astro check` 0 errors, 15/15 pages 200, 149/150 assets (1 crawler false positive), 0 literal colors, 0 onclick/console.log. dist 10.1M → 8.0M; LCP 690 KB JPG → AVIF 6–25 KB; Fraunces 360 KB → 195 KB WOFF2. Added @astrojs/sitemap ^3.7.4. User approved and requested the release (2026-10-08).
  - Open (pre-existing / minor): hero images duplicated in public/items and src/assets/hero; saved-search tags not keyboard reachable; 34 astro check hints from legacy globals in page JS. Empty/loading/error state design moved to the visual-language feature (it is design work, not architecture).

## Next step
Release 4.0.0 via gitflow (feature → develop → release/4.0.0 → main + tag). Then new feature: vivid organic visual language.
