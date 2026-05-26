import { afterEach, describe, expect, it, vi } from "vitest";
import { detectDark } from "../src/apply-config.js";
import { resolveConfig } from "../src/defaults.js";

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

function baseConfig(darkMode: "auto" | "class" | "media" | "off") {
  return resolveConfig({ username: "test", darkMode });
}

describe("detectDark", () => {
  afterEach(() => {
    document.documentElement.dataset.theme = "";
    document.documentElement.classList.remove("dark");
  });

  it("returns false when darkMode is off", () => {
    expect(detectDark(baseConfig("off"))).toBe(false);
  });

  it("returns false when darkMode is auto (CSS handles theme)", () => {
    expect(detectDark(baseConfig("auto"))).toBe(false);
  });

  it("follows prefers-color-scheme when darkMode is media", () => {
    const matches = window.matchMedia("(prefers-color-scheme: dark)").matches;
    expect(detectDark(baseConfig("media"))).toBe(matches);
  });

  it("detects data-theme=dark when darkMode is class", () => {
    document.documentElement.dataset.theme = "dark";
    expect(detectDark(baseConfig("class"))).toBe(true);
  });

  it("detects html.dark class when darkMode is class", () => {
    document.documentElement.classList.add("dark");
    expect(detectDark(baseConfig("class"))).toBe(true);
  });

  it("returns false for class mode when neither signal is set", () => {
    expect(detectDark(baseConfig("class"))).toBe(false);
  });
});
