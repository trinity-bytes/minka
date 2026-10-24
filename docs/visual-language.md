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
| Outlines | `--border-ink` / `--border-ink-thin` are hairlines. |
| Shape | Radii `--radius-*` (cards 28px, bento 38px, buttons and chips are pills). |
| Elevation | Soft shadows only (`--shadow-sm` to `--shadow-modal`, `--shadow-lift`); no offset shadows. |
| Motion | `--ease-*`, `--dur-*`, `--stagger-*`; every animation respects `prefers-reduced-motion`. |

Contrast ratios are noted next to each text token.

## Type

| Role | Font | Where |
|------|------|-------|
| Display | Fraunces Black, SOFT 100, opsz 144 (`.display`) | Landing headlines, brand moments |
| Titles | Fraunces 700 (`--font-title-weight`) | Footer column titles |
| UI | Inter | Everything else |

Both fonts are self-hosted variable WOFF2 files in `public/assets/fonts/` (`src/styles/fonts.css`).

## Shared primitives

| Component | Purpose |
|-----------|---------|
| `brand/Logotype`, `brand/Logomark` | SVG wordmark and leaf mark; tones follow tokens |
| `ui/Button` | Pills: paper, primary, ink, outline |
| `ui/SectionHead` | Section heading with sticker eyebrow |
| `ui/StoreBadge` | "Disponible en Google Play" pill (dark/light) with the official icon; link target in `src/lib/store.ts` |
| `ui/Avatar` | Initials avatar; tone from `src/scripts/lib/avatar.js` |
| `ui/Sticker`, `ui/IconChip`, `ui/BlobMedia`, `ui/WordReveal` | Landing pieces (tilted pills, icon discs, organic photo crops, word reveal) |
| `landing/PhoneFrame` | Android phone mockup around a 9:20 app screen exported from Figma |

## Copy

- UI copy is Spanish.
- Every install link points to the Google Play listing in `src/lib/store.ts`; while it is unset (the app is not published yet) they go to the `#descargar` section and no install QR is shown.

## Checks before a commit

- `npm test`, `npm run build`, `npm run check` (0 errors).
- Run `npm run dev` and open `http://localhost:4321/minka/`.
- Screenshot the changed pages at 1440, 1024 and 390px wide and compare them with the previous version.
- Repeat with reduced motion and forced colors; walk the page with the keyboard.
