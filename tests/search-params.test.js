import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SEARCH_DEFAULTS,
  HOME_FILTER_CHIPS,
  parseSearchParams,
  filtersToParams,
  buildSearchUrl,
  resultsSummary,
} from "../src/scripts/lib/search-params.js";

test("parseSearchParams returns the defaults and no params for an empty query string", () => {
  assert.deepEqual(parseSearchParams(""), { filters: { ...SEARCH_DEFAULTS }, hasParams: false });
  assert.deepEqual(parseSearchParams("?"), { filters: { ...SEARCH_DEFAULTS }, hasParams: false });
});

test("parseSearchParams reads every filter the search page shares by URL", () => {
  const { filters, hasParams } = parseSearchParams(
    "?q=%20Bici%20&category=Libros&exclude=Otros&district=Barranco&rating=4&distance=5&sort=distance"
  );
  assert.equal(hasParams, true);
  assert.deepEqual(filters, {
    query: "Bici",
    category: "Libros",
    exclude: "Otros",
    userLocation: "Barranco",
    minRating: 4,
    maxDistance: 5,
    sort: "distance",
  });
});

test("parseSearchParams clamps numbers and ignores unknown sort values", () => {
  const { filters } = parseSearchParams("?rating=9&distance=0&sort=price");
  assert.equal(filters.minRating, 5);
  assert.equal(filters.maxDistance, 1);
  assert.equal(filters.sort, "relevance");
  const junk = parseSearchParams("?rating=abc&distance=xyz").filters;
  assert.equal(junk.minRating, 0);
  assert.equal(junk.maxDistance, 15);
});

test("parseSearchParams ignores unrelated params", () => {
  assert.equal(parseSearchParams("?utm_source=x").hasParams, false);
});

test("filtersToParams writes only values that differ from the defaults", () => {
  assert.equal(filtersToParams(SEARCH_DEFAULTS).toString(), "");
  const params = filtersToParams({ ...SEARCH_DEFAULTS, query: "mesa", minRating: 4, sort: "rating" });
  assert.equal(params.toString(), "q=mesa&rating=4&sort=rating");
});

test("filtersToParams and parseSearchParams round-trip", () => {
  const filters = { ...SEARCH_DEFAULTS, query: "libros sci-fi", category: "favorites", maxDistance: 5, userLocation: "Jesús María" };
  assert.deepEqual(parseSearchParams(`?${filtersToParams(filters)}`).filters, filters);
});

test("HOME_FILTER_CHIPS have unique ids, labels and params the search page understands", () => {
  assert.ok(HOME_FILTER_CHIPS.length >= 4 && HOME_FILTER_CHIPS.length <= 6);
  const ids = new Set(HOME_FILTER_CHIPS.map((chip) => chip.id));
  assert.equal(ids.size, HOME_FILTER_CHIPS.length);
  for (const chip of HOME_FILTER_CHIPS) {
    assert.ok(chip.label.length > 0);
    const { hasParams } = parseSearchParams(`?${new URLSearchParams(chip.params)}`);
    assert.ok(hasParams, `${chip.id} maps to a known param`);
  }
});

test("buildSearchUrl carries the query and the selected chips", () => {
  const base = "/minka/pages/busqueda.html";
  assert.equal(buildSearchUrl(base, "", []), base);
  assert.equal(buildSearchUrl(base, "  bici  ", []), `${base}?q=bici`);
  const near = HOME_FILTER_CHIPS.find((chip) => chip.id === "near");
  const url = buildSearchUrl(base, "mesa de centro", ["near", "unknown"]);
  const params = new URLSearchParams(url.split("?")[1]);
  assert.equal(params.get("q"), "mesa de centro");
  for (const [key, value] of Object.entries(near.params)) assert.equal(params.get(key), value);
  assert.equal([...params.keys()].length, 1 + Object.keys(near.params).length);
});

test("resultsSummary echoes the count and the query", () => {
  assert.equal(resultsSummary(0, ""), "0 resultados");
  assert.equal(resultsSummary(1, ""), "1 resultado");
  assert.equal(resultsSummary(6, "bici"), "6 resultados para “bici”");
});

test("resultsSummary translates through the given tr()", () => {
  const en = {
    search_summary_one: "{count} result",
    search_summary_other: "{count} results",
    search_summary_query: "{summary} for “{query}”",
  };
  const tr = (key, fallback, vars) =>
    (en[key] ?? fallback).replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  assert.equal(resultsSummary(1, "", tr), "1 result");
  assert.equal(resultsSummary(6, "bici", tr), "6 results for “bici”");
});
