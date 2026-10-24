/**
 * Pure pointer math for the hero parallax (Hero.astro) and the magnetic
 * store badge (StoreBadge.astro).
 * Plain JS with JSDoc so `node --test` can import it without a TS loader.
 */

/** @typedef {{ left: number, top: number, width: number, height: number }} Box */

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Pointer position relative to the box, -1 at the left/top edge, 0 at the
 * center and 1 at the right/bottom edge; pointers outside are clamped.
 * @param {Box} box
 * @param {number} x
 * @param {number} y
 * @returns {{ x: number, y: number }}
 */
export function normalizedOffset(box, x, y) {
  if (!box.width || !box.height) return { x: 0, y: 0 };
  return {
    x: clamp(((x - box.left) / box.width) * 2 - 1, -1, 1),
    y: clamp(((y - box.top) / box.height) * 2 - 1, -1, 1),
  };
}

/**
 * Offset in px that pulls an element toward the pointer: the distance from
 * the box center times `strength`, capped at `max` on each axis.
 * @param {Box} box
 * @param {number} x
 * @param {number} y
 * @param {number} strength
 * @param {number} max
 * @returns {{ x: number, y: number }}
 */
export function magneticPull(box, x, y, strength, max) {
  return {
    x: clamp((x - (box.left + box.width / 2)) * strength, -max, max),
    y: clamp((y - (box.top + box.height / 2)) * strength, -max, max),
  };
}

/**
 * One easing step: moves `factor` of the remaining distance to `target`.
 * @param {number} current
 * @param {number} target
 * @param {number} factor
 */
export const approach = (current, target, factor) => current + (target - current) * factor;
