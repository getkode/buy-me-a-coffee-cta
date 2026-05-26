import type { CoffeeCtaConfig, CoffeeCtaInstance, ResolvedCoffeeCtaConfig } from "./types.js";
import { mergeConfig, resolveConfig } from "./defaults.js";
import { applyConfig, detectDark } from "./apply-config.js";
import { createElement, mountElement, unmountElement } from "./dom.js";
import { applyReducedMotion, bindScroll } from "./scroll.js";
import { bindTouch } from "./touch.js";

let activeInstance: CoffeeCtaInstance | null = null;

function warnDuplicateInstance(): void {
  console.warn(
    "buy-me-a-coffee-cta: only one CTA per page is supported. Destroying previous instance.",
  );
}

function placementChanged(
  prev: ResolvedCoffeeCtaConfig,
  next: ResolvedCoffeeCtaConfig,
): boolean {
  return (
    prev.mount !== next.mount ||
    prev.positionMode !== next.positionMode ||
    prev.anchor !== next.anchor
  );
}

export function createCoffeeCta(config: CoffeeCtaConfig): CoffeeCtaInstance {
  if (activeInstance) {
    warnDuplicateInstance();
    activeInstance.destroy();
  }

  let resolved = resolveConfig(config);
  const element = createElement(resolved);

  if (resolved.className) {
    element.classList.add(...resolved.className.split(/\s+/).filter(Boolean));
  }

  mountElement(element, resolved.mount);

  const reducedMotion = applyReducedMotion(element);
  let scrollController: ReturnType<typeof bindScroll> | null = null;
  let touchController: ReturnType<typeof bindTouch> | null = null;
  let darkModeQuery: MediaQueryList | null = null;
  let themeObserver: MutationObserver | null = null;

  function onDarkModeChange() {
    applyConfig(element, resolved, detectDark(resolved));
  }

  function bindDarkModeListeners() {
    if (resolved.darkMode === "media") {
      darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      darkModeQuery.addEventListener("change", onDarkModeChange);
    }

    if (resolved.darkMode === "class") {
      themeObserver = new MutationObserver(onDarkModeChange);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });
    }
  }

  function unbindDarkModeListeners() {
    darkModeQuery?.removeEventListener("change", onDarkModeChange);
    themeObserver?.disconnect();
    darkModeQuery = null;
    themeObserver = null;
  }

  if (!reducedMotion) {
    initScroll();
    touchController = bindTouch(element, resolved.scroll.touchHideMs);
  }

  function initScroll() {
    scrollController?.destroy();
    scrollController = bindScroll(element, {
      fillDelay: resolved.scroll.fillDelay,
      bottomThreshold: resolved.scroll.bottomThreshold,
      target: resolved.scroll.target,
      reverse: resolved.scroll.reverse,
    });
  }

  function remount() {
    unmountElement(element);
    mountElement(element, resolved.mount);
  }

  bindDarkModeListeners();

  const instance: CoffeeCtaInstance = {
    element,

    updateConfig(partial: CoffeeCtaConfig) {
      const previousClassName = resolved.className;
      const previous = resolved;
      resolved = mergeConfig(resolved, partial);

      if (placementChanged(previous, resolved)) {
        remount();
      }

      if (partial.className !== undefined && partial.className !== previousClassName) {
        if (previousClassName) {
          for (const cls of previousClassName.split(/\s+/).filter(Boolean)) {
            element.classList.remove(cls);
          }
        }
        if (resolved.className) {
          element.classList.add(...resolved.className.split(/\s+/).filter(Boolean));
        }
      }

      if (previous.darkMode !== resolved.darkMode) {
        unbindDarkModeListeners();
        bindDarkModeListeners();
      }

      applyConfig(element, resolved, detectDark(resolved));

      if (!reducedMotion) {
        if (partial.scroll !== undefined) {
          initScroll();
        } else if (scrollController) {
          scrollController.update();
        }
      }
    },

    destroy() {
      scrollController?.destroy();
      touchController?.destroy();
      unbindDarkModeListeners();
      unmountElement(element);
      scrollController = null;
      touchController = null;
      if (activeInstance === instance) {
        activeInstance = null;
      }
    },
  };

  activeInstance = instance;
  return instance;
}

export type { CoffeeCtaConfig, CoffeeCtaInstance };
export { computeScrollState, getScrollMetrics, isCtaVisible, resolveScrollTarget } from "./scroll.js";
export { normalizeBmcUrl, resolveUrl } from "./defaults.js";
