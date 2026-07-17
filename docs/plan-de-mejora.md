# Plan de Mejora del Prototipo Mink'a
### HTML/CSS/JS Vanilla · Chunks para modelos menores · Checkpoints para revisión

## Resumen ejecutivo

Se estabiliza y completa el prototipo de Mink'a en **6 fases priorizadas** (0 a 5), manteniendo HTML/CSS/JS puro sin frameworks ni build step. La Fase 0 reorganiza carpetas y lleva el `index` a la raíz con el workflow de GitHub Pages apuntando a `.`. La Fase 1 apaga bugs críticos y reconstruye la arquitectura de sesión. La Fase 2 cierra la funcionalidad de punta a punta (persistencia + handoff entre páginas + notificaciones reales). La Fase 3 unifica el sistema de diseño. La Fase 4 aplica pulido de UI, accesibilidad y rendimiento. La Fase 5 completa i18n es/en/qu.

Cada chunk es atómico y ejecutable por un modelo menor con instrucciones mecánicas explícitas. Entre fases, un **checkpoint (CN)** requiere revisión por un modelo superior antes de avanzar.

**Stack:** HTML5 semántico + CSS3 (variables, grid/flex) + JS ES6+ vanilla. Backend mock = `localStorage`. Despliegue: GitHub Pages (archivos estáticos, sin build).

---

## Convenciones de ejecución

- **Chunk**: unidad atómica ejecutable por un modelo menor. Cada chunk lista archivos a tocar, pasos mecánicos explícitos y criterios de aceptación verificables.
- **Checkpoint (CN)**: revisión por modelo superior antes de pasar a la fase siguiente. Define qué verificar, comandos de verificación y criterio de aprobación/rechazo.
- **Flujo**: Chunk → Chunk → … → Checkpoint (modelo superior revisa) → si aprueba, siguiente fase; si rechaza, devuelve al chunk indicado con el motivo.
- **Ramas**: una rama por fase (`phase/0-reorg`, `phase/1-bugs`, …). Un PR por fase.
- **Reglas de oro para modelos menores**:
  1. No añadir dependencias. Sin `package.json`, sin npm, sin CDNs nuevos.
  2. No tocar archivos fuera del chunk.
  3. Mantener HTML/CSS/JS puro (sin frameworks, sin build step).
  4. Si un paso falla o se ambigua, **DETENER y reportar** — no inventar.
  5. Conservar convenciones existentes (commits `feat:`/`fix:`/`refactor:`, nombres kebab-case, IIFE para scripts core).

---

## Principios transversales

| Principio | Aplicación |
|---|---|
| Sin frameworks | Solo APIs del navegador y ES6+ modules/scripts. |
| Sin build step | Archivos servidos tal cual; optimización por `preconnect`/`preload`, critical CSS inlineado manualmente en `index.html`. |
| Fuente única de verdad | Tokens y componentes definidos una sola vez en `base.css`/`components.css`; páginas solo extienden. |
| Persistencia coherente | Un módulo `core/store.js` centraliza todo acceso a `localStorage` con try/catch y nombres de clave validados. |
| Progresivo | Nav y footer servidos en HTML; JS solo mejora (no depende para navegación básica). |
| Raíz = webroot | El root del repo es el deployment root; `pages/` contiene las 13 páginas de la app. |

---

## Estructura objetivo (después de Fase 0)

```
/                       ← webroot (root IS the deployment)
├─ index.html           ← landing (movida de public/)
├─ favicon.ico
├─ pages/               ← las 13 páginas de la app
│  ├─ auth.html  busqueda.html  publicar.html  detalle.html  chat.html
│  ├─ home.html  dashboard.html  gamification.html  perfil.html
│  └─ notificaciones.html  comunidad.html  about.html  settings.html
├─ assets/
│  ├─ styles/
│  │  ├─ core/          ← base.css  components.css  layout.css  responsive.css
│  │  └─ pages/         ← auth.css  chat.css  …  settings.css  timeline.css
│  ├─ scripts/
│  │  ├─ core/          ← session.js  store.js  modal.js  toast.js  constants.js
│  │  │                   i18n.js  translations.js  main.js  components.js  notif-badge.js
│  │  └─ pages/         ← auth.js  chat.js  detail.js  …  settings.js
│  ├─ images/  (items/, logos)
│  └─ fonts/   (Inter, Nunito, Pacifico)
└─ .github/workflows/pages.yml  ← path: .
```

---

## Fase 0 — Reorganización de carpetas y despliegue

> **Objetivo**: mover todo `public/*` a la raíz, agrupar las 13 páginas en `pages/`, dividir `styles/` en `core/`+`pages/`, y actualizar el workflow a `path: .`. Sin cambios de funcionalidad.

### Chunk 0.1 — Mover archivos a la nueva estructura (git mv)

**Archivos**: todo bajo `public/`.

**Pasos** (ejecutar literalmente con `git mv`):
1. `git mv public/index.html index.html`
2. `git mv public/favicon.ico favicon.ico`
3. `New-Item -ItemType Directory -Path pages` (crear dir).
4. Para cada una de: `auth, busqueda, publicar, detalle, chat, home, dashboard, gamification, perfil, notificaciones, comunidad, about, settings`: `git mv public/<pag>.html pages/<pag>.html`.
5. `git mv public/assets ./assets`.
6. Dentro de `assets/styles/`: crear `core/` y mover `base.css, components.css, layout.css, responsive.css` a `core/`. Ya existe `pages/` con los CSS de página (dejar igual).
7. Dentro de `assets/scripts/`: ya existe `core/` y `pages/`; dejar igual.
8. `if (Test-Path public) { Remove-Item public -Recurse -Force }` (solo si quedó vacío).

**Criterios**:
- [ ] `Test-Path public` retorna False.
- [ ] `Test-Path index.html` retorna True.
- [ ] `Get-ChildItem pages -Filter *.html | Measure` retorna 13.
- [ ] `Get-ChildItem assets/styles/core -Filter *.css | Measure` retorna 4.
- [ ] `git status` muestra solo renombrados (R), sin adds/deletes extraños.

### Chunk 0.2 — Actualizar rutas en index.html (raíz)

**Archivo**: `index.html`.

**Pasos**: reemplazar todas las ocurrencias exactas:
- `href="./assets/styles/base.css"` → `href="./assets/styles/core/base.css"`.
- `href="./assets/styles/components.css"` → `href="./assets/styles/core/components.css"`.
- `href="./assets/styles/layout.css"` → `href="./assets/styles/core/layout.css"`.
- `href="./assets/styles/responsive.css"` → `href="./assets/styles/core/responsive.css"`.
- `src="./assets/scripts/core/main.js"` → sin cambio (mismo path relativo).
- `href="auth.html"` → `href="pages/auth.html"` (CTA hero, header CTA, cta-final).
- `href="about.html"` → `href="pages/about.html"` (footer).
- `src="./assets/images/..."` y `href="./favicon.ico"` → sin cambio (relativo correcto).

**Criterios**:
- [ ] Abrir `index.html` localmente: logo, CSS, JS cargan (DevTools Network 200, no 404).
- [ ] Click "Empezar Ahora" lleva a `pages/auth.html`.

### Chunk 0.3 — Actualizar los 13 HTML en pages/

**Archivos**: los 13 `pages/*.html`.

**Pasos por cada archivo**:
1. CSS core: `./assets/styles/base.css` → `./assets/styles/core/base.css` (igual para components/layout/responsive).
2. CSS de página: `./assets/styles/pages/<page>.css` → sin cambio (relativo válido desde `pages/`).
3. Scripts core: `./assets/scripts/core/*.js` → sin cambio (relativo válido).
4. Scripts de página: `./assets/scripts/pages/*.js` → sin cambio (relativo válido).
5. Imágenes: `./assets/images/...` → `../assets/images/...` (hay que subir un nivel, ahora las páginas están en `pages/`). **Excepto** el que ya se resuelve desde el mismo dir — revisar cada caso.
6. Logo en `pages/auth.html` (estático): `src="./assets/images/minka-logo.png"` → `src="../assets/images/minka-logo.png"`.
7. Logo en footer de `pages/home.html`: `src="./assets/images/minka-logo-negativo-blanco.png"` → `src="../assets/images/minka-logo-negativo-blanco.png"`.
8. **Links entre páginas**: `href="home.html"` → sin cambio (mismo dir `pages/`). `href="auth.html"` → sin cambio. `href="index.html"` → `href="../index.html"` (volver a landing).

**Criterios**:
- [ ] `rg "assets/styles/(base|components|layout|responsive)\.css" pages/` retorna 0 (todas pasaron a `core/`).
- [ ] Abrir `pages/home.html` localmente: CSS y JS cargan, logo del header visible.

### Chunk 0.4 — Actualizar rutas internas en JS

**Archivos**: `assets/scripts/core/components.js`, `assets/scripts/core/main.js`, y todos los `assets/scripts/pages/*.js` que referencien `./assets/...` o rutas a páginas.

