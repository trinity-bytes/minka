<!-- markdownlint-disable MD033 -->
<h1 align="center">Mink’a Landing Page</h1>
<p align="center">
  <img src="src/assets/images/minka-logo.png" alt="Logotipo de Mink’a" width="160">
</p>
<p align="center"><strong>Economía circular al alcance de tu comunidad</strong></p>
<p align="center">
  <a href="https://trinity-bytes.github.io/minka/" target="_blank">
    <img src="https://img.shields.io/badge/Demo%20en%20vivo-00a86b?style=for-the-badge&logo=github&logoColor=white" alt="Abrir demo en vivo" />
  </a>
</p>

## 🧭 Tabla de Contenidos

- [🧭 Tabla de Contenidos](#-tabla-de-contenidos)
- [📌 Descripción del Proyecto](#-descripción-del-proyecto)
- [🎯 Segmento Objetivo](#-segmento-objetivo)
- [🌟 Características Principales](#-características-principales)
- [🏗️ Arquitectura de la Landing](#️-arquitectura-de-la-landing)
- [🚀 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🛠️ Guía de Uso y Desarrollo](#️-guía-de-uso-y-desarrollo)
- [👥 Autores](#-autores)
- [🔗 Acceso Rápido](#-acceso-rápido)

<a id="descripcion-del-proyecto"></a>

## 📌 Descripción del Proyecto

Mink’a es una plataforma digital orientada a la economía circular y el trueque comunitario. Esta landing page comunica la propuesta de valor de la solución, presenta beneficios claves y acompaña al usuario hacia el registro y la descarga del prototipo interactivo.

<a id="segmento-objetivo"></a>

## 🎯 Segmento Objetivo

- Personas urbanas en Lima Metropolitana con interés en reducir costos y fomentar la reutilización.
- Usuarios que desean intercambiar objetos y servicios de forma segura, confiable y transparente.
- Comunidades que promueven prácticas sostenibles, colaborativas y de impacto ambiental positivo.

<a id="caracteristicas-principales"></a>

## 🌟 Características Principales

- **Diseño responsivo:** experiencia consistente en dispositivos móviles, tabletas y escritorio.
- **Accesibilidad base:** uso de roles ARIA, contraste AA y soporte para navegación por teclado.
- **Secciones informativas clave:**
  - Hero con CTA principal.
  - Tres pasos que explican cómo funciona Mink’a.
  - Beneficios del trueque y su aporte al ahorro.
  - Indicadores de impacto ambiental y social.
  - Voces reales de la comunidad (testimonios).
- **Optimización del performance:** imágenes comprimidas y carga diferida para conexiones limitadas.
- **Despliegue automatizado:** integración con GitHub Pages para actualizaciones rápidas.

<a id="arquitectura-de-la-landing"></a>

## 🏗️ Arquitectura de la Landing

```text
astro.config.mjs              # Salida estática, base /minka, build.format "file", sitemap
src/
├── pages/                    # Rutas: index.astro (landing), 404.astro y pages/*.astro
│                             # (auth, busqueda, home, detalle, publicar, dashboard, comunidad,
│                             #  notificaciones, gamification, perfil, settings, chat, about)
├── components/
│   ├── layout/               # BaseLayout, AppLayout, SiteHeader/Footer, AppHeader/Footer, AuthHeader
│   ├── ui/                   # Primitivas compartidas: Button, Card, Chip, Modal, PageHead, Stat, ...
│   └── landing/ auth/ search/ home/ detail/ publish/ dashboard/
│       exchange/ notifications/   # Componentes por área
├── assets/images/            # Imágenes optimizadas con astro:assets (AVIF/WebP + srcset)
├── styles/
│   ├── tokens.css            # Única fuente de design tokens
│   ├── fonts.css             # @font-face (WOFF2)
│   ├── global.css            # Base, utilidades y preferencias de accesibilidad
│   ├── app.css               # Estilos compartidos del shell de la app
│   └── pages/                # Estilos por página
├── scripts/
│   ├── pages/                # Comportamiento por página (módulos ES)
│   ├── menu-disclosure.ts    # Menú móvil accesible (Escape, foco, focus trap)
│   ├── reveal.ts             # Animaciones de aparición
│   └── tokens.ts             # Colores de tokens para canvas (Chart.js)
└── lib/                      # Utilidades TS: url/asset con base, sesión, categorías, eco
public/                       # Copiado tal cual a dist/
├── favicon.ico
└── assets/
    ├── fonts/                # Inter y Fraunces (variables), Pacifico; todo en WOFF2
    ├── images/               # Imágenes con URL estable usadas desde JS (items, avatares, íconos, QR)
    └── scripts/core/         # Scripts clásicos compartidos (store, session, guard, i18n, toast, modal)
```

<a id="tecnologias-utilizadas"></a>

## 🚀 Tecnologías Utilizadas

- Astro (salida estática) como herramienta de build.
- HTML5 semántico para estructura y contenido.
- CSS3 (flexbox, grid y variables personalizadas) para estilos responsivos.
- JavaScript ES6+ para interactividad ligera y progresiva.
- GitHub Pages para hosting continuo.
- Flujo de trabajo GitFlow para organización del equipo.

<a id="guia-de-uso-y-desarrollo"></a>

## 🛠️ Guía de Uso y Desarrollo

1. **Clona el repositorio:** `git clone https://github.com/Reflow-Tech-UPC/Minka-Landingpage.git`
2. **Instala dependencias:** requiere Node 24 (ver `.nvmrc`); ejecuta `npm install`.
3. **Ejecuta en local:** `npm run dev` y abre `http://localhost:4321/minka/`.
   - `npm run build`: genera el sitio estático en `dist/` (incluye `404.html` y `sitemap-index.xml`).
   - `npm run preview`: sirve `dist/` para validar el build.
   - `npm run check`: revisa tipos y plantillas con `astro check`.
4. **Crea una rama de trabajo:** `git checkout -b feature/nueva-seccion`
5. **Haz commit con convenciones claras** (ej. `feat: agrega sección de preguntas frecuentes`).
6. **Publica en GitHub Pages:** al fusionar con la rama principal, el workflow ejecuta `npm ci && npm run build` y publica `dist/` en GitHub Pages.

<a id="autores"></a>

## 👥 Autores

- Leonardo Chávez
- Lucero Pipa
- Ronel Rojas
- Andy Salcedo
- Miguel Sanca
- Jahat Trinidad

<a id="acceso-rapido"></a>

## 🔗 Acceso Rápido

- Landing Page: [https://trinity-bytes.github.io/minka/](https://trinity-bytes.github.io/minka/)
- Repositorio: [https://github.com/trinity-bytes/minka](https://github.com/trinity-bytes/minka)

<p align="center">💚 Construido con dedicación para impulsar la colaboración y la sostenibilidad por el team Reflow Tech.</p>
