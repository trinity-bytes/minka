/**
 * Client wiring for the app shell (AppSidebar, AppHeader, AppTabBar):
 * auth vs guest affordances, the signed-in user block (name + initials
 * avatar), logout, and the phone account menu. Session reads and logout
 * reuse src/lib/session.ts unchanged (same behavior as the old header).
 */
import { clearSession, getSession, isAuthenticated } from "../lib/session";
import { url } from "../lib/url";
import { avatarTone, initials, AVATAR_TONES } from "./lib/avatar.js";
import { createMenu } from "./menu-disclosure";

const SHELL = "[data-app-shell]";

function toggleAuth(authed: boolean): void {
  document.querySelectorAll(`${SHELL} [data-show="auth"]`).forEach((el) => el.classList.toggle("is-hidden", !authed));
  document.querySelectorAll(`${SHELL} [data-show="guest"]`).forEach((el) => el.classList.toggle("is-hidden", authed));
}

function fillUser(): void {
  const session = getSession();
  const name = typeof session?.name === "string" && session.name.trim() ? session.name.trim() : "";
  if (!name) return;
  const meta = [session?.location, session?.email].find((v): v is string => typeof v === "string" && !!v.trim());

  document.querySelectorAll<HTMLElement>("[data-user-name]").forEach((el) => (el.textContent = name));
  document.querySelectorAll<HTMLElement>("[data-user-meta]").forEach((el) => (el.textContent = meta ?? ""));
  document.querySelectorAll<HTMLElement>("[data-user-avatar]").forEach((el) => {
    el.textContent = initials(name);
    AVATAR_TONES.forEach((tone) => el.classList.remove(`avatar--${tone}`));
    el.classList.add(`avatar--${avatarTone(name)}`);
  });
}

function wireLogout(): void {
  document.addEventListener("click", (e) => {
    const target = e.target as Element | null;
    if (!target?.closest(`${SHELL} [data-action="logout"]`)) return;
    e.preventDefault();
    clearSession();
    location.href = url("pages/auth.html");
  });
}

function wireAccountMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-account-toggle]");
  const panel = document.querySelector<HTMLElement>("[data-account-menu]");
  if (!toggle || !panel) return;

  const menu = createMenu({
    toggle,
    panel,
    onChange: (open) => {
      panel.hidden = !open;
    },
  });

  document.addEventListener("click", (e) => {
    if (!menu.isOpen()) return;
    const target = e.target as Node | null;
    if (target && (panel.contains(target) || toggle.contains(target))) return;
    menu.setOpen(false);
  });

  // The account menu only exists on phones: reset it when leaving that layout.
  window.matchMedia("(min-width: 769px)").addEventListener("change", (e) => {
    if (e.matches && menu.isOpen()) menu.setOpen(false);
  });
}

if (document.querySelector(SHELL)) {
  const authed = isAuthenticated();
  toggleAuth(authed);
  if (authed) fillUser();
  wireLogout();
  wireAccountMenu();
}
