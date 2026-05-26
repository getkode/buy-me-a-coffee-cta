import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCoffeeCta } from "../src/create-coffee-cta.js";

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// jsdom doesn't implement SVGPathElement; provide a stub so `instanceof` checks don't throw.
if (typeof globalThis.SVGPathElement === "undefined") {
  (globalThis as { SVGPathElement: unknown }).SVGPathElement =
    window.SVGPathElement ?? class {};
}

function clearBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  document.documentElement.style.height = "";
  document.body.style.height = "";
}

function setupScrollablePage() {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: 800,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: 5000,
  });
  const spacer = document.createElement("div");
  spacer.id = "scroll-spacer";
  spacer.style.height = "5000px";
  document.body.appendChild(spacer);
}

describe("placement modes", () => {
  beforeEach(() => {
    clearBody();
    setupScrollablePage();
  });
  afterEach(clearBody);

  it("defaults to fixed positioning in body", () => {
    const cta = createCoffeeCta({ username: "test" });
    expect(cta.element.parentElement).toBe(document.body);
    expect(cta.element.dataset.bmcPositionMode).toBe("fixed");
    expect(cta.element.dataset.bmcPosition).toBe("bottom-right");
    expect(cta.element.dataset.bmcAnchor).toBeUndefined();
    expect(cta.element.dataset.bmcTooltipPosition).toBe("left");
    expect(cta.element.classList.contains("is-hidden")).toBe(true);
    cta.destroy();
  });

  it("uses flow mode when an anchor element is provided", () => {
    const anchor = document.createElement("article");
    document.body.appendChild(anchor);

    const cta = createCoffeeCta({ username: "test", anchor });

    expect(cta.element.parentElement).toBe(anchor);
    expect(cta.element.dataset.bmcPositionMode).toBe("flow");
    expect(cta.element.dataset.bmcPosition).toBeUndefined();
    expect(cta.element.dataset.bmcAnchor).toBeUndefined();
    expect(cta.element.style.top).toBe("");
    expect(cta.element.style.right).toBe("");
    expect(cta.element.style.bottom).toBe("");
    expect(cta.element.style.left).toBe("");
    expect(anchor.style.position).toBe("");
    expect(cta.element.dataset.bmcTooltipPosition).toBe("right");
    expect(cta.element.classList.contains("is-hidden")).toBe(true);

    cta.destroy();
  });

  it("updateConfig from fixed-with-offsets to flow clears offsets", () => {
    const anchor = document.createElement("aside");
    document.body.appendChild(anchor);

    const cta = createCoffeeCta({
      username: "test",
      position: { bottom: 16, right: 16 },
    });
    expect(cta.element.style.bottom).toBe("16px");

    cta.updateConfig({ anchor });
    expect(cta.element.parentElement).toBe(anchor);
    expect(cta.element.dataset.bmcPositionMode).toBe("flow");
    expect(cta.element.style.bottom).toBe("");
    expect(cta.element.style.right).toBe("");

    cta.destroy();
  });

  it("updateConfig back to fixed re-applies position offsets", () => {
    const anchor = document.createElement("aside");
    document.body.appendChild(anchor);

    const cta = createCoffeeCta({ username: "test", anchor });
    expect(cta.element.parentElement).toBe(anchor);

    cta.updateConfig({ anchor: null, position: { bottom: 8, right: 8 } });
    expect(cta.element.parentElement).toBe(document.body);
    expect(cta.element.dataset.bmcPositionMode).toBe("fixed");
    expect(cta.element.style.bottom).toBe("8px");

    cta.destroy();
  });

  it("applies explicit tooltipPosition", () => {
    const cta = createCoffeeCta({
      username: "test",
      tooltipPosition: "top",
    });
    expect(cta.element.dataset.bmcTooltipPosition).toBe("top");
    cta.destroy();
  });

  it("applies tooltip position in flow mode", () => {
    const anchor = document.createElement("article");
    document.body.appendChild(anchor);

    const cta = createCoffeeCta({
      username: "test",
      anchor,
      tooltipPosition: "right",
    });
    expect(cta.element.dataset.bmcPositionMode).toBe("flow");
    expect(cta.element.dataset.bmcTooltipPosition).toBe("right");

    cta.destroy();
  });
});
