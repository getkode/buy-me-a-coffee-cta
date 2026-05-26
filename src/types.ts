export type PositionPreset = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface PositionOffset {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

export type Position = PositionPreset | PositionOffset;

/** Side of the cup where the tooltip appears. `auto` picks left/right from CTA position. */
export type TooltipPositionConfig = "auto" | "left" | "right" | "top" | "bottom";

/** Resolved tooltip side (after `auto` is expanded). */
export type TooltipPosition = "left" | "right" | "top" | "bottom";

export interface ThemeConfig {
  yellow?: string;
  ink?: string;
  chipBg?: string;
  chipFg?: string;
  fontFamily?: string;
  focusRing?: string;
}

export interface DarkThemeConfig {
  ink?: string;
  chipFg?: string;
  chipBg?: string;
  yellow?: string;
}

export interface ScrollConfig {
  fillDelay?: number;
  bottomThreshold?: number;
  touchHideMs?: number;
  /** Element (or selector) whose scroll position drives the animation. Defaults to the window. */
  target?: Element | string | null;
  /**
   * Reverse mode: the cup starts full at the top and empties as the user scrolls down.
   * Default `false` (cup fills as you scroll).
   */
  reverse?: boolean;
}

export type DarkMode = "auto" | "class" | "media" | "off";

/** Internal — derived from `anchor`. Not part of the public config. */
export type PositionMode = "fixed" | "flow";

export interface CoffeeCtaConfig {
  /** BMC username — used if `url` is not provided */
  username?: string;
  /** Full BMC profile URL */
  url?: string;
  label?: string;
  emoji?: string;
  ariaLabel?: string;
  size?: number;
  mobileSize?: number;
  /**
   * Corner preset or custom offsets. Only applied in fixed (viewport) mode.
   * Ignored when `anchor` is set. Defaults to `"bottom-right"`.
   */
  position?: Position;
  /**
   * Element (or selector) the CTA is appended into in normal document flow.
   * - Omit (or pass `null`) → fixed to the viewport (uses `position`)
   * - Provide an element → rendered as a normal-flow child of that element
   */
  anchor?: Element | string | null;
  zIndex?: number;
  theme?: ThemeConfig;
  darkTheme?: DarkThemeConfig;
  darkMode?: DarkMode;
  scroll?: ScrollConfig;
  /** Tooltip placement relative to the cup. Defaults to `"auto"`. */
  tooltipPosition?: TooltipPositionConfig;
  className?: string;
}

export interface ResolvedCoffeeCtaConfig {
  url: string;
  label: string;
  emoji: string;
  ariaLabel: string;
  size: number;
  mobileSize: number;
  position: Position;
  /** Falls back to `"bottom-right"` when `position` is a custom offset. */
  positionPreset: PositionPreset;
  positionMode: PositionMode;
  anchor: Element | string | null;
  /** Internal — the DOM target we actually append into. Equals `anchor` when provided, else `document.body`. */
  mount: Element | string;
  zIndex: number;
  theme: Required<ThemeConfig>;
  darkTheme: Required<DarkThemeConfig>;
  darkMode: DarkMode;
  scroll: Required<ScrollConfig>;
  tooltipPosition: TooltipPositionConfig;
  /** Desktop side after resolving `tooltipPosition: "auto"`. */
  tooltipSide: TooltipPosition;
  className: string;
}

export interface CoffeeCtaInstance {
  element: HTMLAnchorElement;
  updateConfig: (partial: CoffeeCtaConfig) => void;
  destroy: () => void;
}

export interface ScrollState {
  progress: number;
  fill: number;
  atBottom: boolean;
}

export interface ScrollStateOptions {
  fillDelay: number;
  bottomThreshold: number;
  reverse?: boolean;
}
