import type {
  CoffeeCtaConfig,
  Position,
  PositionPreset,
  PositionMode,
  ResolvedCoffeeCtaConfig,
  ThemeConfig,
  DarkThemeConfig,
  ScrollConfig,
  TooltipPosition,
  TooltipPositionConfig,
} from "./types.js";

const POSITION_PRESETS: PositionPreset[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
];

export const DEFAULT_THEME: Required<ThemeConfig> = {
  yellow: "#ffdd00",
  ink: "#0d0c22",
  chipBg: "#ffdd00",
  chipFg: "#0d0c22",
  fontFamily: "system-ui, sans-serif",
  focusRing: "#0066cc",
};

export const DEFAULT_DARK_THEME: Required<DarkThemeConfig> = {
  ink: "#e8e8e8",
  chipFg: "#ffffff",
  chipBg: "#ffdd00",
  yellow: "#ffdd00",
};

export const DEFAULT_SCROLL: Required<Omit<ScrollConfig, "target">> & {
  target: Element | string | null;
} = {
  fillDelay: 0.12,
  bottomThreshold: 4,
  touchHideMs: 2200,
  target: null,
  reverse: false,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeBmcUrl(usernameOrUrl: string): string {
  const trimmed = usernameOrUrl.trim();
  if (!trimmed) {
    throw new Error("buy-me-a-coffee-cta: username or url is required");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  const username = trimmed.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
  if (!username) {
    throw new Error("buy-me-a-coffee-cta: invalid username");
  }

  return `https://buymeacoffee.com/${username}`;
}

export function resolveUrl(config: CoffeeCtaConfig): string {
  if (config.url) {
    return normalizeBmcUrl(config.url);
  }
  if (config.username) {
    return normalizeBmcUrl(config.username);
  }
  throw new Error("buy-me-a-coffee-cta: provide `username` or `url`");
}

export function isPositionPreset(position: Position): position is PositionPreset {
  return POSITION_PRESETS.includes(position as PositionPreset);
}

export function resolvePositionPreset(position: Position): PositionPreset {
  if (isPositionPreset(position)) {
    return position;
  }
  return "bottom-right";
}

/** Tooltip flips to the right side of the cup when the CTA is left-aligned. */
export function shouldFlipTooltip(position: Position): boolean {
  if (isPositionPreset(position)) {
    return position === "bottom-left" || position === "top-left";
  }
  const hasLeft = position.left !== undefined;
  const hasRight = position.right !== undefined;
  if (hasLeft && !hasRight) return true;
  return false;
}

export function resolveTooltipSide(
  tooltipPosition: TooltipPositionConfig,
  ctaPosition: Position,
  positionMode: PositionMode = "fixed",
): TooltipPosition {
  if (tooltipPosition !== "auto") {
    return tooltipPosition;
  }
  if (positionMode === "flow") {
    return "right";
  }
  return shouldFlipTooltip(ctaPosition) ? "right" : "left";
}

export function buildAriaLabel(
  label: string,
  emoji: string,
  explicit?: string,
): string {
  if (explicit) return explicit;
  const prefix = emoji ? `${emoji} ` : "";
  return `${prefix}${label} (opens in new tab)`;
}

/** Anchor set → normal flow; otherwise fixed to the viewport. */
export function resolvePositionMode(
  anchor: Element | string | null,
): PositionMode {
  return anchor !== null && anchor !== undefined ? "flow" : "fixed";
}

export function resolveConfig(config: CoffeeCtaConfig): ResolvedCoffeeCtaConfig {
  const label = config.label ?? "Buy me a coffee";
  const emoji = config.emoji ?? "";
  const position: Position = config.position ?? "bottom-right";
  const anchor = config.anchor ?? null;
  const tooltipPosition: TooltipPositionConfig = config.tooltipPosition ?? "auto";

  const mount: Element | string =
    anchor ?? (typeof document !== "undefined" ? document.body : "body");

  const positionMode = resolvePositionMode(anchor);

  return {
    url: resolveUrl(config),
    label,
    emoji,
    ariaLabel: buildAriaLabel(label, emoji, config.ariaLabel),
    size: config.size ?? 40,
    mobileSize: config.mobileSize ?? 56,
    position,
    positionPreset: resolvePositionPreset(position),
    positionMode,
    anchor,
    mount,
    zIndex: config.zIndex ?? 44,
    theme: { ...DEFAULT_THEME, ...config.theme },
    darkTheme: { ...DEFAULT_DARK_THEME, ...config.darkTheme },
    darkMode: config.darkMode ?? "auto",
    scroll: { ...DEFAULT_SCROLL, ...config.scroll },
    tooltipPosition,
    tooltipSide: resolveTooltipSide(tooltipPosition, position, positionMode),
    className: config.className ?? "",
  };
}

export function mergeConfig(
  current: ResolvedCoffeeCtaConfig,
  partial: CoffeeCtaConfig,
): ResolvedCoffeeCtaConfig {
  const merged: CoffeeCtaConfig = {
    label: partial.label ?? current.label,
    emoji: partial.emoji ?? current.emoji,
    ariaLabel: partial.ariaLabel ?? current.ariaLabel,
    size: partial.size ?? current.size,
    mobileSize: partial.mobileSize ?? current.mobileSize,
    position: partial.position ?? current.position,
    anchor: partial.anchor !== undefined ? partial.anchor : current.anchor,
    zIndex: partial.zIndex ?? current.zIndex,
    theme: { ...current.theme, ...partial.theme },
    darkTheme: { ...current.darkTheme, ...partial.darkTheme },
    darkMode: partial.darkMode ?? current.darkMode,
    scroll: { ...current.scroll, ...partial.scroll },
    tooltipPosition: partial.tooltipPosition ?? current.tooltipPosition,
    className: partial.className ?? current.className,
  };

  if (partial.username !== undefined) {
    merged.username = partial.username;
  } else if (partial.url !== undefined) {
    merged.url = partial.url;
  } else {
    merged.url = current.url;
  }

  return resolveConfig(merged);
}

export { clamp };
