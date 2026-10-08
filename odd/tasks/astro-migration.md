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
- [ ] T1 Scaffold Astro: package.json, astro.config (site/base), legacy pages moved under `public/` so everything keeps working, Pages workflow builds `dist/`, fix `.gitignore`, drop unused fonts from the deploy. Route: delegated (multi-file).
- [ ] T2 Unified tokens + shared components (BaseLayout, AppHeader/Footer server-rendered, Button, Card, Sticker, PageHead, Chip, Stat, Testimonial) and port the landing to `src/pages/index.astro` with visual parity. Route: delegated.
- [ ] T3 Port auth, busqueda, home. Route: delegated.
- [ ] T4 Port detalle, publicar, dashboard. Route: delegated.
- [ ] T5 Port comunidad, notificaciones, gamification. Route: delegated.
- [ ] T6 Port perfil, settings, chat, about. Route: delegated.
- [ ] T7 Polish: images via astro:assets, Fraunces WOFF2, landing a11y (pausable rotating word, menu focus/Escape, invalid ARIA), real or disabled links, global high-contrast pref, empty/loading/error states, 404. Route: delegated.

## Acceptance criteria
- `npm run build` succeeds and deploys to Pages.
- Every current page is reachable and functionally equivalent (auth/demo login, search, publish, chat, profile, settings).
- One token file, one component set; no `--l-*` tokens; no JS-injected header.

## Progress
- 2026-10-07: branch created, feature document created.

## Next step
T1.
