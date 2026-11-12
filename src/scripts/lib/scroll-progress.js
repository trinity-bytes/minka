/** Return the visible document's scroll progress as a value between 0 and 1. */
export function scrollProgress(scrollY, scrollHeight, viewportHeight) {
  const range = scrollHeight - viewportHeight;
  return range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0;
}
