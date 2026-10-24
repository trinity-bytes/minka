# Feature: landing-only

Objective: remove the web prototype from the repo and keep only the landing, then implement the new landing from the `Landing · Mockups` Figma board (install-the-app CTA, odd/tasks/app-design.md L40-L41).
Branch: `feat/landing-only` from `feat/app-design`. Delivery: ask-on-risk. Tests: `npm test` (node --test), `npm run build`, `npm run check`.

## Specs

- S1 "vamos a proceder on la eliminacion del prototipo del proyecto dejaremos solo la landing". Delete every page, component, script, style, asset, test and dependency that only the prototype uses (`src/pages/pages/*` and what it reaches). Keep what `src/pages/index.astro` and `src/pages/404.astro` reach. Links from kept files to deleted pages are removed or re-pointed to landing anchors, following L40 where it already says what replaces them (header drops "Ingresar"; the final CTA is the `#descargar` section). Assumption: the internal brand board (`src/pages/brand.astro`) is not the landing and goes too; the standalone logo SVGs in `src/assets/brand/` are brand assets and stay.
- S2 "solo dejamremos la lading nnueva" (app-design L42). Implement the new landing from the `Landing · Mockups` board (388:11442) with the install-the-app CTA, changes (1)-(10) and (M3) of app-design L40, badge per L41. Scope to be planned after T1.

## Tasks

| ID | Specs | Task | Route | Status |
|----|-------|------|-------|--------|
| T1 | S1 | Delete the prototype (reachability from index + 404), re-point dangling links, drop unused deps and tests, update README | inline (deletion with a computed file list; no writer reason) | done: commit on feat/landing-only (see L3) |
| T2 | S2 | Implement the new landing from the mockups | to plan | pending |

## Log

- L1 (2026-10-24, user): "vamos a proceder on la eliminacion del prototipo del proyecto dejaremos solo la landing"
- L2 (2026-10-24): Mapped with an import-reachability script from `src/pages/index.astro` and `src/pages/404.astro`: 47 `src` files kept, 113 only reached by the prototype (pages, app layout, auth/detail/home/search/publish/dashboard/exchange/notifications components, 12 unused ui components, page scripts and styles, `src/lib/{categories,eco,session}.ts`, `src/scripts/tokens.ts`, `app.css`, `states.css`). Also prototype-only: `public/assets/scripts/core`, `public/assets/images/{avatars,items}`, 11 tests of deleted libs, deps chart.js, uqr, @fortawesome/fontawesome-free. Kept on purpose: the `body.high-contrast` / `low-data` rules and the BaseLayout preferences script, because the landing components style high contrast too (follow-up: decide if the landing keeps a way to turn them on).
- L3 (2026-10-24): T1 done. Removed 111 `src` files, `public/assets/scripts/core`, `public/assets/images/{avatars,items}`, 11 tests and the deps chart.js, uqr, @fortawesome/fontawesome-free (146 paths). Re-pointed links: header drops "Ingresar" (prop and styles removed) and its CTA goes to `#descargar` (through `anchorBase`, so the 404 links back to the landing); hero CTA goes to `#descargar`; FinalCta is `id="descargar"` and its button now renders only when `ctaLabel` and `ctaHref` are passed ("Crear mi cuenta" removed, as L40 (8) says); footer "Sobre nosotros" is plain text; 404 drops "Buscar trueques". `isCurrent` in `src/lib/url.ts` (prototype nav only) removed; astro.config and README updated. Checks: `npm test` 21/21 pass, `npm run check` 0 errors, `npm ci && npm run build` 2 pages, every internal href/src and `#anchor` in dist resolves. Copy still says "Empezar ahora" / "Empieza a truequear" and the showcase still uses prototype screenshots: T2 replaces them. Follow-ups: docs/visual-language.md has 6 references to deleted files; docs/plan-de-mejora.md is the historical prototype plan and stays as is.
