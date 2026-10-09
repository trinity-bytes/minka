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
- [x] T1 Foundation tokens + type (color roles, tinted app bg, radius scale, flat shadows, display + motion tokens). VISUAL DECISION. Route: delegated.
- [x] T2 Motion base + carry-overs (reveal via `translate`, word-split support, CTA wave clip). Route: delegated.
- [x] T3 Brand primitives (Logotype, Logomark, IconChip, BlobMedia, Sticker flat, Avatar, Badge). VISUAL DECISION (logotype). Route: delegated.
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
2. ~~Logotype~~ — answered 2026-10-09: redraw it (original Pacifico PSD is lost). New wordmark in Fraunces Black (brand display), as SVG paths, MUST keep the leaf in place of the apostrophe. User approves the result visually before it replaces the PNG everywhere.
3. Threaded comments: new community feed with threads, or visual only on existing surfaces? (blocks T12)

## Progress
- 2026-10-09: references reviewed, direction approved, read-only audit done, branch + feature document created.
- 2026-10-09 (T1, on top of cf1fd3b; route delegated, writer trigger: tokens + global + call sites): shared palette for landing + app in `src/styles/tokens.css`. Brand `#2ecc71` fill only (ink on it 7.37:1; white 2.10:1, never). Ink `#10291c` (13.79:1 on bg, 15.49:1 on white), ink-2 `#3d5547` (7.22/8.11), ink-deep `#0a1d13` for dark blocks. Background `#eef3ef` (paper/bg re-pointed), alt surface `#e6eee8`, card `#ffffff` (cream retired). Text green `#1a7a43` (4.78:1 bg, 5.37:1 white, 4.62:1 mint; white on it 5.37:1). Lavender accent `#c4b2f5` (ink on it 8.14:1, on ink 8.14:1), lavender-soft `#ece6fd`, lavender-ink `#5b3fa8` (6.87/7.72, 6.36 on soft), mint `#d7f5e3` (ink 13.32:1). Accent/terra aliased to lavender roles; warning-soft decoupled (`#fcefc7`), warning-ink `#7a5c00` (5.45:1). Cool green-gray neutrals; gray-500 `#5f6f64` (4.74/5.32), gray-600 `#4a5c50` (6.37/7.15). Hard shadows flattened, `--border-ink` now a 1px hairline (HC block restores 2px black and also forces ink to black). Radii: md 16, lg 24, xl 32, card 28, bento 38, buttons/chips pill. Display tokens (Fraunces 900, SOFT 100, WONK 0, opsz 144, leading 0.9, tracking -0.025em) applied to `.display`; headings use `--font-title-weight` 700. Motion tokens defined (easings, durations, stagger), consumed from T2. Call-site fixes: gamification earned badge text white→ink on lavender; sticker `btn--sm` radius → pill; AppFooter comment. `src/scripts/tokens.ts` mirrors no hex values (unchanged). Checks: build 15 pages OK; check 0 errors / 34 hints; no `npm test` script on this branch; preview 15/15 pages 200. No RED (token values). Carry-overs: rating stars now lavender (was amber, both <3:1 on white); `.band--amber`/`.sticker--amber`/`--color-terra` names stale (T13); `--color-warning` 2.79:1 on bg is icon-only; paper sticker buttons are white on tinted bg with a hairline (T9).

- 2026-10-09 T1 review: user approved the palette in browser; only objection was green ink on lavender fills. Added `--color-on-lavender` #2a1858 (8.05:1 on lavender, 12.63:1 on lavender-soft); lavender fills (CTA band, amber sticker, demo chip tag, home publish button, search filter count, gamification earned badge) re-point ink to it locally; high contrast forces it back to black. Route: inline (mechanical, 8 one-line edits). Checks: build OK, check 0 errors.
- 2026-10-09 (T2, route delegated, writer trigger: global.css + components + new helper/test): reveal now animates the independent `translate` property through a `reveal-rise` keyframe animation (fill `backwards`, no `!important`), so Hero/Showcase `transform` tilts and the Showcase hover compose (hover `!important` dropped); an animation instead of a transition so component `transition: transform` cannot cancel the entrance. Reduced motion resets only opacity/translate/animation (tilts stay). CTA wave: `.band--amber` uses `overflow-x: clip` (vertical visible) instead of `overflow: hidden`. Word reveal: pure `src/scripts/lib/words.js` (`splitWords`, `*key*` markers or `keys` option, punctuation kept) + `src/components/ui/WordReveal.astro` (sr-only full sentence, aria-hidden word spans with `--i`, `data-reveal="words"` reuses reveal.ts) + global CSS (per-word clipped rise staggered by `--stagger-word`, key words fade from a tint via `--word-key-color`/`--word-key-tint`). Not applied to production headings yet (demo on /minka/brand/ in T3). Added `"test": "node --test"` (same line as PR #2). RED: `npm test` failed (module missing) → GREEN 8/8. Checks: build 15 pages OK; check 0 errors / 34 hints; test 8 pass; preview 15/15 pages 200.
- 2026-10-09 (T3, route delegated, writer trigger: 8 new components + page + config): logotype outlines generated once with a throwaway scratchpad tool (wawoff2 -> TTF, fontkit instance wght 900 / SOFT 100 / opsz 144 / WONK 0, which resolves to the non-wonky m.alt/n.alt; tracking -40u of 2000 upm) plus a hand-drawn two-leaf apostrophe (tall leaf with an evenodd-carved vein + small leaf leaning right, cubic Béziers) -> `src/assets/brand/paths.ts` (single source) and standalone `logotype.svg`, `logotype-title.svg`, `logomark.svg`. Components: `brand/Logotype.astro` (tone ink|brand|white, leaf auto|brand|ink|white|lavender, size, variant lower|title, aria-label "Mink'a"), `brand/Logomark.astro`, `ui/IconChip.astro` (brand/lavender/ink/mint, filled|outlined, Icon name or slot), `ui/BlobMedia.astro` (3 normalized blob masks, Picture via `src` or slot, `bleed` via relative offsets), `ui/Sticker.astro` flat (no border/shadow; tones paper/mint/brand/lavender/lavender-soft/ink, legacy green/amber/terra aliased; HC outline), `ui/Avatar.astro` (initials + deterministic tint), `ui/Badge.astro` (`.pill-badge`, avoids legacy global `.badge`; count capped "99+" with sr label). Pure helpers `src/scripts/lib/avatar.js` (initials, avatarTone FNV-1a, formatCount). Review page `src/pages/brand.astro` (noindex,nofollow; no nav link; sitemap filter excludes 404 and brand). PNG logo untouched pending approval. RED: `npm test` failed on missing avatar.js -> GREEN 15/15. Checks: build 16 pages OK; check 0 errors / 34 hints; preview 16/16 pages 200 incl. /minka/brand/; sitemap 14 URLs, no brand/404. No browser on this host (Alpine, no Chromium): visual, reduced-motion and HC browser pass pending for the parent. Decision for user: lowercase "mink'a" is the default variant (continuity with the current mark); title-case "Mink'a" shown as alternative.

## Next step
User reviews /minka/brand/ (logotype approval), then T4.
