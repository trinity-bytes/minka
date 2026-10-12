# Mink'a visual language

One shared look for the landing and the app: brand green `#2ecc71` as a fill, deep forest ink, a tinted background with white cards, one lavender accent, large soft radii and flat surfaces. Fraunces Black is the display voice; Inter is the UI voice.

## Quick path

1. Read colors, radii, shadows and motion only from `src/styles/tokens.css`.
2. Build pages from the shared primitives below before writing page CSS.
3. Run the checks at the end of this page before you commit.

## Tokens (`src/styles/tokens.css`)

| Group | Use |
|-------|-----|
| Brand | `--color-brand` is a fill only, never text. Text on it: `--color-on-brand`. |
| Text green | `--color-primary` (and `-dark`, `-darker`) for green text and links. |
| Ink and surfaces | `--color-ink`, `--color-ink-2`, `--color-paper` (page tint), `--color-paper-2`, `--color-card` (white). |
| Accent | `--color-lavender`, `--color-lavender-soft`, `--color-lavender-ink`; text on lavender uses `--color-on-lavender`. No green on lavender. |
| Tints and status | `--color-mint`, `--color-error*`, `--color-warning*`, `--color-info`. |
| Outlines | `--border-ink` / `--border-ink-thin` are hairlines; high contrast turns them into black outlines. |
| Shape | Radii `--radius-*` (cards 28px, bento 38px, buttons and chips are pills). |
| Elevation | Soft shadows only (`--shadow-sm` to `--shadow-modal`, `--shadow-lift`); no offset shadows. |
| Motion | `--ease-*`, `--dur-*`, `--stagger-*`; every animation respects `prefers-reduced-motion`. |

Contrast ratios are noted next to each text token. `src/scripts/tokens.ts` reads tokens at runtime for canvas and Chart.js.

## Type

| Role | Font | Where |
|------|------|-------|
| Display | Fraunces Black, SOFT 100, opsz 144 (`.display`) | Landing headlines, brand moments |
| Titles | Fraunces 700 (`--font-title-weight`) | App page titles only (`ui/PageHead`) |
| UI | Inter | Everything else |

Both fonts are self-hosted variable WOFF2 files in `public/assets/fonts/` (`src/styles/fonts.css`).

## App shell (`src/components/layout/AppLayout.astro`)

- Desktop: fixed `AppSidebar` on the left (icon rail at 769–1099px), the page in `<main>`, and an optional right rail (`shell="rail"` or a `rail` slot, from 1280px).
- Phones: slim `AppHeader` on top and `AppTabBar` at the bottom.
- Slots: default, `rail`, `before-main`, `after-main` (modals, fixed bars).

## Shared primitives

| Component | Purpose |
|-----------|---------|
| `brand/Logotype`, `brand/Logomark` | SVG wordmark and leaf mark; tones follow tokens |
| `ui/Button`, `ui/Badge`, `ui/Chip`, `ui/Toggle`, `ui/PillTabs` | Controls (pills, flat) |
| `ui/Card`, `ui/CardSection`, `ui/PageHead`, `ui/SectionHead` | Surfaces and headings |
| `ui/Avatar` | Initials avatar; tone from `src/scripts/lib/avatar.js` |
| `ui/EmptyState`, `ui/ErrorState`, `ui/Skeleton` | Shared states; markup from `src/scripts/lib/states.js`, styles in `src/styles/states.css` |
| `ui/Modal` | Dialog shell |
| `ui/Sticker`, `ui/IconChip`, `ui/BlobMedia`, `ui/WordReveal` | Landing pieces (tilted pills, icon discs, organic photo crops, word reveal) |

The `/brand` page (not linked, not in the sitemap) shows the brand primitives side by side.

## Copy and i18n

- UI copy is Spanish. English and Quechua live in `public/assets/scripts/core/translations.js`.
- Markup present at load: add `data-i18n="key"` (or `data-i18n-placeholder`) on the element that holds only the text.
- Strings built in JS: `tr(key, spanishFallback, vars)` from `src/scripts/lib/i18n.js`.

## Checks before a commit

- `npm test`, `npm run build`, `npm run check` (0 errors).
- Run `npm run dev` and open `http://localhost:4321/minka/`.
- Screenshot the changed pages at 1440, 1024 and 390px wide and compare them with the previous version.
- Repeat with reduced motion, high contrast (Settings > Alto Contraste) and forced colors; walk the page with the keyboard.
