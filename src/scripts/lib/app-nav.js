/**
 * Pure helpers for the app shell navigation (AppSidebar, AppTabBar,
 * AppHeader): which nav item is current for a given path. Plain JS so
 * `node --test` imports it.
 */

/**
 * Page slugs per nav item key. The first slug is the item's own page
 * (`aria-current="page"`); the rest are pages without their own nav item
 * that live under that section (`aria-current="true"`).
 */
export const NAV_SECTIONS = /** @type {const} */ ({
  home: ["home"],
  search: ["busqueda", "detalle"],
  publish: ["publicar"],
  community: ["comunidad", "gamification"],
  chats: ["chat"],
  notifications: ["notificaciones"],
  profile: ["perfil", "dashboard", "settings"],
});

/**
 * Last path segment without query, hash, trailing slash or `.html`
 * ("/minka/pages/home.html" -> "home").
 * @param {string} pathname
 */
export function pageSlug(pathname) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "");
  return (path.split("/").pop() ?? "").replace(/\.html$/, "");
}

/**
 * `aria-current` value for a nav item: "page" on its own page, "true" on a
 * page of its section, `undefined` otherwise.
 * @param {string} key
 * @param {string} pathname
 * @returns {"page" | "true" | undefined}
 */
export function navCurrent(key, pathname) {
  /** @type {readonly string[] | undefined} */
  const slugs = NAV_SECTIONS[/** @type {keyof typeof NAV_SECTIONS} */ (key)];
  if (!slugs) return undefined;
  const slug = pageSlug(pathname);
  if (slug === slugs[0]) return "page";
  return slugs.includes(slug) ? "true" : undefined;
}
