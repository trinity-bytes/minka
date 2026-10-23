# Feature: app-design

Objective: update the Figma style guide (file `uMjLWyytKzdU4AgXuNBRZM`, page `Style Guidelines`) to the current visual language mapped to Material 3, finish what the old guide left undone, and design wireframes and mockups for the new Kotlin (Android) app.
Branch: `feat/app-design` from `develop`. Delivery: ask-on-risk; repo changes are this document only. Tests: no runner applies (Figma work); each task is checked with Figma screenshots and structural readback.

## Specs

- S1 "hay que actualizarla y aprovechar para desarrolar lo que no se hizo hasta el momento." Update the old Figma style guide and complete the missing parts.
- S2 Base visual language (user choice, 2026-10-23): "Código actual + M3" — take the language already in code (`src/styles/tokens.css`, `docs/visual-language.md`: Fraunces, Inter, brand green as fill, forest ink, lavender accent, large soft radii, flat soft shadows) and map it to Material 3 color roles and type scale so it translates directly to a Jetpack Compose theme. The old guide is archived, not deleted.
- S3 "la parte del prototipo sera ahora una app hecha en kotlin" — target platform is Android (Kotlin). Assumption: Jetpack Compose + Material 3, phone first.
- S4 "desarrollaremos los wireframes y mockups en el figma" — wireframes and mockups live in the same Figma file.
- S5 Screen scope (user choice, 2026-10-23): "Paridad con la web" — the 12 areas of the web prototype: auth, búsqueda, inicio, detalle, publicar, dashboard, comunidad, notificaciones, gamificación, perfil, ajustes, chat.
- S6 UI copy in Spanish (as in the web app); layer and component names in English.

## Tasks

| ID | Specs | Task | Route | Status |
|----|-------|------|-------|--------|
| T1 | S1, S2 | Archive old guide on its own page (`Archive – v1`), nothing deleted | inline | done: page 0:1 renamed, pages Cover 291:1297, Foundations 291:1298, Components 291:1299, Wireframes 291:1301, Mockups 291:1302 |
| T2 | S2, S3 | Variables: color primitives, M3 color roles (light + dark), spacing, radius | inline | done: Primitives 46, Color 33 (Light/Dark), Dimensions 19; WEB + ANDROID code syntax |
| T3 | S2, S3 | Text styles (M3 type scale with Fraunces + Inter) and elevation effect styles | inline | done: 15 text styles, 6 effect styles |
| T4 | S1, S2 | Style guide documentation page: color, type, shape, elevation, spacing and grid (4/8 dp), iconography, logos | inline | done: frame 293:2 on Foundations (color Light/Dark, type, shape, elevation, spacing, grid, icons, logo from paths.ts) |
| T5 | S2, S3 | Themed M3 component set: buttons, FAB, chips, cards, text fields, top app bar, navigation bar, list items, dialogs, bottom sheet, snackbar, badges, avatar, empty/error/loading states | inline | done: Library 296:2 on Components (24 components in 7 groups, bound to variables, Compose names in descriptions) |
| T6 | S4, S5 | Low-fidelity wireframes for the 12 areas (phone 412×917) | inline | done: board 301:2 on Wireframes, 15 screens (01 Bienvenida … 15 Configuración) |
| T7 | S4, S5, S6 | High-fidelity mockups for the 12 areas using T2–T5 | inline | pending: waits for the user's wireframe review |

## Log

- L1 (2026-10-23, user): "https://www.figma.com/design/uMjLWyytKzdU4AgXuNBRZM/mink-a-project?node-id=0-1 es el link de la pagina de figma donde esta la antigua guia de estilos del proyecto. hay que actualizarla y aprovechar para desarrolar lo que no se hizo hasta el momento. ademas el proyecto va a cambiar, la parte del prototipo sera ahora una app hecha en kotlin por o que desarrollaremos los wireframes y mockups en el figma"
- L2 (2026-10-23, audit): old guide has Inter/Nunito/Pacifico, green primary scale (#2ECC71 = 600), 60-30-10, accent/feedback/neutral palettes, elevation, web grids, logos, landing wireframes/mockups, and an unthemed default Material 3 Android kit. It has drifted from code (no Fraunces, no lavender).
- L3 (2026-10-23, user): base = "Código actual + M3"; scope = "Paridad con la web".
- L4 (2026-10-23, blocker): file is on the Figma Starter plan ("The Starter plan only comes with 3 pages"; variables limited to 1 mode). The T1 script rolled back; the file is unchanged. User chose "Paso a Education/Pro": they upgrade the file, then T1 resumes with separate pages (Cover, Foundations, Components, Wireframes, Mockups, Archive) and a real Light/Dark mode on the Color collection. Token map drafted for T2/T3.
- L5 (2026-10-23): user moved the file to the Education team. Removed 4 empty test pages (Page 2–5). T1–T3 done in Figma. Dark values are proposals (code has no dark theme).
- L6 (2026-10-23): T4 done and checked by screenshots. Buttons follow web variants: Filled = brand (primaryContainer), Ink = inverseSurface, Tonal = lavender (secondaryContainer), Outlined, Text.
- L7 (2026-10-23): T5 done. Added alpha state tokens (state/disabled-*) because paint opacity is dropped on variable-bound paints. Navigation decision: bottom bar Inicio, Buscar, Chat, Comunidad, Perfil; Publicar = FAB; Notificaciones in top app bar; Dashboard, Logros, Ajustes under Perfil.
- L8 (2026-10-23): T6 done: 15 grayscale wireframes covering the 12 areas (auth split into Bienvenida, Iniciar sesión, Registro; chat into lista and conversación). Next: user reviews wireframes, then T7 mockups from the Library components.