**Pasos**:
1. `components.js:133` `src="./assets/images/minka-logo.png"` → `src="../assets/images/minka-logo.png"` (el header se inyecta en el contexto de `pages/X.html`; la URL relativa se resuelve desde el HTML).
2. En `assets/scripts/core/main.js`: revisar línea por línea cualquier `./assets/...` — la landing ahora está en raíz, así que `./assets/...` sigue siendo correcto desde el contexto de `index.html`. No tocar a menos que se ejecute desde `pages/`.
3. En `assets/scripts/pages/detail.js` (mocks): las imágenes mock que apuntan a unsplash **SE MANTIENEN** (Fase 4 las sustituye). Las que apuntan a `./assets/images/items/...` → `../assets/images/items/...`.
4. En `assets/scripts/pages/home.js`, `search.js`, `publish.js`, `profile.js`: revisar `rg "\./assets/" assets/scripts/pages/` y pasar cada match a `../assets/` si se ejecuta en contexto `pages/`.
5. En `assets/scripts/pages/`: si algún JS construye `href` a páginas (cards, "ver similar"), las rutas entre páginas son `busqueda.html` (sin `pages/` porque están en el mismo dir) — no tocar. Los `href` a `index.html` deben ser `../index.html`.

**Criterios**:
- [ ] `rg "\./assets/images" assets/scripts/core/components.js` muestre `../assets/images/minka-logo.png`.
- [ ] Abrir `pages/home.html`: logo del header renderiza (no broken image).
- [ ] `rg "\./assets/images" assets/scripts/pages/` retorna solo rutas `../assets/...`.

### Chunk 0.5 — Actualizar workflow de GitHub Pages

**Archivo**: `.github/workflows/pages.yml`.

**Pasos**:
1. Cambiar línea 33: `path: public` → `path: .`.
2. Confirmar que `.gitignore` excluye `.atl/`, `.codegraph/`, `drafts/`, `.github/` no es necesario excluirlo (upload-pages-artifact respeta `.gitignore`).

**Criterios**:
- [ ] `rg "path: \." .github/workflows/pages.yml` retorna 1 match.
- [ ] Push a rama `phase/0-reorg` dispara el workflow y el deploy URL sirve `index.html` en raíz.

### Checkpoint C0 — Revisión por modelo superior

**Revisa**: Chunks 0.1–0.5.

**Verificar**:
1. `Get-ChildItem` del árbol coincide con la "Estructura objetivo".
2. `rg "public/" .` retorna 0 (sin referencias a `public/`).
3. `rg "assets/styles/(base|components|layout|responsive)\.css" --type html` retorna 0 (todas con `core/`).
4. `rg "href=\"\.\./index\.html\"" pages/` retorna los esperados (~3, los que vuelven a landing).
5. Abrir `pages/home.html` y `pages/auth.html` localmente: sin 404 en Network, logo y CSS correctos.
6. Push a `phase/0-reorg`: GitHub Actions deploy verde; la URL pública muestra la landing.
7. Smoke test manual de clicks: landing → Empezar Ahora → auth → (login demo) → home → nav → busqueda → card → detalle → Contactar (link existe, aunque no wired aún).

**Criterio de aprobación**: los 7 items pasan. Si alguno falla, modelo superior devuelve al chunk correspondiente con el motivo exacto (carpeta/archivo/línea).

---

## Fase 1 — Bugs críticos y arquitectura de sesión

> **Objetivo**: apagar defectos que rompen flujos completos. Crear `core/session.js`. Todas las rutas ahora son POST-Fase-0.

### Chunk 1.1 — Crear `assets/scripts/core/session.js`

**Archivo nuevo**: `assets/scripts/core/session.js`.

**Especificación exacta**:
```js
(function () {
  "use strict";
  const KEY = "minka_session";
  const inactivityLimit = 15 * 60 * 1000; // 15 min
  let timer = null;

  function setSession(user, { remember = false } = {}) {
    const data = { ...user, ts: Date.now(), remember };
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(data));
  }
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || "null");
    } catch { return null; }
  }
  function clearSession() {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    localStorage.removeItem("minka-demo-session"); // legacy cleanup
  }
  function isAuthenticated() { return !!getSession(); }
  function requireAuth(redirect) {
    if (!isAuthenticated()) {
      const r = redirect || location.pathname.split("/").pop();
      location.href = "auth.html?redirect=" + encodeURIComponent(r);
    }
  }
  function armInactivity(onTimeout) {
    if (!isAuthenticated()) return;
    const reset = () => { clearTimeout(timer); timer = setTimeout(onTimeout, inactivityLimit); };
    ["mousemove","keydown","click","scroll"].forEach(e => document.addEventListener(e, reset));
    reset();
  }
  window.Session = { setSession, getSession, clearSession, isAuthenticated, requireAuth, armInactivity };
})();
```

**Criterios**:
- [ ] Archivo existe y carga sin error al abrir la consola de `pages/home.html`.
- [ ] `Session.isAuthenticated()` retorna false tras `Session.clearSession()`.

### Chunk 1.2 — Migrar auth.js y profile/home a usar Session

**Archivos**: `assets/scripts/pages/auth.js`, `assets/scripts/pages/home.js`, `assets/scripts/pages/profile.js`, y los 11 HTML de páginas protegidas.

**Pasos**:
1. En `auth.js:11`: reemplazar la escritura `localStorage.setItem("minka-demo-session", ...)` por `Session.setSession(mockUser, { remember: form.querySelector('[name=remember]')?.checked })`. Usar `local`/`session` según `remember`.
2. En `home.js:2,53`: cambiar `localStorage.getItem("minka-demo-session")` → `Session.getSession()`.
3. En `profile.js:4,16,492-504`: ya no sobreescribe la sesión; usar `Session.setSession({...Session.getSession(), ...profileUpdates})` para preservar campos (`password`, `provider`, etc.).
4. En `pages/auth.html`: añadir `<script defer src="../assets/scripts/core/session.js"></script>` **ANTES** de `auth.js`.
5. En los 11 HTML de páginas protegidas (home, busqueda, publicar, detalle, chat, dashboard, gamification, perfil, notificaciones, comunidad, settings): añadir el mismo `<script defer src="../assets/scripts/core/session.js"></script>` ANTES del primer script de página.

**Criterios**:
- [ ] Login demo persiste con `remember` marcado → `localStorage` tiene `minka_session`; sin marcar → `sessionStorage`.
- [ ] `rg "minka-demo-session" .` retorna 0 (excepto el cleanup en session.js).
- [ ] Recargar home mantiene nombre del usuario.

### Chunk 1.3 — Logout funcional y guards de sesión

**Archivos**: `assets/scripts/core/components.js`, `assets/scripts/pages/profile.js`, `pages/perfil.html`.

**Pasos**:
1. En `NAV_LINKS` (components.js:62), al item "Salir" añadir `data-action: "logout"`.
2. En `renderAppHeader`, después de pintar el nav, añadir delegación:
```js
nav.addEventListener("click", function(e){
  var a = e.target.closest("[data-action=logout]");
  if (!a) return;
  e.preventDefault();
  if (window.Session) Session.clearSession();
  location.href = "auth.html";
});
```
3. En cada página protegida, al inicio del script de página (o en un nuevo `core/guard.js` cargado tras `session.js`), llamar `Session.requireAuth()`.
4. Eliminar el código muerto `logoutBtn` en `profile.js:57` y `pages/perfil.html` (no existe `id="logout-btn"`).

**Criterios**:
- [ ] Click "Salir" limpia `minka_session` y redirige a `pages/auth.html`.
- [ ] Abrir `pages/home.html` en ventana privada (sin sesión) → redirige a `pages/auth.html?redirect=home.html`.

### Chunk 1.4 — Activar timeout de inactividad

**Archivos**: `assets/scripts/core/main.js` + scripts de página.

**Pasos**:
1. En cada página protegida, tras `Session.requireAuth()`, llamar:
```js
Session.armInactivity(function(){
  Session.clearSession();
  location.href = "auth.html?reason=inactivity";
});
```
2. Eliminar el bloque inactivity muerto en `core/main.js:70-91` (si `main.js` lo tenía) y la lógica comentada en `main.js:62-67`.
3. Eliminar `"branding.txt"` de `publicPages` en `main.js:49` (ajustar paths públicos, la landing ahora es `index.html`).

**Criterios**:
- [ ] Tras 15 min sin input, redirect a `auth.html?reason=inactivity`. (Test manual: reducir el `inactivityLimit` a 10s temporalmente, verificar, restaurar.)
- [ ] `console.log` en `main.js` tras cargar index no aparece (limpio).

### Chunk 1.5 — Reparar publish.js (4 bugs)

**Archivo**: `assets/scripts/pages/publish.js`.

**Pasos**:
1. **Bug hydrateDraft** (`publish.js:500-508`): eliminar las referencias a `qrText, qrStatus, qrImage, qrCanvas, drawPseudoQr, downloadBtn` (comentar o condicionar con `if (typeof qrText !== "undefined")`). Si se quiere mantener QR: declarar todas arriba (ver Chunk 1.6 para detail.js como referencia).
2. **Bug languageChanged** (`publish.js:146` **y también `profile.js:539`**): cambiar `window.addEventListener("languageChanged", …)` → `document.addEventListener("languageChanged", …)` en AMBOS archivos. El evento se despacha en `document` (`i18n.js:96`). Los demás listeners (home.js, notifications.js, search.js) ya usan `document` — no tocar.
3. **Pérdida mode/notes**: en `publishItem` (`publish.js:286-314`), añadir al objeto guardado:
   - `mode: Array.from(document.querySelectorAll('input[name=mode]:checked')).map(function(c){return c.value;}),`
   - `notes: document.getElementById('item-notes').value`
