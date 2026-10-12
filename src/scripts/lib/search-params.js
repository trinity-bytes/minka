/**
 * Pure helpers for the search flow (visual-language T10d-2): the home
 * search bar builds a busqueda URL from its query and quick filter chips,
 * and the search page reads that URL back into its filter state. Plain JS
 * so `node --test` imports it.
 */

/** Search page filter state with nothing applied. */
export const SEARCH_DEFAULTS = Object.freeze({
  query: "",
  category: "",
  exclude: "",
  userLocation: "",
  minRating: 0,
  maxDistance: 15,
  sort: "relevance",
});

export const SORT_VALUES = Object.freeze(["relevance", "distance", "rating"]);

const RATING_RANGE = [0, 5];
const DISTANCE_RANGE = [1, 30];

/**
 * Quick filters under the home search bar: toggle chips mapped to the
 * search page URL params (each chip sets an independent dimension).
 */
export const HOME_FILTER_CHIPS = Object.freeze([
  { id: "near", label: "A 5 km o menos", icon: "fa-location-dot", params: { distance: "5" } },
  { id: "rated", label: "Reputación 4+", icon: "fa-star", params: { rating: "4" } },
  { id: "closest", label: "Más cercanos primero", icon: "fa-arrow-down-short-wide", params: { sort: "distance" } },
  { id: "favorites", label: "Mis favoritos", icon: "fa-heart", params: { category: "favorites" } },
]);

// URL param name -> filter key.
const PARAM_KEYS = Object.freeze({
  q: "query",
  category: "category",
  exclude: "exclude",
  district: "userLocation",
  rating: "minRating",
  distance: "maxDistance",
  sort: "sort",
});

function clampNumber(raw, [min, max], fallback, step = 0.5) {
  const value = Number(raw);
  if (raw === null || raw.trim() === "" || !Number.isFinite(value)) return fallback;
  const snapped = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

/**
 * Reads the search filters from a query string ("?q=…&rating=4").
 * Unknown params are ignored; numbers are clamped to the page's ranges.
 * @param {string} search
 * @returns {{ filters: typeof SEARCH_DEFAULTS, hasParams: boolean }}
 */
export function parseSearchParams(search) {
  const params = new URLSearchParams(search);
  const filters = { ...SEARCH_DEFAULTS };
  const hasParams = Object.keys(PARAM_KEYS).some((name) => params.has(name));

  filters.query = (params.get("q") ?? "").trim();
  filters.category = params.get("category") ?? "";
  filters.exclude = params.get("exclude") ?? "";
  filters.userLocation = params.get("district") ?? "";
  filters.minRating = clampNumber(params.get("rating"), RATING_RANGE, SEARCH_DEFAULTS.minRating);
  filters.maxDistance = clampNumber(params.get("distance"), DISTANCE_RANGE, SEARCH_DEFAULTS.maxDistance, 1);
  const sort = params.get("sort");
  filters.sort = sort && SORT_VALUES.includes(sort) ? sort : SEARCH_DEFAULTS.sort;

  return { filters, hasParams };
}

/**
 * Query params for a filter state, skipping values equal to the defaults.
 * @param {Partial<typeof SEARCH_DEFAULTS>} filters
 */
export function filtersToParams(filters) {
  const params = new URLSearchParams();
  for (const [name, key] of Object.entries(PARAM_KEYS)) {
    const value = filters[key];
    if (value === undefined || value === null || value === "") continue;
    if (value === SEARCH_DEFAULTS[key]) continue;
    params.set(name, String(value));
  }
  return params;
}

/**
 * Search page URL for a home search: the trimmed query plus the params of
 * every selected chip (unknown chip ids are ignored).
 * @param {string} base
 * @param {string} query
 * @param {string[]} chipIds
 */
export function buildSearchUrl(base, query, chipIds) {
  const params = new URLSearchParams();
  const q = (query ?? "").trim();
  if (q) params.set("q", q);
  for (const id of chipIds) {
    const chip = HOME_FILTER_CHIPS.find((c) => c.id === id);
    if (!chip) continue;
    for (const [name, value] of Object.entries(chip.params)) params.set(name, value);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Spanish-only translator: fills `{name}` placeholders in the fallback. */
const spanish = (_key, fallback, vars = {}) =>
  fallback.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));

/**
 * "6 resultados para “bici”": the result count line of the search summary.
 * @param {number} count
 * @param {string} query
 * @param {(key: string, fallback: string, vars?: object) => string} [tr]
 *   translator, e.g. tr() from ./i18n.js (defaults to Spanish)
 */
export function resultsSummary(count, query, tr = spanish) {
  const summary =
    count === 1
      ? tr("search_summary_one", "{count} resultado", { count })
      : tr("search_summary_other", "{count} resultados", { count });
  const q = (query ?? "").trim();
  return q ? tr("search_summary_query", "{summary} para “{query}”", { summary, query: q }) : summary;
}
