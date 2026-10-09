# Feature: visual-language

## Objective
Evolve Mink'a into a vivid organic visual language: poster-like soft serif display, bento color blocks, organic photo crops, stickers and expressive landing motion, plus a calm 3-column app shell — keeping the light green as the brand color.

## Problem
- Current "Trueque Editorial" theme (cream paper, hard offset shadows, ink borders) does not match the target direction.
- Light green `#2ecc71` is only an accent; the brand has no SVG logotype/logomark.
- App shell is a top bar with 9 links; no rail layout, no shared empty/loading/error states.
- Carry-overs: reveal cascade wipes card tilts (global.css:188-200); CTA wave clipped (LandingSection.astro:106-110); empty/loading/error state design.

## Decisions (user, 2026-10-09)
- Light green `#2ecc71` stays the primary brand color; reference colors are not adopted. Filled green surfaces use ink text (2.1:1 on white).
- Typography: Fraunces Black, SOFT 100, tight leading for landing headlines and brand moments; Inter for app UI; serif only for app page titles. Shipped Fraunces WOFF2 already has all axes.
- Landing: motion/composition from the video reference (word reveal, chip drop, tilted ribbon, sticky stacking cards, stat rings), not its thin type.
- App: structure from the app reference (sidebar + main + rail, white rounded cards on tinted background, dark active pill, initials avatars, pill badges).

## References
Stored in Engram topic `odd/visual-language/references` (Dribbble branding board, landing video, 3 app captures).

## Scope
- In: tokens, motion base, brand primitives, landing rebuild, app shell + primitives, page adoption, empty/loading/error states, cleanup.
- Out unless decided: threaded comments data model (open question).

## Constraints
- Static output, base `/minka`; UI copy Spanish; code/comments English. Conventional Commits, no AI attribution.
- No heavy new deps (no matter-js/GSAP); native CSS + existing IntersectionObserver; scroll-driven animation gated by `@supports`; every motion respects `prefers-reduced-motion`.
- High-contrast mode must keep winning; keep escaping from e5d5070 in rebuilt renderers.

## Tests
- Visual work: no meaningful RED. Per task: `npm run build`, `npm run check` (0 errors), `npm test`, preview at `/minka/`, browser check at 1440/1024/390, reduced-motion emulation, HC toggle, keyboard pass. Pure helpers (e.g. word splitting) get `node:test` RED/GREEN.

## Delivery
- Forecast: several thousand authored lines → over budget. Strategy ask-on-risk; chain strategy defaults to `feature-branch-chain` (as in astro-migration) unless the user says otherwise. Branch `feat/visual-language` from `develop`.

## Tasks
- [ ] T1 Foundation tokens + type (color roles, tinted app bg, radius scale, flat shadows, display + motion tokens). VISUAL DECISION. Route: delegated.
- [ ] T2 Motion base + carry-overs (reveal via `translate`, word-split support, CTA wave clip). Route: delegated.
- [ ] T3 Brand primitives (Logotype, Logomark, IconChip, BlobMedia, Sticker flat, Avatar, Badge). VISUAL DECISION (logotype). Route: delegated.
- [ ] T4 Landing hero + tilted ribbon + SiteHeader. Route: delegated.
- [ ] T5 Landing bento + chip drop. VISUAL DECISION (block colors). Route: delegated.
- [ ] T6 Sticky stacking cards + stat rings. Route: delegated.
- [ ] T7 Landing remainder (video, testimonials, final CTA, footer, watermark, about, 404). Route: delegated.
- [ ] T8 App shell 3 columns (AppLayout shell prop, AppSidebar, rail slot, slim header). VISUAL DECISION (mobile nav). Route: delegated.
- [ ] T9 App primitives restyle (buttons, badges, forms, modal, toast, toggle, PillTabs). Route: delegated.
- [ ] T10a Adopt: home, comunidad, notificaciones. Route: delegated.
- [ ] T10b Adopt: perfil, gamification, dashboard, busqueda, detalle, settings, chat, publicar, auth. Route: delegated.
- [ ] T11 Empty/loading/error states (Skeleton, EmptyState, ErrorState). Route: delegated.
- [ ] T12 (conditional) Threaded comments — pending decision.
- [ ] T13 Cleanup (drop Pacifico, hard-shadow tokens, docs). Route: delegated.

## Open questions
1. ~~Secondary colors / landing paper~~ — answered 2026-10-09: only the green `#2ecc71` is fixed; every other color (ink, accents, backgrounds, amber/terra, cream paper) may be redefined, for both landing and app. Parent direction for T1: one shared palette for landing + app — green brand, deep forest ink, tinted light background + white cards, one adapted accent (lavender candidate, as in both refs), mint tint; cream paper retired.
2. Logotype: redraw as Fraunces Black SVG wordmark with leaf apostrophe, or vectorize the current script mark? (blocks T3)
3. Threaded comments: new community feed with threads, or visual only on existing surfaces? (blocks T12)

## Progress
- 2026-10-09: references reviewed, direction approved, read-only audit done, branch + feature document created.

## Next step
Answer open question 1, then T1.