4. **Validación campos dinámicos**: en `renderDynamicFields` (`publish.js:241`), para cada campo `required`, setear `input.required = true` en el input correspondiente. La validación existente (`publish.js:199-211`) ya lo respeta.
5. **Sustituir alert de fotos** (`publish.js:179-197`): añadir `<p class="form__error" id="photo-error" role="status" aria-live="polite"></p>` en `pages/publicar.html` si falta y escribir el mensaje ahí en lugar de `alert()`.

**Criterios**:
- [ ] Guardar un borrador con cualquier estado, recargar, no lanza excepción en consola.
- [ ] Publicar un item con "Envío coordinado" + notas → el item en `minka_published_items` incluye `mode` y `notes`.
- [ ] Cambiar idioma en settings con un draft abierto actualiza los labels dinámicos (listener dispara).

### Chunk 1.6 — Reparar detail.js (persistencia + QR)

**Archivo**: `assets/scripts/pages/detail.js`.

**Pasos**:
1. **Persistir edit** (`detail.js:251-264`): al guardar el título editado, actualizar el item en `minka_published_items`:
   - Leer array `JSON.parse(localStorage.getItem("minka_published_items")||"[]")`.
   - Reemplazar el item con `id` matching.
   - `localStorage.setItem("minka_published_items", JSON.stringify(array))`.
   (En Fase 2 se migrará a `Store.updateItem()`; provisionalmente directo.)
2. **Persistir delete** (`detail.js:298-306`): filtrar el array y escribir.
3. **Persistir pause/reserve/activate** (`detail.js:428-454`): actualizar el campo `status` del item en el array.
4. **Bug QR overwrite** (`detail.js:421`): `bindActions()` solo llama `generateQr()` si `!item.qrCode`. Si existe, mostrar el guardado y no sobreescribir `currentCode`.
5. **Bug canvas en blanco**: `drawPseudoQr(seedStr)` **ya está implementada** en `detail.js:478` — NO reimplementar. Las llamadas están comentadas en `detail.js:163` y `detail.js:472` (`// drawPseudoQr(currentCode); // Removed dynamic generation`) con fallback estático `qrImage.src = "./assets/images/QR-generico.svg"` (detail.js:164). Descomentar ambas llamadas, verificar que `qrCtx` no sea null antes de dibujar, y mantener el SVG genérico solo como fallback si canvas falla. `qrDownload`/`qrShare` ya usan `qrCanvas.toDataURL("image/png")` (detail.js:321,328).

**Criterios**:
- [ ] Editar título en detalle → recargar → el título persiste.
- [ ] Pausar item → recargar → el badge "Pausado" sigue.
- [ ] Descargar QR produce un PNG no vacío.

### Chunk 1.7 — Reparar search.js (bug count + URL params + geolocalización)

**Archivo**: `assets/scripts/pages/search.js`, `assets/scripts/core/translations.js`.

**Pasos**:
1. **Bug count** (`search.js:277-279`): añadir claves a `translations.js` (es/en/qu) en el bloque correspondiente:
   - `search_results_count`: "resultados" / "results" / "resultados"
   - `search_placeholder`: "Buscar por título, tags o distrito" / "Search by title, tags or district" / "Qhatipay título, tags utaq distrito"
2. **URL params** (al inicio de `search.js`): leer `new URLSearchParams(location.search)`. Si `q`, setear `el.query.value` y ejecutar `filterResults()`. Si `category`, setear `el.category.value`.
3. **Geolocation** (`search.js:147-152`): el handler `success` debe aceptar `pos` y llamar a un reverse-geocode mock. Implementar `mockReverseGeocode(lat,lng)` que retorna un distrito de Lima según rangos de lat/lng.
4. **Distancia absurda** (`search.js:284-291`): reemplazar `Math.abs(item.distanceKm - (userLocation.length % 3 + 1))` por la resta real `Math.abs(item.distanceKm - userDistanciaKm)` donde `userDistanciaKm` proviene del input del usuario (distrito → km en un map mock) o un mock determinista.
5. **Sustituir alert "Búsqueda guardada"** (`search.js:383`): provisionalmente, setar clase `.is-success` en un span junto al botón. La versión toast se hace en Fase 3.

**Criterios**:
- [ ] Buscar "bicicleta" → contador dice "3 resultados" (no "3 search_results_count").
- [ ] Desde home, buscar "libros" en el form y Enter → `pages/busqueda.html?q=libros` muestra resultados filtrados.
- [ ] Geolocation (aceptar permiso) rellena el input con un distrito real de Lima.

### Chunk 1.8 — Handoff Detalle→Chat y Detalle→Perfil

**Archivos**: `pages/detalle.html`, `assets/scripts/pages/detail.js`, `assets/scripts/pages/chat.js`, `assets/scripts/pages/profile.js`.

**Pasos**:
1. En `pages/detalle.html:166` "Contactar": cambiar `<a href="chat.html">` por `<a id="btn-contact">` y en `detail.js` setear `href = "chat.html?thread=" + item.id + "&owner=" + (item.owner?.id || "")`.
2. En `pages/detalle.html:83` "Ver perfil": cambiar `<a href="perfil.html">` por `perfil.html?user=<ownerId>`.
3. En `chat.js` (al init): leer `URLSearchParams(location.search)`; si `thread`, buscar ese hilo y `currentThreadId = thread`; si no existe y hay `owner`, crear un hilo nuevo con seed message. Llamar `persistThread()`.
4. En `profile.js` (al init): leer `?user=`; si existe y no es el propio, renderizar modo solo-lectura (ocultar botones de edición); si no, modo editable.

**Criterios**:
- [ ] Click "Contactar" en detalle → chat abre el hilo correcto (o lo crea).
- [ ] Click "Ver perfil del vendedor" → perfil en modo lectura si no es el propio.

### Chunk 1.9 — Persistir mensajes de chat

**Archivo**: `assets/scripts/pages/chat.js`.

**Pasos**:
1. Cambiar persistencia: además de `minka-chat-thread` (id de hilo), añadir `minka_chat_messages` = `{ [threadId]: [messages] }`. Al enviar un mensaje, pushear al array del hilo y persistir.
2. En `renderConversation()`, leer los mensajes persistidos primero, mergear con los del mock.
3. Tras el typing indicator (`chat.js:397-415`), insertar un mensaje mock programado del "other" side: `setTimeout(function(){ thread.messages.push({from:'them', text:'...',
   time: now, status:'read'}); renderConversation(); }, 4000)`.
4. Reemplazar el hack `data-id="$${t.id}"` + `replace("$","")` por `data-id="${t.id}"` sin prefijo.

**Criterios**:
- [ ] Enviar un mensaje, recargar → el mensaje sigue visible.
- [ ] Tras 4s aparece una respuesta del otro lado.

### Chunk 1.10 — Unificar vocabulario de categorías

**Archivo nuevo**: `assets/scripts/core/constants.js`.

**Pasos**:
1. Definir y exponer en `window.MINKA_CONSTANTS`:
```js
const CATEGORIES = [
  "Ropa y accesorios", "Libros", "Electrónica", "Hogar",
  "Muebles", "Servicios", "Otros"
];
const ECO_FACTORS = {
  "Ropa y accesorios": { co2: 5,  water: 2000 },
  "Libros":             { co2: 1,  water: 10   },
  "Electrónica":        { co2: 20, water: 500  },
  "Hogar":              { co2: 8,  water: 100  },
  "Muebles":            { co2: 15, water: 0    },
  "Servicios":          { co2: 2,  water: 0    },
  "Otros":              { co2: 2,  water: 20   },
};
window.MINKA_CONSTANTS = { CATEGORIES: CATEGORIES, ECO_FACTORS: ECO_FACTORS };
```
2. En `detail.js:71-78`: borrar `ECO_FACTORS` local; usar `window.MINKA_CONSTANTS.ECO_FACTORS`.
3. Cargar `constants.js` (via `<script defer>`) en `pages/detalle.html` antes de `detail.js`.
4. Verificar que `pages/publicar.html` y `pages/busqueda.html` usan estas categorías en sus `<option>` (ya lo hacen).
5. En mocks de `home.js`/`search.js`, alinear nombres de categoría si alguno difiere.

**Criterios**:
- [ ] Una publicación "Ropa y accesorios" muestra ECO_FACTORS correctos (co2=5, water=2000) en detalle, no "Otros".

### Chunk 1.11 — Limpieza de claves huérfanas

**Pasos**:
1. `auth.js:252,534` escribe `minka_legal_consent`. **Decisión**: eliminar la escritura y el campo muerto (nadie lo lee).
2. Eliminar `minka_session` fantasma de `main.js:58,77-79` (reemplazado por `session.js` en Fase 1).
3. Las 2 claves de search (ver Chunk 1.7) ya añadidas en `translations.js`.

**Criterios**:
- [ ] `rg "minka_legal_consent" .` retorna 0.
- [ ] `rg "minka_session[^-]" assets/scripts/ ` no aparece en `getItem`/`setItem` que no sea `session.js`.

### Checkpoint C1 — Revisión por modelo superior

**Revisa**: Chunks 1.1–1.11.

**Verificar** (cada uno debe pasar — smoke tests manuales):
1. Login demo → redirect a `home.html`, sesión en `localStorage.minka_session`.
2. Botón "Salir" → sesión borrada, redirect a auth.
3. Ventana privada, abrir `pages/home.html` directo → redirect a `auth.html?redirect=home.html`.
4. Publicar item completo (con `mode` + `notes`) → recargar `pages/detalle.html?id=<nuevo>` → datos presentes.
5. Editar título en detalle → recargar → persiste.
6. Descargar QR → PNG no vacío.
7. Buscar desde home → busqueda con `?q=` filtra; contador dice "N resultados".
8. Geolocation → rellena distrito.
9. Contactar item → chat abre hilo correcto; mensaje y respuesta aparecen; recargar los conserva.
10. Categoría "Ropa y accesorios" muestra eco-métricas correctas.
11. Sin warnings de i18n en consola al cargar auth/busqueda.
12. `rg "minka-demo-session|minka_legal_consent|minka_session[^-]" --type js` sin matches fuera de `session.js`.

