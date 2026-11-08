/**
 * Base-aware URL helpers. The site is served at the domain root today, but
 * every internal link and public asset still goes through BASE_URL so a
 * future `base` keeps working. Hash-only
 * (`#id`) and absolute (`https:`, `mailto:`) URLs are returned unchanged.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Prefix a site-relative path (e.g. `favicon.svg`) with the base. */
export function url(path = ""): string {
  if (EXTERNAL.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `${BASE}/${clean}`;
}

/** Public asset URL, e.g. `asset("images/avatars/avatar-user.svg")`. */
export function asset(path: string): string {
  return url(`assets/${path.replace(/^\/+/, "")}`);
}
