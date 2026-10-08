/**
 * Accessible disclosure menu (mobile nav): keeps `aria-expanded` in sync,
 * moves focus into the panel on open, traps Tab between the toggle and the
 * panel while open, closes on Escape and returns focus to the toggle.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

interface MenuOptions {
  toggle: HTMLElement;
  panel: HTMLElement;
  /** Extra side effects (classes, overlay, labels) for each state change. */
  onChange?: (open: boolean) => void;
}

export interface MenuController {
  setOpen: (open: boolean, options?: { restoreFocus?: boolean }) => void;
  isOpen: () => boolean;
}

const isVisible = (el: HTMLElement) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";

export function createMenu({ toggle, panel, onChange }: MenuOptions): MenuController {
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const focusables = () =>
    [toggle, ...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isVisible);

  const setOpen = (open: boolean, { restoreFocus = false } = {}) => {
    toggle.setAttribute("aria-expanded", String(open));
    onChange?.(open);
    if (open) {
      // Wait a frame so the panel is displayed before focusing into it.
      requestAnimationFrame(() => focusables().find((el) => el !== toggle)?.focus());
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => setOpen(!isOpen(), { restoreFocus: true }));

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false, { restoreFocus: true });
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const inside = active ? items.includes(active) : false;
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  });

  return { setOpen, isOpen };
}
