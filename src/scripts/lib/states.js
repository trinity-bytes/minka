// Shared empty / error / loading state renderers (T11).
//
// Pure string builders used both by page scripts (innerHTML for
// client-rendered lists) and by the Astro wrappers in src/components/ui
// (EmptyState, ErrorState, Skeleton render these strings with set:html), so
// server and client markup can never drift. Styles: src/styles/states.css.
//
// Every interpolated string goes through escapeHtml; icons must be a Font
// Awesome class name (`fa-…`) or they fall back to the default glyph.
import { escapeHtml } from "./html.js";

const VARIANTS = new Set(["panel", "compact"]);
const ACTION_VARIANTS = new Set(["primary", "secondary", "ghost", "outline", "ink"]);
const ICON_PATTERN = /^fa-[a-z0-9-]+$/;
const DATA_KEY_PATTERN = /^[a-z][a-z0-9-]*$/;
const SKELETON_VARIANTS = new Set(["card", "row", "tile"]);
const SKELETON_MAX = 12;

function iconClass(icon, fallback) {
  return typeof icon === "string" && ICON_PATTERN.test(icon) ? icon : fallback;
}

function headingTag(level) {
  return [2, 3, 4].includes(level) ? `h${level}` : "h2";
}

/**
 * One state action: a link when `href` is given, otherwise a button.
 * @param {{label: string, href?: string, id?: string, variant?: string,
 *   icon?: string, data?: Record<string, string>}} action
 */
export function renderStateAction(action) {
  const variant = ACTION_VARIANTS.has(action.variant) ? action.variant : "secondary";
  const attrs = [`class="btn btn-${variant}"`];
  const isLink = typeof action.href === "string";
  if (isLink) attrs.push(`href="${escapeHtml(action.href)}"`);
  else attrs.push('type="button"');
  if (action.id) attrs.push(`id="${escapeHtml(action.id)}"`);
  for (const [key, value] of Object.entries(action.data || {})) {
    if (DATA_KEY_PATTERN.test(key)) attrs.push(`data-${key}="${escapeHtml(value)}"`);
  }
  const icon =
    action.icon && ICON_PATTERN.test(action.icon)
      ? `<i class="fa-solid ${action.icon}" aria-hidden="true"></i>`
      : "";
  const tag = isLink ? "a" : "button";
  return `<${tag} ${attrs.join(" ")}>${icon}${escapeHtml(action.label)}</${tag}>`;
}

function renderState(kind, options, defaults) {
  const variant = VARIANTS.has(options.variant) ? options.variant : "panel";
  const icon = iconClass(options.icon, defaults.icon);
  const tag = headingTag(options.headingLevel);
  const role = defaults.role ? ` role="${defaults.role}"` : "";
  const actions = (options.actions || []).filter((a) => a && a.label);
  return [
    `<div class="state state--${kind} state--${variant}"${role}>`,
    `<span class="state__icon" aria-hidden="true"><i class="fa-solid ${icon}"></i></span>`,
    `<${tag} class="state__title">${escapeHtml(options.title)}</${tag}>`,
    options.text ? `<p class="state__text">${escapeHtml(options.text)}</p>` : "",
    actions.length
      ? `<div class="state__actions">${actions.map(renderStateAction).join("")}</div>`
      : "",
    "</div>",
  ].join("");
}

/**
 * Empty state: "nothing yet" (first use) or "no results" (filters). Use
 * `variant: "compact"` inside an existing card or list pane (no surface of
 * its own), the default "panel" when it stands alone on the page background.
 * @param {{title: string, text?: string, icon?: string, variant?: string,
 *   headingLevel?: 2|3|4, actions?: object[]}} options
 */
export function renderEmptyState(options) {
  return renderState("empty", options, { icon: "fa-inbox" });
}

/**
 * Error state with an optional retry action. `alert` (default true) adds
 * role="alert" for states injected after load; pass false when the state
 * is part of the initial markup.
 * @param {{title: string, text?: string, icon?: string, variant?: string,
 *   headingLevel?: 2|3|4, retry?: object, actions?: object[], alert?: boolean}} options
 */
export function renderErrorState(options) {
  const actions = [...(options.retry ? [options.retry] : []), ...(options.actions || [])];
  return renderState(
    "error",
    { ...options, actions },
    { icon: "fa-triangle-exclamation", role: options.alert === false ? "" : "alert" }
  );
}

const SKELETON_BODIES = {
  card:
    '<span class="skeleton__block skeleton__block--media"></span>' +
    '<span class="skeleton__body">' +
    '<span class="skeleton__block skeleton__block--line"></span>' +
    '<span class="skeleton__block skeleton__block--line skeleton__block--short"></span>' +
    "</span>",
  row:
    '<span class="skeleton__block skeleton__block--circle"></span>' +
    '<span class="skeleton__body">' +
    '<span class="skeleton__block skeleton__block--line"></span>' +
    '<span class="skeleton__block skeleton__block--line skeleton__block--short"></span>' +
    "</span>",
  tile: '<span class="skeleton__block skeleton__block--media"></span>',
};

/**
 * Placeholder blocks for content that is still loading. Insert the result
 * into the loading region (which should carry aria-busy="true" until the
 * real content replaces it). `tag: "li"` keeps list markup valid.
 * @param {{variant?: "card"|"row"|"tile", count?: number, label?: string,
 *   tag?: "div"|"li"}} [options]
 */
export function renderSkeleton(options = {}) {
  const variant = SKELETON_VARIANTS.has(options.variant) ? options.variant : "card";
  const count = Math.min(SKELETON_MAX, Math.max(1, Math.floor(Number(options.count) || 1)));
  const tag = options.tag === "li" ? "li" : "div";
  const label = options.label === undefined ? "Cargando…" : options.label;
  const status = label
    ? `<${tag} class="sr-only skeleton-status" role="status">${escapeHtml(label)}</${tag}>`
    : "";
  const block = `<${tag} class="skeleton skeleton--${variant}" aria-hidden="true">${SKELETON_BODIES[variant]}</${tag}>`;
  return status + block.repeat(count);
}
