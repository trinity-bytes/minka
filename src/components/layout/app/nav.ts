/**
 * Single source for the app shell destinations, shared by AppSidebar,
 * AppTabBar and AppHeader. Icons are Font Awesome classes (loaded by
 * AppLayout); `i18n` keys exist in the legacy translations.js.
 */
import { url } from "../../../lib/url";
import { navCurrent } from "../../../scripts/lib/app-nav.js";

export type NavKey = "home" | "search" | "publish" | "community" | "chats" | "notifications" | "profile";

export interface NavItem {
  key: NavKey;
  href: string;
  icon: string;
  label: string;
  i18n: string;
  /** Only shown to signed-in users (toggled by app-shell.ts). */
  authOnly?: boolean;
  /** Carries the unread notifications counter (core/notif-badge.js). */
  unread?: boolean;
}

const ITEMS: Record<NavKey, NavItem> = {
  home: { key: "home", href: url("pages/home.html"), icon: "fa-house", label: "Inicio", i18n: "nav_home" },
  search: {
    key: "search",
    href: url("pages/busqueda.html"),
    icon: "fa-magnifying-glass",
    label: "Buscar",
    i18n: "nav_search",
  },
  publish: { key: "publish", href: url("pages/publicar.html"), icon: "fa-plus", label: "Publicar", i18n: "nav_publish" },
  community: {
    key: "community",
    href: url("pages/comunidad.html"),
    icon: "fa-users",
    label: "Comunidad",
    i18n: "nav_community",
  },
  notifications: {
    key: "notifications",
    href: url("pages/notificaciones.html"),
    icon: "fa-bell",
    label: "Notificaciones",
    i18n: "nav_notifications",
    authOnly: true,
    unread: true,
  },
  chats: {
    key: "chats",
    href: url("pages/chat.html"),
    icon: "fa-comments",
    label: "Chats",
    i18n: "nav_chats",
    authOnly: true,
  },
  profile: {
    key: "profile",
    href: url("pages/perfil.html"),
    icon: "fa-user",
    label: "Perfil",
    i18n: "nav_profile",
    authOnly: true,
  },
};

/** Desktop sidebar order. */
export const SIDEBAR_ITEMS: NavItem[] = [
  ITEMS.home,
  ITEMS.search,
  ITEMS.publish,
  ITEMS.community,
  ITEMS.notifications,
  ITEMS.chats,
  ITEMS.profile,
];

/** Mobile bottom tab bar (user decision 2026-10-10): Publicar in the middle. */
export const TAB_ITEMS: NavItem[] = [
  ITEMS.home,
  ITEMS.search,
  ITEMS.publish,
  ITEMS.community,
  { ...ITEMS.profile, authOnly: false },
];

/** Mobile slim header shortcuts. */
export const HEADER_ITEMS: NavItem[] = [ITEMS.notifications, ITEMS.chats];

export const LOGIN_HREF = url("pages/auth.html");

/** Footer-level links, now in the sidebar fine print and the account menu. */
export const SITE_LINKS: { href?: string; label: string }[] = [
  { href: url("pages/about.html"), label: "Acerca de" },
  { href: `${url()}#impacto`, label: "Impacto" },
  { label: "Términos" },
  { label: "Privacidad" },
];

export const current = (item: NavItem, pathname: string) => navCurrent(item.key, pathname);
