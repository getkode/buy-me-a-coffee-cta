export type {
  CoffeeCtaConfig,
  CoffeeCtaInstance,
  DarkMode,
  DarkThemeConfig,
  Position,
  PositionOffset,
  PositionPreset,
  ScrollConfig,
  ScrollState,
  ThemeConfig,
  TooltipPosition,
  TooltipPositionConfig,
} from "./types.js";
export {
  computeScrollState,
  createCoffeeCta,
  getScrollMetrics,
  isCtaVisible,
  normalizeBmcUrl,
  resolveScrollTarget,
  resolveUrl,
} from "./create-coffee-cta.js";
