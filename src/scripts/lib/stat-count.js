/**
 * Pure count-up helpers for landing stats (see StatRing.astro).
 * Plain JS with JSDoc so `node --test` can import it without a TS loader.
 */

/** @param {number} t */
const clamp01 = (t) => Math.min(Math.max(t, 0), 1);

/**
 * Integer with comma thousands separators, matching the site's figures ("1,250").
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Exponential ease-out: fast start, gentle landing. Progress is clamped to [0, 1].
 * @param {number} t
 * @returns {number}
 */
export function easeOutExpo(t) {
  const p = clamp01(t);
  return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
}

/**
 * Count shown at progress `t` of the animation, never past the target.
 * @param {number} target
 * @param {number} t
 * @returns {number}
 */
export function countAt(target, t) {
  return Math.round(target * easeOutExpo(t));
}
