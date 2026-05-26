import type { ScrollState, ScrollStateOptions } from "./types.js";
import { clamp } from "./defaults.js";

export type ScrollTarget = Element | Window;

export interface ScrollMetrics {
  scrollY: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface BindScrollOptions extends ScrollStateOptions {
  target?: Element | string | null;
}

export function resolveScrollTarget(target?: Element | string | null): ScrollTarget {
  if (!target) return window;
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) {
      throw new Error(`buy-me-a-coffee-cta: scroll target not found: ${target}`);
    }
    return el;
  }
  return target;
}

function isScrollElement(target: ScrollTarget): target is Element {
  return typeof window === "undefined" || target !== window;
}

export function getScrollMetrics(target: ScrollTarget): ScrollMetrics {
  if (isScrollElement(target)) {
    return {
      scrollY: target.scrollTop,
      scrollHeight: target.scrollHeight,
      clientHeight: target.clientHeight,
    };
  }

  const doc = document.documentElement;
  return {
    scrollY: window.scrollY,
    scrollHeight: doc.scrollHeight,
    clientHeight: window.innerHeight,
  };
}

export function computeScrollState(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
  options: ScrollStateOptions,
): ScrollState {
  const max = Math.max(1, scrollHeight - innerHeight);
  const rawProgress = clamp(scrollY / max, 0, 1);
  const fillRange = 1 - options.fillDelay;

  if (options.reverse) {
    // Cup starts full at top, empties as user scrolls down. The persistent
    // "full + tooltip" state lives at the top instead of the bottom.
    const progress = 1 - rawProgress;
    const fill = clamp((progress - options.fillDelay) / fillRange, 0, 1);
    const atBottom = scrollY <= options.bottomThreshold;
    return { progress, fill, atBottom };
  }

  const progress = rawProgress;
  const fill = clamp((progress - options.fillDelay) / fillRange, 0, 1);
  const atBottom = max - scrollY <= options.bottomThreshold;

  return { progress, fill, atBottom };
}

/** Cup is hidden at scroll rest: top (normal) or bottom (reverse). */
export function isCtaVisible(state: ScrollState): boolean {
  return state.atBottom || state.progress > 0;
}

export interface ScrollController {
  update: () => void;
  destroy: () => void;
}

export function bindScroll(
  element: HTMLElement,
  scrollConfig: BindScrollOptions,
  onBottomChange?: (atBottom: boolean) => void,
): ScrollController {
  const scrollTarget = resolveScrollTarget(scrollConfig.target);
  let ticking = false;

  function update() {
    const metrics = getScrollMetrics(scrollTarget);
    const state = computeScrollState(
      metrics.scrollY,
      metrics.scrollHeight,
      metrics.clientHeight,
      scrollConfig,
    );

    element.style.setProperty("--progress", state.progress.toFixed(4));
    element.style.setProperty("--fill", state.fill.toFixed(4));
    element.classList.toggle("is-bottom", state.atBottom);
    element.classList.toggle("is-hidden", !isCtaVisible(state));

    if (state.atBottom) {
      element.classList.remove("is-active");
    }

    onBottomChange?.(state.atBottom);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  scrollTarget.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  return {
    update,
    destroy() {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    },
  };
}

export function applyReducedMotion(element: HTMLElement): boolean {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) return false;

  element.classList.add("coffee-cta--reduced");
  element.style.setProperty("--progress", "1");
  element.style.setProperty("--fill", "1");
  element.classList.add("is-bottom");
  return true;
}