**Criterio**: 12/12 pasan. Fallos se delegan al chunk específico con evidencia (comando, URL, captura de consola).

---

## Fase 2 — Funcionalidad completa y persistencia

> **Objetivo**: cerrar flujos end-to-end y que todo sobreviva recarga con datos que fluyen entre páginas.

### Chunk 2.1 — Crear `assets/scripts/core/store.js`

**Archivo nuevo**. API expuesta en `window.Store`:

```js
// Items
getItems(), getItem(id), saveItem(item), updateItem(id, patch), deleteItem(id)
// Favorites
getFavorites(), toggleFavorite(id), isFavorite(id)
// Searches
getSavedSearches(), saveSearch(search), deleteSavedSearch(id),
getSearchHistory(), addHistory(term)
// Chat
getChatThread(), saveChatThread(id), getMessages(threadId), saveMessages(threadId, msgs)
// Notifications
getNotifications(), saveNotifications(list), addNotification({type, payload})
// Gamification
getGame(), saveGame(state)
// Community
getCommunity(), saveCommunity(state)
// Profile
getProfile(), saveProfile(p)
// Preferences
getPreferences(), savePreferences(p)
// Dashboard
getDashboard(), saveDashboard(data)
```

**Reglas**:
- Todos los métodos hacen `try/catch` sobre `JSON.parse` y retornan defaults seguros (`[]`, `{}`, `null`).
- `addNotification` despacha `window.dispatchEvent(new Event("minka-feed-update"))` — **en `window`, NO en `document`**: `notif-badge.js:11` escucha con `window.addEventListener("minka-feed-update", ...)` y `notifications.js:265` ya despacha en `window`. Despachar en `document` rompería el badge silenciosamente (el evento no burbujea de `document` a `window`).
- Nombres de clave normalizados con underscore: `minka_items`, `minka_favorites`, `minka_saved_searches`, `minka_search_history`, `minka_chat_thread`, `minka_chat_messages`, `minka_notifications`, `minka_notif_preferences`, `minka_gamification`, `minka_community`, `minka_profile`, `minka_preferences`, `minka_dashboard`.
- Cargar `store.js` (via `<script defer>`) antes que cualquier page script en todas las páginas.

**Criterios**:
- [ ] `Store.getItems()` tras `Store.saveItem({...id:1...})` retorna el item.
- [ ] Llamada con localStorage corrupto (`localStorage.setItem("minka_items","{bad")`) → `Store.getItems()` retorna `[]`, sin crash.
- [ ] `Store.addNotification({...})` dispara evento `minka-feed-update` (verificable con un listener temporal).

### Chunk 2.2 — Migrar todos los page scripts a Store

**Archivos**: `home.js, search.js, detail.js, profile.js, publish.js, notifications.js, gamification.js, community.js, dashboard.js, chat.js, settings.js`.

**Pasos**: para cada archivo, reemplazar `JSON.parse(localStorage.getItem(...))` y `localStorage.setItem(...)` por llamadas a `Store.*`. Mapeo:

| Archivo | Clave vieja | Método Store |
|---|---|---|
| `home.js:83` | `minka_published_items` | `Store.getItems()` |
| `search.js:243,245,349,360,381,427,438` | `minka_published_items`, `minka_favorites`, `minka_saved_searches`, `minka_search_history`, `minka_search_filters` | `Store.getItems()`, `Store.getFavorites()`, etc. |
| `detail.js:145` | `minka_published_items` | `Store.getItem(id)` |
| `profile.js:79` | `minka_published_items` | `Store.getItems().filter(...)` |
| `publish.js:320,466` | `minka_published_items`, `minka_publish_draft` | `Store.saveItem()`, `Store.getDraft()`/`Store.saveDraft()` (añadir a Store) |
| `notifications.js:252,264,273,284` | `minka-notif-feed`, `minka-notif-preferences` | `Store.getNotifications()`, `Store.saveNotifications()`, `Store.addNotification()` |
| `gamification.js` | (in-memory) | `Store.getGame()`, `Store.saveGame()` |
| `community.js` | (in-memory) | `Store.getCommunity()`, `Store.saveCommunity()` |
| `dashboard.js:42` | (in-memory) | `Store.getDashboard()`, `Store.saveDashboard()` |
| `chat.js:4,98,105` | `minka-chat-thread` | `Store.getChatThread()`, `Store.saveChatThread()`, `Store.getMessages()`, `Store.saveMessages()` |
| `settings.js:96,376,381,397` | `minka_preferences` | `Store.getPreferences()`, `Store.savePreferences()` |

**Criterios**:
- [ ] `rg "localStorage\.(get|set)Item" assets/scripts/pages/` retorna ≤ 5 (solo excepciones justificadas en comentarios del chunk).

### Chunk 2.3 — Modelo de owner coherente

**Archivos**: `assets/scripts/pages/publish.js`, `assets/scripts/pages/profile.js`.

**Pasos**:
1. En `publishItem` (`publish.js:286-314`), reemplazar `owner: { name: "Usuario Demo", location: "Lima, Perú", rating: 4.5 }` por:
```js
var s = Session.getSession();
owner: {
  id: s.id || "demo",
  name: s.name,
  location: s.location || "Lima, Perú",
  rating: s.rating || 4.5
}
```
2. `profile.js:79-111`: `renderMyItems` filtra por `item.owner.id === Session.getSession().id`.
3. `profile.js?user=<id>` en modo lectura: añadir un banner "Estás viendo el perfil público de X" y ocultar formularios de edición (clase `is-readonly` en `<body>` o contenedor).

**Criterios**:
- [ ] Perfil propio muestra solo mis publicaciones (no las de otros owners mock).
- [ ] `pages/perfil.html?user=demo` muestra perfil en modo lectura.

### Chunk 2.4 — Dashboard persistente + export real

**Archivo**: `assets/scripts/pages/dashboard.js`.

**Pasos**:
1. Tras `generateData(365)` la primera vez, llamar `Store.saveDashboard(data)`; si ya existe (`Store.getDashboard()` no nulo), leer. No regenerar en cada carga (`dashboard.js:42`).
2. Botón export (`dashboard.js:103-111`): reemplazar `alert` por generación de CSV:
```js
var csv = "date,co2,water,category\n";
data.forEach(function(row){
  csv += row.date + "," + row.co2 + "," + row.water + "," + row.category + "\n";
});
var blob = new Blob([csv], {type:"text/csv"});
var url = URL.createObjectURL(blob);
var a = document.createElement("a");
a.href = url;
a.download = "minka-impacto.csv";
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
```

**Criterios**:
- [ ] Recargar dashboard no cambia los números.
- [ ] Click "Exportar" descarga `minka-impacto.csv`.

### Chunk 2.5 — Persistir gamification y coherencia de puntos

**Archivo**: `assets/scripts/pages/gamification.js`, `assets/scripts/pages/home.js`.

**Pasos**:
1. En `gamification.js:11-39`, reemplazar `const MOCK_USER_DATA = {...}` por:
```js
var defaultGame = { points: 250, level: "Eco-Guerrero", badges: [...], history: [...], optOutRanking: false };
var MOCK_USER_DATA = Store.getGame() || (Store.saveGame(defaultGame), defaultGame);
```
2. Después de `redeemReward` (`gamification.js:323-332`) y de toggle `optOut` (`gamification.js:295-309`), llamar `Store.saveGame(MOCK_USER_DATA)`.
3. En `home.js`: hidratar `eco-points`, `exchanges`, `co2-saved` desde `Store.getGame()` (no hardcoded 250/8/12.5). Tomar `points` del estado de gamification, `exchanges` del historial de transacciones (o contador), `co2` derivado.
4. Unificar el valor inicial en 250 puntos (tanto home como gamification).

**Criterios**:
- [ ] Canjear un premio, recargar → puntos e historial persisten.
- [ ] Home muestra los mismos eco-puntos que gamification.

### Chunk 2.6 — Persistir comunidad + botón Participar funcional

**Archivo**: `assets/scripts/pages/community.js`, `pages/comunidad.html`.

**Pasos**:
1. Reemplazar estado in-memory por `Store.getCommunity()` (con seed inicial).
2. `currentUser.district` desde `Session.getSession().district` (fallback "Miraflores"). Si el usuario en sesión no tiene `district`, leer `Store.getPreferences().district` o "Miraflores".
3. Añadir `<div id="user-district-display"></div>` en `pages/comunidad.html` (el código lo referencia pero no existe, `community.js:49`).
4. Botón "Participar" (`community.js:138-142`): añadir handler que incrementa `challenge.current` en 1, marca al usuario como participante, persiste con `Store.saveCommunity()`, re-renderiza. Bloquear si ya participa.
5. Añadir retos para los 5 distritos sin datos: "San Borja", "Jesús María", "Magdalena", "La Molina", "Surquillo" — al menos 1 reto cada uno en el seed.

**Criterios**:
- [ ] Participar en un reto, recargar → el progreso persiste.
- [ ] El distrito del usuario se muestra en `#user-district-display`.

