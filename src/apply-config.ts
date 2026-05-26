import type { ResolvedCoffeeCtaConfig } from "./types.js";
import { isPositionPreset } from "./defaults.js";

function applyTooltipPosition(
  element: HTMLAnchorElement,
  config: ResolvedCoffeeCtaConfig,
): void {
  element.dataset.bmcTooltipPosition = config.tooltipSide;
}

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

function clearOffsets(element: HTMLElement): void {
  const sides = ["top", "right", "bottom", "left"] as const;
  for (const side of sides) {
    element.style.removeProperty(side);
  }
}

function applyCustomPosition(
  element: HTMLElement,
  position: ResolvedCoffeeCtaConfig["position"],
): void {
  clearOffsets(element);
  if (isPositionPreset(position)) return;

  if (position.top !== undefined) {
    element.style.top = toCssLength(position.top);
  }
  if (position.right !== undefined) {
    element.style.right = toCssLength(position.right);
  }
  if (position.bottom !== undefined) {
    element.style.bottom = toCssLength(position.bottom);
  }
  if (position.left !== undefined) {
    element.style.left = toCssLength(position.left);
  }
}

function applyThemeColors(
  element: HTMLElement,
  config: ResolvedCoffeeCtaConfig,
  isDark: boolean,
): void {
  element.style.setProperty("--bmc-auto-ink", config.darkTheme.ink);
  element.style.setProperty("--bmc-auto-chip-fg", config.darkTheme.chipFg);
  element.style.setProperty("--bmc-auto-yellow", config.darkTheme.yellow);
  element.style.setProperty("--bmc-auto-chip-bg", config.darkTheme.chipBg);

  if (config.darkMode === "auto") {
    element.style.setProperty("--bmc-yellow", config.theme.yellow);
    element.style.setProperty("--coffee-cream", config.theme.yellow);
    element.style.setProperty("--bmc-chip-bg", config.theme.chipBg);
    element.style.setProperty("--coffee-ink", config.theme.ink);
    element.style.setProperty("--bmc-chip-fg", config.theme.chipFg);
    delete element.dataset.bmcTheme;
    return;
  }

  if (isDark) {
    element.style.setProperty("--bmc-yellow", config.darkTheme.yellow);
    element.style.setProperty("--coffee-cream", config.darkTheme.yellow);
    element.style.setProperty("--bmc-chip-bg", config.darkTheme.chipBg);
    element.style.setProperty("--coffee-ink", config.darkTheme.ink);
    element.style.setProperty("--bmc-chip-fg", config.darkTheme.chipFg);
    element.dataset.bmcTheme = "dark";
  } else {
    element.style.setProperty("--bmc-yellow", config.theme.yellow);
    element.style.setProperty("--coffee-cream", config.theme.yellow);
    element.style.setProperty("--bmc-chip-bg", config.theme.chipBg);
    element.style.setProperty("--coffee-ink", config.theme.ink);
    element.style.setProperty("--bmc-chip-fg", config.theme.chipFg);
    element.dataset.bmcTheme = "light";
  }
}

function isClassDark(): boolean {
  const root = document.documentElement;
  return root.dataset.theme === "dark" || root.classList.contains("dark");
}

export function detectDark(config: ResolvedCoffeeCtaConfig): boolean {
  if (config.darkMode === "off" || config.darkMode === "auto") return false;
  if (config.darkMode === "class") {
    return isClassDark();
  }
  if (config.darkMode === "media") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

export function applyConfig(
  element: HTMLAnchorElement,
  config: ResolvedCoffeeCtaConfig,
  isDark?: boolean,
): void {
  const dark = isDark ?? detectDark(config);

  element.href = config.url;
  element.setAttribute("aria-label", config.ariaLabel);

  if (config.positionMode === "flow") {
    element.style.removeProperty("z-index");
  } else {
    element.style.zIndex = String(config.zIndex);
  }

  element.style.setProperty("--bmc-yellow", config.theme.yellow);
  element.style.setProperty("--bmc-dark", config.theme.ink);
  element.style.setProperty("--bmc-focus-ring", config.theme.focusRing);
  element.style.setProperty("--bmc-font", config.theme.fontFamily);
  element.style.setProperty("--bmc-radius", "6px");
  element.style.setProperty("--coffee-size", `${config.size}px`);
  element.style.setProperty("--coffee-size-mobile", `${config.mobileSize}px`);

  applyThemeColors(element, config, dark);

  element.dataset.bmcDarkMode = config.darkMode;
  element.dataset.bmcPositionMode = config.positionMode;
  applyTooltipPosition(element, config);

  if (config.positionMode === "flow") {
    delete element.dataset.bmcPosition;
    delete element.dataset.bmcAnchor;
    clearOffsets(element);
  } else {
    element.dataset.bmcPosition = config.positionPreset;
    if (config.anchor) {
      element.dataset.bmcAnchor = "";
    } else {
      delete element.dataset.bmcAnchor;
    }
    applyCustomPosition(element, config.position);
  }

  const emojiEl = element.querySelector<HTMLElement>(".coffee-cta__emoji");
  const labelEl = element.querySelector<HTMLElement>(".coffee-cta__label");
  if (emojiEl) emojiEl.textContent = config.emoji;
  if (labelEl) labelEl.textContent = config.label;
}
