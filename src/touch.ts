export interface TouchController {
  destroy: () => void;
}

export function bindTouch(
  element: HTMLElement,
  touchHideMs: number,
): TouchController {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let touchHideTimer = 0;

  function clearTouchHide() {
    window.clearTimeout(touchHideTimer);
  }

  function scheduleTouchHide() {
    clearTouchHide();
    touchHideTimer = window.setTimeout(() => {
      if (!element.classList.contains("is-bottom")) {
        element.classList.remove("is-active");
      }
    }, touchHideMs);
  }

  function onTouchStart() {
    if (finePointer.matches) return;
    if (element.classList.contains("is-hidden")) return;
    if (element.classList.contains("is-bottom")) return;
    clearTouchHide();
    element.classList.add("is-active");
  }

  function onTouchEnd() {
    if (finePointer.matches) return;
    if (!element.classList.contains("is-bottom")) {
      scheduleTouchHide();
    }
  }

  function onDocumentTouchStart(event: TouchEvent) {
    if (finePointer.matches) return;
    const target = event.target;
    if (target instanceof Node && !element.contains(target)) {
      clearTouchHide();
      element.classList.remove("is-active");
    }
  }

  function onPointerChange() {
    clearTouchHide();
    element.classList.remove("is-active");
  }

  function bindTouchFeedback() {
    if (finePointer.matches) return;

    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", onTouchEnd, { passive: true });
    document.addEventListener("touchstart", onDocumentTouchStart, { passive: true });
  }

  function unbindTouchFeedback() {
    element.removeEventListener("touchstart", onTouchStart);
    element.removeEventListener("touchend", onTouchEnd);
    element.removeEventListener("touchcancel", onTouchEnd);
    document.removeEventListener("touchstart", onDocumentTouchStart);
  }

  finePointer.addEventListener("change", onPointerChange);
  bindTouchFeedback();

  return {
    destroy() {
      clearTouchHide();
      unbindTouchFeedback();
      finePointer.removeEventListener("change", onPointerChange);
    },
  };
}
