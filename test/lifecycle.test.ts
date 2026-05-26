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

if (typeof globalThis.SVGPathElement === "undefined") {
  (globalThis as { SVGPathElement: unknown }).SVGPathElement =
    window.SVGPathElement ?? class {};
}

function clearBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

describe("lifecycle", () => {
  beforeEach(clearBody);
  afterEach(clearBody);

  it("destroy removes the element from the DOM", () => {
    const cta = createCoffeeCta({ username: "test" });
    expect(document.body.contains(cta.element)).toBe(true);

    cta.destroy();

    expect(document.body.contains(cta.element)).toBe(false);
  });

  it("destroy allows creating a new instance afterward", () => {
    const first = createCoffeeCta({ username: "first" });
    first.destroy();

    const second = createCoffeeCta({ username: "second" });
    expect(document.body.contains(second.element)).toBe(true);

    second.destroy();
  });

  it("creating a second instance destroys the first and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const first = createCoffeeCta({ username: "first" });
    const firstElement = first.element;

    const second = createCoffeeCta({ username: "second" });

    expect(document.body.contains(firstElement)).toBe(false);
    expect(document.body.contains(second.element)).toBe(true);
    expect(warn).toHaveBeenCalledWith(
      "buy-me-a-coffee-cta: only one CTA per page is supported. Destroying previous instance.",
    );

    second.destroy();
    warn.mockRestore();
  });
});
