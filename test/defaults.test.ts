import { describe, expect, it } from "vitest";
import {
  buildAriaLabel,
  mergeConfig,
  normalizeBmcUrl,
  resolveConfig,
  resolvePositionMode,
  resolveUrl,
} from "../src/defaults.js";

describe("resolvePositionMode", () => {
  it("returns 'flow' when an anchor is set", () => {
    expect(resolvePositionMode("#sidebar")).toBe("flow");
    expect(resolvePositionMode(document.createElement("div"))).toBe("flow");
  });

  it("returns 'fixed' when no anchor is provided", () => {
    expect(resolvePositionMode(null)).toBe("fixed");
  });
});

describe("normalizeBmcUrl", () => {
  it("builds URL from username", () => {
    expect(normalizeBmcUrl("wordplume")).toBe("https://buymeacoffee.com/wordplume");
  });

  it("strips @ prefix from username", () => {
    expect(normalizeBmcUrl("@wordplume")).toBe("https://buymeacoffee.com/wordplume");
  });

  it("preserves full URL", () => {
    expect(normalizeBmcUrl("https://buymeacoffee.com/foo/")).toBe(
      "https://buymeacoffee.com/foo",
    );
  });

  it("throws on empty input", () => {
    expect(() => normalizeBmcUrl("")).toThrow();
  });
});

describe("resolveUrl", () => {
  it("prefers url over username", () => {
    expect(
      resolveUrl({ username: "a", url: "https://buymeacoffee.com/b" }),
    ).toBe("https://buymeacoffee.com/b");
  });
});

describe("resolveConfig", () => {
  it("applies defaults", () => {
    const config = resolveConfig({ username: "test" });
    expect(config.label).toBe("Buy me a coffee");
    expect(config.size).toBe(40);
    expect(config.mobileSize).toBe(56);
    expect(config.zIndex).toBe(44);
    expect(config.theme.yellow).toBe("#ffdd00");
    expect(config.scroll.fillDelay).toBe(0.12);
  });

  it("merges theme overrides", () => {
    const config = resolveConfig({
      username: "test",
      theme: { yellow: "#ff0000" },
    });
    expect(config.theme.yellow).toBe("#ff0000");
    expect(config.theme.ink).toBe("#0d0c22");
  });

  it("defaults to fixed viewport mode with no anchor", () => {
    const config = resolveConfig({ username: "test" });
    expect(config.anchor).toBeNull();
    expect(config.position).toBe("bottom-right");
    expect(config.positionMode).toBe("fixed");
    expect(config.positionPreset).toBe("bottom-right");
    expect(config.mount).toBe(document.body);
  });

  it("uses flow mode when an anchor is provided", () => {
    const anchor = document.createElement("section");
    const config = resolveConfig({ username: "test", anchor });
    expect(config.anchor).toBe(anchor);
    expect(config.mount).toBe(anchor);
    expect(config.positionMode).toBe("flow");
  });

  it("accepts a selector as anchor", () => {
    const config = resolveConfig({ username: "test", anchor: "#hero" });
    expect(config.anchor).toBe("#hero");
    expect(config.mount).toBe("#hero");
    expect(config.positionMode).toBe("flow");
  });

  it("retains the position preset even when an anchor is set (ignored at apply time)", () => {
    const config = resolveConfig({
      username: "test",
      anchor: "#sidebar",
      position: "top-left",
    });
    expect(config.position).toBe("top-left");
    expect(config.positionPreset).toBe("top-left");
  });

  it("defaults tooltipPosition to auto with left side for right-aligned CTA", () => {
    const config = resolveConfig({ username: "test" });
    expect(config.tooltipPosition).toBe("auto");
    expect(config.tooltipSide).toBe("left");
  });

  it("resolves explicit tooltipPosition", () => {
    const config = resolveConfig({
      username: "test",
      tooltipPosition: "top",
    });
    expect(config.tooltipPosition).toBe("top");
    expect(config.tooltipSide).toBe("top");
  });

  it("auto tooltip flips to right for left-aligned CTA", () => {
    const config = resolveConfig({
      username: "test",
      position: "bottom-left",
    });
    expect(config.tooltipSide).toBe("right");
  });

  it("auto tooltip defaults to right in flow mode", () => {
    const config = resolveConfig({
      username: "test",
      anchor: "#sidebar",
    });
    expect(config.positionMode).toBe("flow");
    expect(config.tooltipSide).toBe("right");
  });

  it("accepts custom offset positions in fixed mode", () => {
    const config = resolveConfig({
      username: "test",
      position: { bottom: 16, right: 16 },
    });
    expect(config.positionMode).toBe("fixed");
    expect(config.position).toEqual({ bottom: 16, right: 16 });
    expect(config.positionPreset).toBe("bottom-right");
  });
});

describe("mergeConfig", () => {
  it("setting anchor switches mode to flow and updates mount", () => {
    const initial = resolveConfig({ username: "test" });
    const next = mergeConfig(initial, { anchor: "#sidebar" });
    expect(next.anchor).toBe("#sidebar");
    expect(next.mount).toBe("#sidebar");
    expect(next.positionMode).toBe("flow");
  });

  it("clearing anchor (null) returns to fixed viewport mode", () => {
    const initial = resolveConfig({ username: "test", anchor: "#sidebar" });
    const next = mergeConfig(initial, { anchor: null });
    expect(next.anchor).toBeNull();
    expect(next.mount).toBe(document.body);
    expect(next.positionMode).toBe("fixed");
  });

  it("preserves anchor when only updating label", () => {
    const initial = resolveConfig({ username: "test", anchor: "#sidebar" });
    const next = mergeConfig(initial, { label: "Tip me" });
    expect(next.anchor).toBe("#sidebar");
    expect(next.label).toBe("Tip me");
  });

  it("updates tooltipPosition via mergeConfig", () => {
    const initial = resolveConfig({ username: "test" });
    const next = mergeConfig(initial, { tooltipPosition: "bottom" });
    expect(next.tooltipPosition).toBe("bottom");
    expect(next.tooltipSide).toBe("bottom");
  });
});

describe("buildAriaLabel", () => {
  it("includes emoji and opens-in-new-tab suffix", () => {
    expect(buildAriaLabel("Buy me a coffee", "☕")).toBe(
      "☕ Buy me a coffee (opens in new tab)",
    );
  });

  it("uses explicit ariaLabel when provided", () => {
    expect(buildAriaLabel("Buy me a coffee", "☕", "Custom label")).toBe(
      "Custom label",
    );
  });
});