### Chunk 2.7 — Notificaciones bidireccionales

**Archivos**: `assets/scripts/core/store.js` (addNotification ya en 2.1), `assets/scripts/pages/chat.js`, `assets/scripts/pages/publish.js`, `assets/scripts/pages/detail.js`, `assets/scripts/pages/community.js`, `assets/scripts/pages/gamification.js`, `assets/scripts/pages/notifications.js`.

**Pasos**:
1. Tras enviar un mensaje en chat (`chat.js`): `Store.addNotification({type:"message", payload:{threadId, from:"them"}})`.
2. Tras publicar (`publish.js:320`): `Store.addNotification({type:"news", payload:{itemId, title}})`.
3. Tras reservar/cerrar en detalle (`detail.js:298,643`): `Store.addNotification({type:"match", payload:{itemId, action:"reserved|closed"}})`.
4. Tras participar en reto (`community.js`): `Store.addNotification({type:"reminder", payload:{challengeId}})`.
5. Tras canjear premio o subir nivel (`gamification.js`): `Store.addNotification({type:"reward", payload:{rewardName}})`.
6. `notif-badge.js:11` escucha `minka-feed-update` **en `window`**; confirmar que `Store.addNotification` despacha con `window.dispatchEvent` (ver Chunk 2.1).
7. Click en una notificación (`notifications.js`): navegar según `type`:
   - `message` → `pages/chat.html?thread=<threadId>`
   - `match` → `pages/detalle.html?id=<itemId>`
   - `reminder` → `pages/detalle.html?id=<itemId>` (o community)
   - `news` → `pages/detalle.html?id=<itemId>`
   - `reward` → `pages/gamification.html`
   Añadir `data-href` al item del feed.
8. Completar `prefsForType` (`notifications.js:229-234`) para `reviews` y `news`: retornar `prefs[type] !== false` para todos los tipos válidos (message, match, reminder, reviews, news, reward).

**Criterios**:
- [ ] Enviar mensaje en chat → badge de notificaciones sube en 1 al instante.
- [ ] Click en la notificación de "nuevo mensaje" → abre `chat.html?thread=<id>`.
- [ ] Toggle "Novedades y tips" en OFF → las notificaciones de tipo `news` se filtran del feed.

### Chunk 2.8 — Verificación y preferencias efectivas

**Archivos**: `assets/scripts/pages/settings.js`, `assets/scripts/pages/profile.js`.

**Pasos**:
1. `profile.js` al renderizar la tarjeta pública (cuando `Store.getPreferences().hideDistrict === true`): ocultar el distrito exacto, mostrar solo "Lima".
2. `profile.js` mostrar `availability` (de preferences) en una nueva sección "Horarios disponibles" en la tarjeta pública.
3. Persistir `verificationLevel` (`profile.js:203-222`) en `Store.saveProfile({verificationLevel})`. Tras recargar perfil, leer `Store.getProfile().verificationLevel` y reflejar badges.
4. Reauth en `settings.js:291-307`: validar contra `Session.getSession().password` real, no cualquier input. Si la password no coincide, mostrar error.
5. `logoutSession` y `logoutAll` (`settings.js:84-93,273-281`) persisten en `Store.savePreferences({sessions: [...]})` para que la lista no se regenere en cada recarga.

**Criterios**:
- [ ] Activar "Ocultar distrito exacto" en settings → guardar → visitar perfil público → el distrito no se muestra.
- [ ] Verificar cuenta → recargar → el badge de verificación persiste.
- [ ] Reauth con contraseña incorrecta → error visible.

### Checkpoint C2 — Revisión por modelo superior

**Verificar**:
1. Recargar dashboard: datos estables. Exportar CSV: descarga real.
2. Canjear premio en gamification, recargar: puntos e historial persisten. Home muestra los mismos puntos.
3. Participar en reto de comunidad, recargar: progreso persiste.
4. Enviar mensaje en chat → badge de notificaciones sube → click en notif abre el hilo correcto.
5. Perfil propio solo muestra mis items; perfil público de otro usuario (`?user=`) en modo lectura.
6. Ocultar distrito en settings → perfil público lo oculta.
7. `rg "localStorage\.(get|set)Item" assets/scripts/pages/` retorna ≤ 5.
8. Familia de claves coherente: `rg "minka_" assets/scripts/` muestra solo claves gestionadas por Store (no `minka-demo-session`, no `minka_legal_consent`, no `minka-notif-feed` con guion).

**Criterio**: 8/8 pasan.

---

## Fase 3 — Sistema de diseño unificado

> **Objetivo**: una sola fuente de tokens y componentes; eliminar duplicación que genera deriva.

### Chunk 3.1 — Reparar tokens en `assets/styles/core/base.css`

**Archivo**: `assets/styles/core/base.css`, `assets/styles/pages/*.css`.

**Pasos**:
1. Añadir a la escala de grises (base.css:26-34):
   - `--color-gray-200: #d5dbdb;`
   - `--color-gray-500: #95a5a6;`
2. En los aliases legacy (base.css:66-80): añadir comentario `/* DEPRECATED — usar --color-* */`. En los CSS de página, hacer find/replace del alias → nuevo token:
   - `--primary-color` → `--color-primary`
   - `--bg-color` → `--color-bg`
   - `--text-primary` → `--color-text`
   - `--text-secondary` → `--color-text-secondary`
   - `--border-color` → `--color-border`
   - `--warning-color` → `--color-warning`
3. Reemplazar hardcoded colors por tokens en:
   - `dashboard.css:81-93` (KPI icon backgrounds `#e8f5e9`, `#e3f2fd`, `#fff3e0`, `#3498db`) → tokens nuevos o existentes.
   - `gamification.css:16,25,79,141,166` (`rgba(0,0,0,0.05)`, `#eee`, `#f9f9f9`, `rgba(0,0,0,0.1)`) → tokens.
   - `home.css:100,191-202` (`#27ae60`, `#f1c40f`, `#3498db`, `#f9faf9`, `#f6f8f6`) → tokens.
   - `detail.css:544,576` (`#f0fdf4`, `#eef2fe7`, `#666`, `#999`, `#2c3e50`) → tokens.
4. Eliminar fallbacks muertos `var(--X, #def)` donde `--X` está definido (detail.css:123,180; home.css:146,156,289; search.css:146,264,360).
5. Añadir `--space-40: 40px;` y `--space-56: 56px;` a la escala de spacing.
6. Mover valores `px` mágicos a `rem`/`--space-*` en components.css:107,112.

**Criterios**:
- [ ] `rg "var\(--color-gray-200\)" assets/styles/` retorna las coincidencias esperadas y las estrellas de rating se ven (chat.css:357, detail.css:282).
- [ ] `rg "\-\-primary-color" assets/styles/pages/` retorna 0 (sin aliases legacy en page CSS).

### Chunk 3.2 — Sistema unificado de modales (`core/modal.js`)

**Archivos**: nuevo `assets/scripts/core/modal.js`, `assets/styles/core/components.css`, y los 5 CSS de página con `.modal*` duplicados.

