import { test } from "node:test";
import assert from "node:assert/strict";
import { pageSlug, navCurrent, NAV_SECTIONS } from "../src/scripts/lib/app-nav.js";

test("pageSlug reads the page name from built and dev paths", () => {
  assert.equal(pageSlug("/minka/pages/home.html"), "home");
  assert.equal(pageSlug("/minka/pages/home"), "home");
  assert.equal(pageSlug("/minka/pages/busqueda/"), "busqueda");
  assert.equal(pageSlug("/minka/pages/detalle.html?id=3#fotos"), "detalle");
});

test("pageSlug returns an empty string for the site root", () => {
  assert.equal(pageSlug("/minka/"), "minka");
  assert.equal(pageSlug("/"), "");
  assert.equal(pageSlug(""), "");
});

test("navCurrent marks the item whose own page is open as the current page", () => {
  assert.equal(navCurrent("home", "/minka/pages/home.html"), "page");
  assert.equal(navCurrent("profile", "/minka/pages/perfil.html"), "page");
});

test("navCurrent marks the parent section for pages without their own item", () => {
  // The search flow (busqueda, detalle) lives under Inicio since T10d-2:
  // búsqueda has no nav item and is reached from the home search bar.
  assert.equal(navCurrent("home", "/minka/pages/busqueda"), "true");
  assert.equal(navCurrent("home", "/minka/pages/detalle.html"), "true");
  assert.equal(navCurrent("profile", "/minka/pages/settings.html"), "true");
  assert.equal(navCurrent("profile", "/minka/pages/dashboard.html"), "true");
  assert.equal(navCurrent("community", "/minka/pages/gamification.html"), "true");
});

test("navCurrent leaves unrelated items and unknown keys unmarked", () => {
  assert.equal(navCurrent("community", "/minka/pages/busqueda.html"), undefined);
  assert.equal(navCurrent("search", "/minka/pages/busqueda.html"), undefined);
  assert.equal(navCurrent("nope", "/minka/pages/home.html"), undefined);
  assert.equal(navCurrent("home", "/minka/"), undefined);
});

test("every section lists its own page first and no page belongs to two sections", () => {
  const seen = new Set();
  for (const [key, slugs] of Object.entries(NAV_SECTIONS)) {
    assert.ok(slugs.length > 0, `${key} has pages`);
    for (const slug of slugs) {
      assert.ok(!seen.has(slug), `${slug} appears once`);
      seen.add(slug);
    }
  }
});
