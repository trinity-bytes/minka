/**
 * Reveal-on-scroll for `[data-reveal]` elements: adds `.is-visible` once the
 * element enters the viewport. With reduced motion or no IntersectionObserver
 * everything is shown immediately.
 *
 * Each element also receives a non-bubbling `REVEAL_EVENT` when it becomes
 * visible, so components can start JS-driven effects (e.g. StatRing's count)
 * off the same observer instead of creating their own.
 */
export const REVEAL_EVENT = "reveal:visible";

function show(el: Element): void {
  el.classList.add("is-visible");
  el.dispatchEvent(new CustomEvent(REVEAL_EVENT));
}

export function initReveal(root: ParentNode = document): void {
  const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!els.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    els.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  els.forEach((el) => observer.observe(el));
}

/**
 * Generic "observe once" helper used by hand-drawn strokes and count-ups.
 * Falls back to calling `onEnter` immediately when IntersectionObserver is
 * unavailable or `immediate` is true.
 */
export function onceVisible(
  els: Iterable<Element>,
  onEnter: (el: Element) => void,
  { threshold = 0.4, immediate = false }: { threshold?: number; immediate?: boolean } = {},
): void {
  const list = Array.from(els);
  if (!list.length) return;
  if (immediate || !("IntersectionObserver" in window)) {
    list.forEach(onEnter);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onEnter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold },
  );
  list.forEach((el) => observer.observe(el));
}
