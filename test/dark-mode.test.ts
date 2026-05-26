import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCoffeeCta } from "../src/create-coffee-cta.js";
import type { CoffeeCtaInstance } from "../src/types.js";

function createMatchMediaMock() {
  return vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function clearBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function mediaQueryInstances(
  matchMediaMock: ReturnType<typeof createMatchMediaMock>,
  query: string,
) {
  return matchMediaMock.mock.results
    .map((result) => result.value)
    .filter((mql) => mql.media === query);
}

if (typeof globalThis.SVGPathElement === "undefined") {
  (globalThis as { SVGPathElement: unknown }).SVGPathElement =
    window.SVGPathElement ?? class {};
}

describe("dark mode listeners", () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;
  let cta: CoffeeCtaInstance | null = null;

  beforeEach(() => {
    clearBody();
    matchMediaMock = createMatchMediaMock();
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    cta?.destroy();
    cta = null;
    clearBody();
  });

  it("does not bind media listeners in auto mode", () => {
    cta = createCoffeeCta({ username: "test", darkMode: "auto" });
    const boundQuery = mediaQueryInstances(
      matchMediaMock,
      "(prefers-color-scheme: dark)",
    ).find((mql) => mql.addEventListener.mock.calls.length > 0);

    expect(boundQuery).toBeUndefined();
    expect(cta.element.dataset.bmcDarkMode).toBe("auto");
    expect(cta.element.dataset.bmcTheme).toBeUndefined();
  });

  it("rebinds media listeners when darkMode changes via updateConfig", () => {
    cta = createCoffeeCta({ username: "test", darkMode: "media" });
    const boundQuery = mediaQueryInstances(
      matchMediaMock,
      "(prefers-color-scheme: dark)",
    ).find((mql) => mql.addEventListener.mock.calls.length > 0);

    expect(boundQuery?.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    cta.updateConfig({ darkMode: "off" });
    expect(boundQuery?.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    cta.updateConfig({ darkMode: "media" });
    const reboundQuery = mediaQueryInstances(
      matchMediaMock,
      "(prefers-color-scheme: dark)",
    ).find((mql) => mql.addEventListener.mock.calls.length > 0);

    expect(reboundQuery?.addEventListener.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("applies dark theme when html has class dark in class mode", () => {
    document.documentElement.classList.add("dark");

    cta = createCoffeeCta({ username: "test", darkMode: "class" });
    expect(cta.element.dataset.bmcTheme).toBe("dark");

    document.documentElement.classList.remove("dark");
    cta.updateConfig({ label: "Support me" });
    expect(cta.element.dataset.bmcTheme).toBe("light");
  });
});
