// Client-rendered UI copy through the legacy I18n global
// (public/assets/scripts/core/i18n.js + translations.js).
//
// Markup that exists at load uses `data-i18n` and is rewritten by I18n itself;
// strings built in JS go through tr() instead. The Spanish fallback keeps the
// UI readable when I18n is not loaded or the key is missing.

/**
 * Translate `key`, falling back to the Spanish `fallback`; `{name}` placeholders
 * are filled from `vars` (unknown placeholders are left as is).
 * @param {string} key
 * @param {string} fallback
 * @param {Record<string, string | number>} [vars]
 * @param {{t: (key: string) => string} | undefined} [i18n] defaults to window.I18n
 * @returns {string}
 */
export function tr(key, fallback, vars = {}, i18n = globalThis.I18n) {
  const raw = i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
  const text = raw && raw !== key ? raw : fallback;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}
