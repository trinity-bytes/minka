/**
 * Base-aware URL helpers. The site is deployed under `base` (/minka), so every
 * internal link and public asset must be prefixed with BASE_URL. Hash-only
 * (`#id`) and absolute (`https:`, `mailto:`) URLs are returned unchanged.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Prefix a site-relative path (e.g. `pages/auth.html`) with the base. */
export function url(path = ""): string {
  if (EXTERNAL.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `${BASE}/${clean}`;
}

/** Public asset URL, e.g. `asset("images/minka-logo.png")`. */
export function asset(path: string): string {
  return url(`assets/${path.replace(/^\/+/, "")}`);
}

/** True when `href` (built with `url()`) points at the current page. */
export function isCurrent(href: string, pathname: string): boolean {
  // Astro may report `/minka/pages/home` or `/minka/pages/home.html`
  // depending on build.format and dev vs build; compare without both.
  const normalize = (p: string) =>
    p.replace(/\.html$/, "").replace(/\/index$|\/$/, "") || "/";
  return normalize(href.split("#")[0]) === normalize(pathname);
}
