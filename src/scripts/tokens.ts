/**
 * Read design tokens (src/styles/tokens.css) at runtime for APIs that cannot
 * take CSS custom properties directly, such as <canvas> and Chart.js.
 */

/** Resolved value of a custom property on :root, e.g. token("--color-ink"). */
export function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * `color` (a #rgb / #rrggbb token value) with the given alpha, as rgba().
 * Non-hex values are returned unchanged.
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.replace(/^#/, "");
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return color;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