**Pasos**:
1. Crear `assets/scripts/core/modal.js` con API:
   - `openModal(id)`: muestra el modal con `id`, setea `aria-hidden="false"`, foco al primer elemento focusable.
   - `closeModal(id)`: oculta, retorna foco al trigger que lo abrió.
   - Inicialización: delegación de clicks en `[data-action="open-modal"]` (lee `data-modal="<id>"`) y `[data-action="close-modal"]`, plus tecla Escape y click en el overlay.
   - **Focus trap**: mientras el modal está abierto, Tab/Shift+Tab ciclan solo dentro del `.modal__dialog` (interceptar `keydown` y envolver del último focusable al primero).
   - **Scroll lock**: al abrir, `document.body.style.overflow = "hidden"`; restaurar al cerrar.
   - **Semántica**: el `.modal__dialog` lleva `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al id del título del header.
2. En `components.css`: definir un único bloque:
   - `.modal`, `.modal__overlay`, `.modal__dialog`, `.modal__header`, `.modal__body`, `.modal__footer` con z-index `var(--z-modal: 1000)`.
   - Añadir tokens de z-index: `--z-modal: 1000; --z-toast: 1100; --z-overlay: 900;`.
3. Borrar `.modal*` duplicados de `chat.css:258-432` (copia literal de detail.css), `detail.css:13`, `profile.css:9`, `settings.css:7`, `auth.css:15`.
4. Reescribir los HTML de modales en `pages/auth.html`, `pages/detalle.html`, `pages/chat.html`, `pages/perfil.html`, `pages/settings.html`, `pages/publicar.html` para usar las nuevas clases `.modal__*`.
5. Marcar triggers con `data-action="open-modal" data-modal="<id>"` y cerradores con `data-action="close-modal"`.
6. Reemplazar `alert()`, `confirm()`, `prompt()` en:
   - `publish.js` (validación de fotos) → modal inline error.
   - `gamification.js` (redeem confirm) → modal confirm.
   - `settings.js` (save, reauth) → toast (Chunk 3.3) + modal para reauth.
   - `profile.js` (verify, appeal) → modal.
   - `detail.js` (edit) → modal ya existente.
   - `chat.js` (location-share) → modal input.

**Criterios**:
- [ ] `rg "\.modal\b" assets/styles/` solo retorna `core/components.css`.
- [ ] `rg "alert\(|confirm\(|prompt\(" assets/scripts/pages/` retorna 0.
- [ ] Con un modal abierto: Tab nunca sale del modal, Escape lo cierra, el body no scrollea, y al cerrar el foco vuelve al botón que lo abrió.

### Chunk 3.3 — Componentes compartidos + toast

**Archivos**: `assets/styles/core/components.css`, nuevo `assets/scripts/core/toast.js`.

**Pasos**:
1. En `components.css`: definir `.badge` + modificadores `--warning`, `--info`, `--match`, `--message`, `--reminder`, `--new` una sola vez. Borrar las 5 redefiniciones (`home.css:373`, `search.css:316`, `publish.css:327`, `detail.css:148`, `notifications.css:167-185`).
2. Definir `.card` base + variantes via tokens; refactorizar `.popular-card`, `.result-card`, `.step-card`, `.benefit-card`, `.kpi-card`, `.reward-card`, `.profile-card`, `.challenge-card` a `class="card card--<variant>"`. Ajustar HTML.
3. Unificar `.switch`/`.slider` (no `.switch-slider` de publish.css:117). Estilo único con focus visible WCAG 1.4.11 (box-shadow visible de ≥3:1) y `role="switch"`, `aria-checked` en el checkbox.
4. Unificar reset input/select/textarea en `components.css:133`; borrar copias en `chat.css:384`, `detail.css:309`, `publish.css:74`. Usar `border-radius: var(--space-10)` consistentemente.
5. Mover `.form__group`, `.form__row`, `.form__hint`, `.form__error`, `.form__success` a `components.css` (eliminar de `auth.css`, `profile.css`, `publish.css` — tenían copias).
6. Crear `assets/scripts/core/toast.js` con API `Toast.show(msg, type)` donde `type` ∈ `success|error|info`. Container `.toast-container` fijo en bottom-right. Cargar (via `<script defer>`) en todas las páginas.
7. Reemplazar `alert()` restantes en `settings.js` (save), `search.js` (saved search), `gamification.js` (opt-out) por `Toast.show(...)`.

**Criterios**:
- [ ] `rg "\.badge\b" assets/styles/` solo en `components.css`.
- [ ] `rg "\.switch" assets/styles/` retorna ≤ 2 archivos (`components.css` + variantes).
- [ ] `rg "Toast\.show" assets/scripts/pages/` retorna ≥ 1 por cada antiguo `alert`.

### Chunk 3.4 — Header unificado y nav sin-JS

**Archivos**: `assets/styles/core/layout.css`, `assets/styles/pages/profile.css`, `assets/styles/pages/auth.css`, `assets/scripts/core/components.js`, los 11 `pages/*.html`.

**Pasos**:
1. Borrar `.auth-header*` duplicados en `profile.css:16-77` y `auth.css:12-41` → solo `layout.css`.
2. En lugar de generar el nav en `components.js` (líneas 81-151), servir el HTML del header en cada `pages/*.html` (nav real, con los mismos enlaces y `data-i18n`). `components.js` se reduce a: marcar `aria-current` en el link activo, inicializar badge (`notif-badge.js` ya lo hace) y delegar `data-action="logout"`.
3. Añadir affordance de login: si `!Session.isAuthenticated()`, el nav oculta "Perfil"/"Chats"/"Notificaciones" y muestra "Ingresar" → `auth.html`. Implementar con `components.js` tras render (o en el HTML con `data-show="auth"`/`data-show="guest"` y JS que toguea `.is-hidden`).
4. En `pages/auth.html` (estático) alinear la cabecera con el resto (mismo `max-width: 1200px`, no `1100px`).
5. **Nav móvil unificado**: hoy conviven dos patrones (`.header__menu-toggle` del landing en `layout.css:56`/`main.js:2` y `.mobile-menu-toggle` en `layout.css:138`). Unificar en UN solo patrón hamburger para las páginas de app: botón con `aria-expanded` que alterna, `aria-controls` al id del nav, panel que cierra con Escape y con tap fuera del panel. Verificar que en 375px TODOS los links del nav de app son alcanzables.

**Criterios**:
- [ ] `rg "\.auth-header" assets/styles/` retorna solo 1 archivo (`core/layout.css`).
- [ ] Con JS deshabilitado en el navegador, el nav del header sigue visible y se puede navegar.
- [ ] En viewport 375px, el nav de `pages/home.html` abre/cierra con el hamburger, `aria-expanded` alterna, y Escape lo cierra.

### Chunk 3.5 — Footer de app + breadcrumbs

**Archivos**: `assets/styles/core/layout.css`, `assets/styles/core/components.css`, los 13 `pages/*.html`.

**Pasos**:
1. Renombrar `.home-footer` a `.app-footer` en `layout.css` (mantener `.home-footer` como alias si es necesario, preferible renombrar HTML también). Incluir el footer en todas las páginas que no lo tenían: detalle, publicar, perfil, chat, dashboard, gamification, notificaciones, comunidad.
2. Ajustar el HTML de `home.html`, `settings.html` para usar `.app-footer`.
3. Añadir breadcrumb en `detalle.html`, `publicar.html`, `perfil.html`, `chat.html`:
```html
<nav class="breadcrumb" aria-label="Migas de pan">
  <ol>
    <li><a href="../index.html">Inicio</a></li>
    <li><a href="busqueda.html">Búsqueda</a></li>
    <li aria-current="page"><span>Título del item</span></li>
  </ol>
</nav>
```
4. Estilo `.breadcrumb` en `components.css`.

**Criterios**:
- [ ] Todas las páginas tienen footer con links válidos (sin `href="#"`).
- [ ] Detalle muestra `Inicio › Búsqueda › <Título>`.

### Checkpoint C3 — Revisión por modelo superior

**Verificar**:
1. `rg "\.modal|\.badge|\.switch" assets/styles/` agrupado por archivo: solo `components.css` para cada uno.
2. Estrellas de rating en chat y detalle se ven (gris `--color-gray-200`).
3. Abrir `pages/settings.html` con JS deshabilitado: nav visible.
4. Click "Guardar preferencias" → toast (no alert).
5. `rg "alert\(|confirm\(|prompt\(" assets/scripts/pages/` retorna 0.
6. Todas las páginas con footer y breadcrumb donde aplica.
7. Lighthouse a11y en `pages/home.html` y `index.html` sin críticos nuevos.

**Criterio**: 7/7 pasan.

---

## Fase 4 — Pulido UI, accesibilidad, rendimiento

### Chunk 4.1 — Estados loading / empty / error

**Archivos**: `assets/styles/core/components.css`, `assets/scripts/pages/home.js`, `search.js`, `profile.js`, `community.js`, `gamification.js`.

**Pasos**:
1. Añadir a `components.css`: `.skeleton`, `.skeleton-card`, `.empty-state`, `.error-state` (con estilos minimalistas, animación de pulse para skeleton respetando reduced-motion).
2. En `home.js` popular-grid: mostrar skeleton antes de render de items; empty-state si `Store.getItems().length === 0`.
3. Igual en `search.js` results-grid, `profile.js` my-items, `community.js` challenges, `gamification.js` ranking.
4. Error state si `Store.getItems()` falla (raro post-Store, pero por robustez): mensaje "Error al cargar. Reintentar."
5. **Empty state accionable (first-run)**: el empty state de home y busqueda incluye DOS CTAs: "Publicar mi primer objeto" → `publicar.html`, y "Cargar datos de ejemplo" que llama `Store.seedDemo()` (añadir a `store.js`: siembra 6–8 items demo con categorías variadas e imágenes locales de `assets/images/items/`) y re-renderiza la grid sin recargar. Así la demo nunca arranca "muerta".

**Criterios**:
- [ ] Vaciar `minka_items` (vía DevTools) → home muestra empty state con ambos CTAs, no grid vacío.
- [ ] Click "Cargar datos de ejemplo" puebla la grid al instante, sin recarga.

### Chunk 4.2 — Accesibilidad

**Archivos**: `assets/styles/core/base.css`, `assets/styles/core/components.css`, los 14 HTML.

**Pasos**:
1. Añadir en cada HTML justo después de `<body>`: `<a href="#main" class="skip-link">Saltar al contenido</a>` y `id="main"` al `<main>`. Estilizar `.skip-link` en `base.css` (off-screen hasta focus).
2. Bloque `@media (prefers-reduced-motion: reduce)` en `base.css` que neutralice `transform`, `transition`, `scroll-behavior: smooth`, animaciones de skeleton.
3. Dark mode: en `base.css`, `@media (prefers-color-scheme: dark)` redefiniendo tokens de color (`--color-bg`, `--color-text`, `--color-*` surface, etc.). Respetar también el toggle manual `body.high-contrast` (ya existe, complementar con dark).
4. Indicadores de estado no solo por color:
   - `.thread--active` (chat.css:80): añadir `font-weight: 700` + icono de check.
   - `.is-unread` (notifications): añade un punto visible + `aria-label="No leída"`.
   - `.tab-btn.active`, `.filter` selected, `.auth-header__link[aria-current="page"]`: añadir `text-decoration: underline` o icono.
5. Ajustar contraste de `--color-gray-600` (hints, 3.95:1) a ≥ 4.5:1 (cambiar `#7f8c8d` a `#5d6d7e` o similar).
6. Añadir `width`/`height` en todas las `<img>` o `aspect-ratio` en CSS para evitar CLS.
7. `aria-label` en botones de sólo glyph (close `&times;`, nav toggles sin texto).

**Criterios**:
- [ ] Tab desde la URL → skip-link visible y funcional.
- [ ] Lighthouse a11y ≥ 95 en `index.html` y `pages/home.html`.
- [ ] Sistema en dark mode (forzar `prefers-color-scheme: dark` en DevTools) → colores invertidos correctamente.

### Chunk 4.3 — Imágenes locales + lazy/responsive

**Archivos**: `index.html`, `pages/perfil.html`, `assets/scripts/pages/detail.js`, `home.js`, `search.js`, mocks; nuevas imágenes en `assets/images/`.

**Pasos**:
1. Descargar las imágenes hotlinked a `assets/images/`:
   - Iconos flaticon → sustituir por SVG inline (mejor) o PNG local.
   - Hero unsplash → JPG local optimizado (800px ancho, ~80% quality).
   - Avatares pravatar → SVG generado o PNG local.
2. Reemplazar en `index.html`, `pages/perfil.html` y en los mocks JS las URLs externas por locales (`../assets/images/...` desde `pages/`, `./assets/images/...` desde `index.html`).
3. Añadir `loading="lazy"` y `decoding="async"` a todas las imágenes below-the-fold; `fetchpriority="high"` al hero de index.
4. Añadir `srcset`/`sizes` a fotos responsive (variantes 400/800/1200 si es posible). El hero: `<img src="./assets/images/hero-800.jpg" srcset="./assets/images/hero-400.jpg 400w, ./assets/images/hero-800.jpg 800w, ./assets/images/hero-1200.jpg 1200w" sizes="100vw" ...>`.
5. Reemplazar FontAwesome `all.min.css` (CDN, 11 páginas) por un subset SVG inline de los ~20 iconos usados. Si se mantiene CDN: añadir `crossorigin`, `integrity`, `media="print" onload="this.media='all'"`.
6. Corregir mojibake en `profile.css` (re-guardar como UTF-8, eliminar caracteres `Ã`).

**Criterios**:
- [ ] `rg "flaticon\.com|unsplash\.com|pravatar\.cc" index.html pages/ assets/scripts/` retorna 0.
- [ ] `rg "loading=\"lazy\"" index.html pages/` retorna muchas ocurrencias.
- [ ] Sin cargas de `cdnjs.cloudflare.com` en Network de `index.html` (si se optó por SVG inline).

### Chunk 4.4 — Rendimiento

**Archivos**: `index.html`, los 13 `pages/*.html`, `assets/styles/core/base.css`, `assets/styles/pages/chat.css`, `dashboard.css`, `settings.css`, `gamification.css`.

**Pasos**:
1. En cada `<head>` añadir `<link rel="preload" as="font" href="../assets/fonts/Inter/Inter-VariableFont_...ttf" crossorigin>` para fuentes self-hosted. Para index, `./assets/fonts/...`.
2. En `index.html`: inlinear critical CSS del hero en un `<style>` (solo reglas above-the-fold: reset, header, hero, variables). Marcar el resto de CSS como `media="print" onload="this.media='all'"` para diferir la carga.
3. Eliminar el `<link>` a `auth-advanced.css` en `pages/auth.html:20` (purgado en Fase 3).
4. Cambiar `100vh` → `100dvh` en `chat.css:5`, `dashboard.css:6`, `settings.css:6`, `gamification.css:6` y donde aparezca.
5. Debounce en writes de Store para búsqueda/favoritos (configurable, 300ms): añadir un helper `Store.debouncedSetKey(key, value, 300)` o usar un wrapper en los page scripts.
6. `scroll-behavior: smooth` en `base.css:148` envuelto en `@media (prefers-reduced-motion: no-preference)`.

**Criterios**:
- [ ] Lighthouse Performance ≥ 85 mobile en `index.html`.
- [ ] `rg "100vh" assets/styles/` retorna 0.

### Chunk 4.5 — Micro-interacciones y estados de acción

**Archivos**: `assets/styles/core/components.css`, `assets/scripts/pages/publish.js`, `settings.js`, `gamification.js`, `auth.js`, `search.js`, `home.js`.

**Pasos**:
1. Estados de botón unificados en `components.css`: `.btn.is-loading` (spinner CSS puro vía `::after` con border animado + `pointer-events: none`), `.btn:disabled` (opacidad + cursor), `:focus-visible` (outline 2px `--color-primary` con offset), `:active` (scale 0.98, solo dentro de `prefers-reduced-motion: no-preference`).
2. Prevenir doble submit en las 4 acciones principales — publicar item, guardar preferencias, canjear premio, login: `btn.disabled = true` + clase `.is-loading` al iniciar; simular latencia 400–600ms (`setTimeout`) para que el feedback sea perceptible; al terminar, restaurar el botón y mostrar `Toast.show(...)`.
3. Favorito (corazón) en cards de home/busqueda: botón toggle con `aria-pressed`, animación scale-pop en CSS (respeta reduced-motion), persistido con `Store.toggleFavorite(id)`; el estado se hidrata al renderizar cada card.
4. Entrada de cards: fade-in sutil vía clase `.is-entering` (solo opacidad, ~150ms, dentro de no-preference). Nada de animaciones en cascada largas.

**Criterios**:
- [ ] Doble click rápido en "Publicar" crea exactamente 1 item.
- [ ] El corazón alterna estado visual + `aria-pressed` y persiste tras recargar.
- [ ] Los botones muestran spinner durante la acción y toast al terminar.

### Chunk 4.6 — UX de formularios

**Archivos**: `pages/auth.html`, `pages/publicar.html`, `assets/scripts/pages/auth.js`, `publish.js`, `assets/styles/core/components.css`.

**Pasos**:
1. Validación inline on-blur: por cada campo requerido, mostrar `.form__error` bajo el input con mensaje específico ("Ingresá un correo válido", no "Campo inválido") + `aria-invalid="true"` en el input y `aria-describedby` al id del error. Limpiar al corregir. No validar on-input hasta después del primer blur (no molestar mientras tipean).
2. Autocomplete correcto en auth: `autocomplete="email"`, `autocomplete="current-password"` (login) / `new-password` (registro), `inputmode="numeric"` en campos numéricos (teléfono).
3. Toggle "mostrar contraseña" en auth: botón con icono SVG inline (ojo), `aria-label="Mostrar contraseña"` y `aria-pressed`, que alterna `type="password"` ↔ `type="text"`.
4. Contador de caracteres en título y notas de publicar: `maxlength` + `<span class="form__hint">N/80</span>` actualizado on-input con `aria-live="polite"`.
5. Al fallar la validación del submit en publicar: `focus()` + `scrollIntoView({block:"center", behavior:"smooth"})` al primer campo con error (smooth solo en no-preference).

**Criterios**:
- [ ] Blur en email vacío muestra error específico bajo el campo; corregirlo lo limpia.
- [ ] Submit inválido enfoca y scrollea al primer error.
- [ ] Toggle de contraseña alterna visibilidad; el contador actualiza al tipear.

### Chunk 4.7 — UX de búsqueda y filtros

**Archivos**: `assets/scripts/pages/search.js`, `pages/busqueda.html`, `assets/styles/pages/search.css`.

**Pasos**:
1. Debounce de 300ms en el input de texto → filtra automáticamente sin apretar el botón (el botón se mantiene para uso sin-JS y accesibilidad).
2. Chips de filtros activos bajo la barra de búsqueda: cada filtro aplicado (categoría, distrito, estado, orden) renderiza un chip con "×" para quitarlo individualmente; botón "Limpiar todo" visible si hay ≥ 2 chips.
3. Sincronizar TODOS los filtros con la URL (`?q=&category=&district=&sort=`) vía `history.replaceState` — URLs compartibles; volver atrás desde detalle restaura la búsqueda completa (extiende el manejo de `?q=`/`?category=` del Chunk 1.7).
4. Dropdown de búsquedas recientes al enfocar el input vacío: desde `Store.getSearchHistory()`, máximo 5, con opción "Borrar historial". Cierra con Escape y click fuera.
5. `aria-live="polite"` en el contador de resultados para que lectores de pantalla anuncien "N resultados" al filtrar.

**Criterios**:
- [ ] Tipear filtra tras ~300ms sin click en el botón.
- [ ] Quitar un chip re-filtra y actualiza la URL.
- [ ] Copiar la URL con filtros y abrirla en otra pestaña reproduce la búsqueda exacta.

### Chunk 4.8 — UX de detalle: galería, CTA fija y compartir

**Archivos**: `pages/detalle.html`, `assets/scripts/pages/detail.js`, `assets/styles/pages/detail.css`.

**Pasos**:
1. Galería de fotos: imagen principal + thumbnails clicables cuando el item tiene ≥ 2 fotos; navegación con ← / → cuando la galería tiene foco; `aria-label` de posición ("Foto 2 de 4") en la imagen principal.
2. CTA fija en móvil (≤ 768px): barra inferior sticky con "Contactar" + tipo de intercambio; ocultarla cuando el CTA original está en viewport (`IntersectionObserver` sobre el botón original). No debe tapar el footer.
3. Botón compartir: `navigator.share({title, url})` si está disponible; fallback `navigator.clipboard.writeText(url)` + `Toast.show("Enlace copiado")`.
4. Sección "Similares" al final del detalle: hasta 3 cards de la misma categoría desde `Store.getItems()` (excluyendo el item actual); si no hay, ocultar la sección.

**Criterios**:
- [ ] En 375px la barra CTA aparece al scrollear pasado el CTA original y desaparece al volver.
- [ ] Compartir en desktop (sin Web Share) copia el enlace y muestra toast.
- [ ] Similares muestra ≤ 3 items de la misma categoría, nunca el actual.

### Checkpoint C4 — Revisión por modelo superior

**Verificar**:
1. Sin hotlinks externos.
2. Lighthouse Performance ≥ 85, a11y ≥ 95, Best Practices ≥ 90 en index, home, detalle.
3. Dark mode automático (sin configurar nada) funciona.
4. Skip-link y tab completo en home.
5. Empty states visibles al limpiar `minka_items` en DevTools; "Cargar datos de ejemplo" puebla la grid.
6. Doble click en "Publicar" no duplica; botones con loading + toast.
7. Validación inline en auth y publicar: blur muestra error específico, submit inválido enfoca el primero.
8. Filtros de búsqueda ↔ URL sincronizados; chips agregan/quitan filtros.
9. En 375px: nav hamburger de app funciona y la CTA fija de detalle aparece/desaparece correctamente.
10. Modal con teclado: focus trap, Escape, retorno de foco (regresión del Chunk 3.2).

**Criterio**: 10/10 pasan.

---

## Fase 5 — i18n completo (es/en/qu)

### Chunk 5.1 — Completar diccionario

**Archivo**: `assets/scripts/core/translations.js`.

**Pasos**:
1. Añadir todas las claves `auth_*` usadas en `pages/auth.html:43-345` en es/en/qu (auth_title, auth_subtitle, auth_tab_login/register/recovery, auth_label_*, auth_btn_*, auth_social_*, auth_terms_*, auth_divider_*, etc.).
2. Añadir todas las claves `search_*` usadas en `pages/busqueda.html:35-256` (search_hero_title, search_placeholder, search_btn, search_filters_*, search_cat_*, search_filter_*, search_sort_*, search_results_*, search_saved_*, search_rating_stars, search_distance_*). (Las 2 de Fase 1 ya añadidas.)
3. Añadir claves para dashboard, gamification, chat, detalle, comunidad (que no tenían `data-i18n`): primero añadir los atributos en el HTML (Chunk 5.2), luego las claves aquí.

**Criterios**:
- [ ] Para cada `data-i18n="auth_*"` y `data-i18n="search_*"` en el HTML hay entrada en es/en/qu en `translations.js`.

### Chunk 5.2 — `data-i18n` en páginas sin cobertura

**Archivos**: `pages/dashboard.html`, `pages/gamification.html`, `pages/chat.html`, `pages/detalle.html`, `pages/comunidad.html`, `pages/notificaciones.html` (parcial).

**Pasos**:
1. Añadir `data-i18n="<key>"` a todos los textos estáticos visibles (títulos, labels, botones, breadcrumbs, headings de secciones).
2. Para contenido dinámico (cards, mensajes, badges dinámicos), añadir llamadas `I18n.t("key")` al renderizar en el JS correspondiente.
3. En `translations.js` (tras Chunk 5.1) añadir las claves nuevas con sus traducciones es/en/qu.

**Criterios**:
- [ ] Cambiar a inglés en settings → todas las páginas visibles están en inglés.

### Chunk 5.3 — Reparar bloque Quechua + cleanup

**Archivo**: `assets/scripts/core/translations.js`.

**Pasos**:
1. Eliminar redeclaraciones duplicadas en `translations.js:761-776` (settings_* redeclaradas en el bloque qu).
2. Sincronizar las keys huérfanas del bloque qu (`home_hero_title`, `home_hero_subtitle`, `home_cta_search`, `home_cta_publish` en 779-783) con es/en o eliminarlas si no se usan.

**Criterios**:
- [ ] Cargar `translations.js` y activar `qu` → sin claves missing; sin warnings en consola.

### Chunk 5.4 — Reducir ruido de consola + sync `<html lang>`

**Archivo**: `assets/scripts/core/i18n.js`.

**Pasos**:
1. En `i18n.js:79-81`: reemplazar `console.warn` por un contador silencioso (array interno de missing keys). Solo log si `localStorage.getItem("minka_debug_i18n") === "1"`.
2. Eliminar `console.log` en `i18n.js:14,65`.
3. En `applyLanguage(lang)`, setear `document.documentElement.lang = lang`.

**Criterios**:
- [ ] Cargar auth y busqueda con `i18n` sin claves missing → consola limpia.
- [ ] Tras cambiar a `en`, `<html lang="en">`.

### Checkpoint C5 — Revisión por modelo superior

**Verificar**:
1. Consola limpia en todas las páginas (sin warns de i18n).
2. Cambio es↔en↔qu en settings traduce todas las páginas visibles.
3. `<html lang>` se actualiza dinámicamente.
4. Sin duplicaciones ni keys huérfanas en `translations.js`.

**Criterio**: 4/4 pasan.

---

## Checkpoint Final — Revisión integral por modelo superior

**Verificar (smoke test completo)**:
1. Deploy de GitHub Pages desde `path: .` funciona; landing en raíz.
2. Estructura de carpetas coincide con la "Estructura objetivo".
3. Flujo end-to-end: landing → auth (login demo) → home → publicar → detalle → contactar → chat → enviar/respuesta → recargar → persiste. Logout → redirect auth.
4. Búsqueda con filtros desde home → busqueda (`?q=`) → card → detalle → notificación generada → badge sube.
5. Dashboard estable al recargar + export CSV funcional.
6. Gamification canjear + persistir + coherencia con home.
7. Comunidad participar + persistir.
8. Perfil propio vs público diferenciados; ocultar distrito efectivo.
9. Modales unificados; sin `alert/confirm/prompt`.
10. Tokens unificados; sin duplicados `.modal/.badge/.switch`; estrellas de rating visibles.
11. Skip-link, dark mode, reduced-motion funcionales; Lighthouse a11y ≥ 95.
12. Sin hotlinks externos; Lighthouse perf ≥ 85.
13. i18n completo es/en/qu; `<html lang>` dinámico; consola limpia.
14. `rg "public/" .` retorna 0 (sin referencias legacy).
15. `rg "minka-demo-session|minka_legal_consent|minka_session[^-]" --type js` sin matches fuera de `session.js`.
16. UX: doble-submit bloqueado en las 4 acciones principales; filtros de búsqueda persistidos en URL; nav móvil funcional en 375px; CTA fija de detalle en móvil; focus trap de modales verificado con teclado.

**Aprobación final**: 16/16 pasan. El prototipo está completo y estable.

---

## Apéndice A — Mapa de archivos nuevos y de mayor impacto

| Archivo | Rol | Fase |
|---|---|---|
| `index.html` (raíz) | Landing, servida en root | 0 |
| `pages/` (13 archivos) | App, agrupada | 0 |
| `assets/scripts/core/session.js` | Sesión unificada | 1 |
| `assets/scripts/core/store.js` | Persistencia centralizada | 2 |
| `assets/scripts/core/modal.js` | Modales unificados | 3 |
| `assets/scripts/core/toast.js` | Feedback no-bloqueante | 3 |
| `assets/scripts/core/constants.js` | Categorías y eco-factores | 1 |
| `assets/scripts/core/components.js` (editado) | Logout + nav sin-JS | 1, 3 |
| `assets/scripts/pages/publish.js` (editado) | 4 bugs core | 1 |
| `assets/scripts/pages/detail.js` (editado) | Persistencia + QR real | 1 |
| `assets/scripts/pages/search.js` (editado) | Bug count + handoff | 1 |
| `assets/scripts/pages/chat.js` (editado) | Handoff + persistencia | 1, 2 |
| `assets/styles/core/base.css` (editado) | Tokens + a11y + perf | 3, 4 |
| `assets/styles/core/components.css` (editado) | Componentes unificados | 3 |
| `assets/scripts/core/translations.js` (editado) | Diccionario completo | 5 |
| `.github/workflows/pages.yml` (editado) | `path: .` | 0 |

## Apéndice B — Secuencia recomendada de ramas

```
main
 ├─ phase/0-reorg            → C0  → merge
 ├─ phase/1-bugs             → C1  → merge
 ├─ phase/2-persistence      → C2  → merge
 ├─ phase/3-design-system    → C3  → merge
 ├─ phase/4-polish-perf-a11y → C4  → merge
 └─ phase/5-i18n             → C5  → CF → merge to main
```

## Apéndice C — Registro de avance

> Sección a completar conforme se ejecutan las fases. Formato sugerido:
>
> - [fecha] Fase X, Chunk X.Y — estado: `done/partial/blocked` — notas: ...

- [2026-07-17] **Plan validado contra el código** (spot-check de las referencias `archivo:línea`; todas las claves verificadas resultaron exactas). Correcciones aplicadas al plan: (a) el evento `minka-feed-update` debe despacharse en `window`, no `document` — `notif-badge.js:11` escucha en `window` (Chunks 2.1 y 2.7); (b) el bug de `languageChanged` en `window` existe también en `profile.js:539`, no solo en `publish.js:146` (Chunk 1.5); (c) `drawPseudoQr` ya existe en `detail.js:478` con llamadas comentadas — reactivar, no reimplementar (Chunk 1.6). Mejoras UI/UX añadidas: focus trap + `aria-modal` + scroll lock en `modal.js` (3.2), nav móvil unificado (3.4), empty state accionable con seed demo (4.1), y Chunks nuevos 4.5 (micro-interacciones), 4.6 (formularios), 4.7 (búsqueda/filtros/URL), 4.8 (galería, CTA fija, compartir, similares). Checkpoints C4 y Final extendidos en consecuencia.