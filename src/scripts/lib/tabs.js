/**
 * Keyboard model of a horizontal tablist (WAI-ARIA APG tabs pattern):
 * Left/Right move to the previous/next tab and wrap, Home/End jump to the
 * ends. Right-to-left layouts mirror the arrows.
 *
 * @param {number} current index of the focused tab
 * @param {string} key KeyboardEvent.key
 * @param {number} count number of tabs
 * @param {{ rtl?: boolean }} [options]
 * @returns {number} index to focus, or -1 when the key does not move focus
 */
export function nextTabIndex(current, key, count, { rtl = false } = {}) {
  if (count <= 0) return -1;
  const forward = rtl ? "ArrowLeft" : "ArrowRight";
  const backward = rtl ? "ArrowRight" : "ArrowLeft";
  switch (key) {
    case forward:
      return (current + 1) % count;
    case backward:
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return -1;
  }
}
