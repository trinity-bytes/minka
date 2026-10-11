import { test } from "node:test";
import assert from "node:assert/strict";
import {
  renderEmptyState,
  renderErrorState,
  renderSkeleton,
  renderStateAction,
} from "../src/scripts/lib/states.js";

test("renderEmptyState renders icon, title, text and the panel variant by default", () => {
  const html = renderEmptyState({
    icon: "fa-seedling",
    title: "Todavía no hay publicaciones",
    text: "Publica tu primer objeto.",
  });
  assert.match(html, /^<div class="state state--empty state--panel">/);
  assert.match(html, /<span class="state__icon" aria-hidden="true"><i class="fa-solid fa-seedling"><\/i><\/span>/);
  assert.match(html, /<h2 class="state__title">Todavía no hay publicaciones<\/h2>/);
  assert.match(html, /<p class="state__text">Publica tu primer objeto.<\/p>/);
  assert.doesNotMatch(html, /state__actions/);
  assert.doesNotMatch(html, /role="/);
});

test("renderEmptyState supports the compact variant, a heading level and omits empty text", () => {
  const html = renderEmptyState({
    variant: "compact",
    headingLevel: 3,
    icon: "fa-bell",
    title: "Sin novedades",
  });
  assert.match(html, /class="state state--empty state--compact"/);
  assert.match(html, /<h3 class="state__title">Sin novedades<\/h3>/);
  assert.doesNotMatch(html, /state__text/);
});

test("renderEmptyState escapes every interpolated string", () => {
  const html = renderEmptyState({
    title: `<img src=x onerror="x">`,
    text: "Tom & Jerry",
    actions: [{ label: "<b>Ir</b>", href: `x" onclick="y` }],
  });
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img src=x onerror=&quot;x&quot;&gt;"));
  assert.ok(html.includes("Tom &amp; Jerry"));
  assert.ok(html.includes("&lt;b&gt;Ir&lt;/b&gt;"));
  assert.ok(html.includes(`href="x&quot; onclick=&quot;y"`));
});

test("an icon that is not a Font Awesome class falls back to the default glyph", () => {
  const html = renderEmptyState({ icon: `fa-x" onmouseover="y`, title: "T" });
  assert.match(html, /<i class="fa-solid fa-inbox"><\/i>/);
  assert.ok(!html.includes("onmouseover"));
});

test("an unknown variant falls back to panel", () => {
  assert.match(renderEmptyState({ variant: "huge", title: "T" }), /state--panel/);
});

test("renderStateAction renders links and buttons with variants, ids and data attributes", () => {
  assert.equal(
    renderStateAction({ label: "Publicar", href: "publicar.html", variant: "primary" }),
    '<a class="btn btn-primary" href="publicar.html">Publicar</a>'
  );
  assert.equal(
    renderStateAction({ label: "Limpiar filtros", id: "empty-reset-filters", data: { reset: "" } }),
    '<button class="btn btn-secondary" type="button" id="empty-reset-filters" data-reset="">Limpiar filtros</button>'
  );
  assert.equal(
    renderStateAction({ label: "Ver", variant: "ghost", icon: "fa-rotate-right" }),
    '<button class="btn btn-ghost" type="button"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i>Ver</button>'
  );
});

test("renderStateAction ignores unsafe data attribute names and unknown variants", () => {
  const html = renderStateAction({ label: "X", variant: "evil", data: { 'a" b': "1", ok: "2" } });
  assert.equal(html, '<button class="btn btn-secondary" type="button" data-ok="2">X</button>');
});

test("renderEmptyState renders actions inside one actions row", () => {
  const html = renderEmptyState({
    title: "T",
    actions: [
      { label: "A", href: "a.html", variant: "primary" },
      { label: "B", id: "b" },
    ],
  });
  assert.match(
    html,
    /<div class="state__actions"><a class="btn btn-primary" href="a.html">A<\/a><button class="btn btn-secondary" type="button" id="b">B<\/button><\/div>/
  );
});

test("renderErrorState is an alert by default with a retry action", () => {
  const html = renderErrorState({
    title: "No pudimos cargar las publicaciones",
    text: "Revisa el almacenamiento.",
    retry: { label: "Reintentar", data: { retry: "" } },
  });
  assert.match(html, /^<div class="state state--error state--panel" role="alert">/);
  assert.match(html, /<i class="fa-solid fa-triangle-exclamation"><\/i>/);
  assert.match(html, /<button class="btn btn-secondary" type="button" data-retry="">Reintentar<\/button>/);
});

test("renderErrorState can drop the alert role when rendered statically", () => {
  const html = renderErrorState({ title: "Error", alert: false, variant: "compact" });
  assert.match(html, /^<div class="state state--error state--compact">/);
  assert.doesNotMatch(html, /role="alert"/);
});

test("renderSkeleton renders a status label and aria-hidden blocks of the variant", () => {
  const html = renderSkeleton({ variant: "card", count: 2, label: "Cargando publicaciones…" });
  assert.match(html, /^<div class="sr-only skeleton-status" role="status">Cargando publicaciones…<\/div>/);
  assert.equal(html.match(/class="skeleton skeleton--card" aria-hidden="true"/g).length, 2);
  assert.match(html, /skeleton__block skeleton__block--media/);
  assert.match(html, /skeleton__block skeleton__block--line/);
});

test("renderSkeleton supports list items, rows, tiles and clamps the count", () => {
  const rows = renderSkeleton({ variant: "row", count: 3, tag: "li" });
  assert.match(rows, /^<li class="sr-only skeleton-status" role="status">Cargando…<\/li>/);
  assert.equal(rows.match(/<li class="skeleton skeleton--row" aria-hidden="true">/g).length, 3);
  assert.match(rows, /skeleton__block--circle/);

  const tiles = renderSkeleton({ variant: "tile", count: 99, tag: "section" });
  assert.equal(tiles.match(/<div class="skeleton skeleton--tile" aria-hidden="true">/g).length, 12);

  assert.equal(renderSkeleton({ count: 0 }).match(/class="skeleton /g).length, 1);
});

test("renderSkeleton can omit the status label", () => {
  const html = renderSkeleton({ variant: "tile", count: 1, label: "" });
  assert.doesNotMatch(html, /skeleton-status/);
});
