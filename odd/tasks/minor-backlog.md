# Feature: minor-backlog

## Objective
Close the minor carry-overs left open by the astro-migration feature before the visual-language feature starts.

## Problem
- Store strings (user-provided titles, names, messages) are rendered through unescaped `innerHTML` (pre-existing XSS-style risk).
- Search: "Limpiar" does not clear exclude/district filters; saved-search tags are not keyboard reachable.
- Publish form is not cleared after a successful submit.
- Gamification tabs lack tablist ARIA; challenge deadline is off by one day (date-only strings parsed as UTC).
- Dead `updateSummary` in notifications.js.
- Hero images duplicated in `public/items` and `src/assets/hero`.

## Scope
- In: the items above, behavior-preserving otherwise.
- Out: empty/loading/error states and any visual redesign (visual-language feature); the 34 `astro check` hints from legacy globals.

## Constraints
- Static output, base `/minka`; UI copy stays Spanish; code/comments English.
- Conventional Commits, no AI attribution. Branch `fix/minor-backlog` from `develop` (gitflow).

## Tests
- No test runner exists. Pure helpers (HTML escaping, local date parsing) get `node:test` unit tests (no new deps, `npm test` → `node --test`), RED before GREEN. DOM behavior is checked by build, `astro check`, preview URL checks and code tracing.

## Delivery
- Strategy: ask-on-risk. Forecast ~250–400 authored lines; single PR into `develop` expected.

## Tasks
- [x] T1 Escape Store strings rendered via innerHTML (shared escape helper + unit tests). Route: delegated (multi-file).
- [x] T2 Search: "Limpiar" clears exclude/district; saved-search tags keyboard reachable (button semantics). Route: delegated.
- [x] T3 Publish form reset after submit; gamification tablist ARIA; challenge deadline local-date parsing (+ unit test); remove dead `updateSummary`. Route: delegated.
- [ ] T4 Deduplicate hero images (keep the single source actually needed, update references). Route: delegated.

## Acceptance criteria
- `npm run build`, `npm run check` (0 errors) and `npm test` pass.
- No unescaped Store string reaches `innerHTML`.
- Each task closes with a work-unit commit recorded below.

## Progress
- 2026-10-09: branch and feature document created. Route: one delegated writer for T1–T4 (2+ non-trivial files per task).
- 2026-10-09 T1: shared `escapeHtml` in `src/scripts/lib/html.js` (+ `tests/html.test.js`, `npm test` → `node --test`); applied to every Store/user-derived interpolation reaching innerHTML in search, home, detail, chat, community, profile, notifications, gamification, settings and publish page scripts. Classic core scripts already use textContent for dynamic strings (modal/toast/notif-badge), no change needed. RED observed (module missing, 1 fail) then GREEN (5/5). Checks: build OK, check 0 errors/0 warnings/34 hints, test 5/5. Commit: e5d5070.
- 2026-10-09 T2: "Limpiar" already reset exclude/district (state, persisted filters, URL and UI via DEFAULT_FILTERS + syncUI + persist, landed in aa1b738); verified by code trace, no change. Saved-search tags now render two native buttons (apply / remove) with aria-labels, visible :focus-visible outline and :focus-within pill state; pill click still applies; focus moves to the next tag (or the save button) after removal. No runnable RED (DOM behavior; no DOM test runner). Checks: build OK, check 0 errors/0 warnings/34 hints, test 5/5. Commit: 297fdde.
- 2026-10-09 T3: publish form now resets after a successful submit (fields, photo previews, uploaded images, dynamic fields, QR code, counters, errors/aria-invalid, summary) and the published draft is cleared instead of re-saved, so a reload starts clean. Shared `src/scripts/lib/date.js` (`parseLocalDate`, `toLocalDateString`) + `tests/date.test.js` (TZ pinned to America/Lima in-test); community deadlines import it (replacing the inline copy) and gamification redemption history records the local day instead of the UTC day. Already done before this task (verified, no change): gamification tablist ARIA (role tablist/tab/tabpanel, aria-selected, aria-controls, roving tabindex, Arrow/Home/End) and dead `updateSummary` removal in notifications.js (both in aa1b738). RED observed (date module missing, 1 fail) then GREEN (10/10); behavioral RED for deadlines not possible since the inline fix already existed. Checks: build OK, check 0 errors/0 warnings/34 hints, test 10/10. Carry-over: dashboard.js still derives date-only strings via `toISOString().split("T")[0]` (out of scope). Commit: see T3 commit.

## Next step
T4.
