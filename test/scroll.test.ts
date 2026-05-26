import { describe, expect, it } from "vitest";
import { resolveTooltipSide, shouldFlipTooltip } from "../src/defaults.js";
import { computeScrollState, getScrollMetrics, isCtaVisible } from "../src/scroll.js";

describe("computeScrollState", () => {
  const opts = { fillDelay: 0.12, bottomThreshold: 4 };

  it("returns zero progress and fill at top", () => {
    const state = computeScrollState(0, 2000, 800, opts);
    expect(state.progress).toBe(0);
    expect(state.fill).toBe(0);
    expect(state.atBottom).toBe(false);
  });

  it("returns partial progress at 25% scroll with fill lagging", () => {
    const max = 1200;
    const state = computeScrollState(max * 0.25, 2000, 800, opts);
    expect(state.progress).toBeCloseTo(0.25, 2);
    expect(state.fill).toBeGreaterThan(0);
    expect(state.fill).toBeLessThan(1);
  });

  it("starts fill after fillDelay", () => {
    const max = 1200;
    const state = computeScrollState(max * 0.5, 2000, 800, opts);
    expect(state.progress).toBeCloseTo(0.5, 2);
    expect(state.fill).toBeGreaterThan(0);
  });

  it("returns full progress and fill at bottom", () => {
    const max = 1200;
    const state = computeScrollState(max, 2000, 800, opts);
    expect(state.progress).toBe(1);
    expect(state.fill).toBe(1);
    expect(state.atBottom).toBe(true);
  });

  it("detects bottom within threshold", () => {
    const max = 1200;
    const state = computeScrollState(max - 2, 2000, 800, opts);
    expect(state.atBottom).toBe(true);
  });

  it("handles short pages", () => {
    const state = computeScrollState(0, 800, 800, opts);
    expect(state.progress).toBe(0);
    expect(state.atBottom).toBe(true);
  });

  describe("reverse mode", () => {
    const reverseOpts = { ...opts, reverse: true };

    it("returns full progress and fill at top", () => {
      const state = computeScrollState(0, 2000, 800, reverseOpts);
      expect(state.progress).toBe(1);
      expect(state.fill).toBe(1);
      expect(state.atBottom).toBe(true); // persistent state lives at the top
    });

    it("returns zero progress and fill at bottom", () => {
      const max = 1200;
      const state = computeScrollState(max, 2000, 800, reverseOpts);
      expect(state.progress).toBe(0);
      expect(state.fill).toBe(0);
      expect(state.atBottom).toBe(false);
    });

    it("inverts progress mid-scroll", () => {
      const max = 1200;
      const state = computeScrollState(max * 0.25, 2000, 800, reverseOpts);
      expect(state.progress).toBeCloseTo(0.75, 2);
    });

    it("detects top within threshold", () => {
      const state = computeScrollState(2, 2000, 800, reverseOpts);
      expect(state.atBottom).toBe(true);
    });
  });
});

describe("getScrollMetrics", () => {
  it("reads element scroll metrics", () => {
    const el = {
      scrollTop: 100,
      scrollHeight: 2000,
      clientHeight: 800,
    } as Element;

    expect(getScrollMetrics(el)).toEqual({
      scrollY: 100,
      scrollHeight: 2000,
      clientHeight: 800,
    });
  });
});

describe("isCtaVisible", () => {
  const opts = { fillDelay: 0.12, bottomThreshold: 4 };

  it("is hidden at the top in normal mode", () => {
    const state = computeScrollState(0, 2000, 800, opts);
    expect(isCtaVisible(state)).toBe(false);
  });

  it("is visible once scroll progress starts", () => {
    const state = computeScrollState(100, 2000, 800, opts);
    expect(isCtaVisible(state)).toBe(true);
  });

  it("is visible at the bottom in normal mode", () => {
    const state = computeScrollState(1200, 2000, 800, opts);
    expect(isCtaVisible(state)).toBe(true);
  });

  it("is visible at the top in reverse mode", () => {
    const state = computeScrollState(0, 2000, 800, { ...opts, reverse: true });
    expect(isCtaVisible(state)).toBe(true);
  });

  it("is hidden at the bottom in reverse mode", () => {
    const state = computeScrollState(1200, 2000, 800, { ...opts, reverse: true });
    expect(isCtaVisible(state)).toBe(false);
  });

  it("is visible on short pages at rest", () => {
    const state = computeScrollState(0, 800, 800, opts);
    expect(state.atBottom).toBe(true);
    expect(isCtaVisible(state)).toBe(true);
  });
});

describe("resolveTooltipSide", () => {
  it("returns explicit sides unchanged", () => {
    expect(resolveTooltipSide("top", "bottom-right", "fixed")).toBe("top");
    expect(resolveTooltipSide("bottom", "bottom-left", "flow")).toBe("bottom");
    expect(resolveTooltipSide("left", "bottom-left", "fixed")).toBe("left");
    expect(resolveTooltipSide("right", "bottom-right", "flow")).toBe("right");
  });

  it("auto picks left or right from CTA position in fixed mode", () => {
    expect(resolveTooltipSide("auto", "bottom-right", "fixed")).toBe("left");
    expect(resolveTooltipSide("auto", "bottom-left", "fixed")).toBe("right");
    expect(resolveTooltipSide("auto", { left: 28, bottom: 28 }, "fixed")).toBe(
      "right",
    );
  });

  it("auto picks right in flow mode", () => {
    expect(resolveTooltipSide("auto", "bottom-right", "flow")).toBe("right");
    expect(resolveTooltipSide("auto", "bottom-left", "flow")).toBe("right");
  });
});

describe("shouldFlipTooltip", () => {
  it("flips for left presets", () => {
    expect(shouldFlipTooltip("bottom-left")).toBe(true);
    expect(shouldFlipTooltip("top-left")).toBe(true);
  });

  it("does not flip for right presets", () => {
    expect(shouldFlipTooltip("bottom-right")).toBe(false);
    expect(shouldFlipTooltip("top-right")).toBe(false);
  });

  it("flips for custom left-only offsets", () => {
    expect(shouldFlipTooltip({ left: 28, bottom: 28 })).toBe(true);
    expect(shouldFlipTooltip({ right: 28, bottom: 28 })).toBe(false);
  });
});
