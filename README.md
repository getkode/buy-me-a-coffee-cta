# buy-me-a-coffee-cta

A scroll-driven **Buy Me a Coffee** floating button for any website. Vanilla JavaScript, zero dependencies.

## What it is

A small coffee cup fixed in the bottom-right corner of your site. When someone clicks it, they go to your Buy Me a Coffee page to leave a tip or support you.

It is your own custom button — not the official embed Buy Me a Coffee gives you to paste in.

**Try the [live playground](https://getkode.github.io/buy-me-a-coffee-cta/)** to configure options, preview scroll behavior, and copy integration snippets.

### What people see

- **At the top of the page** — An empty-ish cup. No message yet.
- **As they scroll** — The cup draws itself, then coffee fills from the bottom.
- **On hover (desktop)** — Full cup plus a yellow label on the **left** of the cup (with default placement).
- **On tap (phone)** — Same tooltip **position** as desktop; shows for a couple of seconds, then fades.
- **At the bottom** — Full cup and label stay visible as a gentle reminder.
- **On click** — Your Buy Me a Coffee page opens in a new tab.

## Install

```bash
pnpm add buy-me-a-coffee-cta
```

## Quick start

Import the stylesheet once, then create the CTA:

```html
<link rel="stylesheet" href="node_modules/buy-me-a-coffee-cta/dist/style.css" />
<script type="module">
  import { createCoffeeCta } from "buy-me-a-coffee-cta";

  createCoffeeCta({
    username: "yourname",
    label: "Buy me a coffee",
  });
</script>
```

### Bundler (Vite, webpack, etc.)

```ts
import { createCoffeeCta } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

createCoffeeCta({
  username: "yourname",
  label: "Buy me a coffee",
  emoji: "☕",
});
```

### CDN (no bundler)

```html
<link rel="stylesheet" href="https://unpkg.com/buy-me-a-coffee-cta/dist/style.css" />
<script type="module">
  import { createCoffeeCta } from "https://unpkg.com/buy-me-a-coffee-cta/dist/index.js";
  createCoffeeCta({ username: "yourname" });
</script>
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `username` | `string` | — | BMC username (used if `url` is omitted) |
| `url` | `string` | — | Full BMC profile URL |
| `label` | `string` | `"Buy me a coffee"` | Tooltip text |
| `emoji` | `string` | `""` | Optional emoji prefix in tooltip |
| `ariaLabel` | `string` | auto | Screen reader label |
| `size` | `number` | `40` | Cup size in px (desktop) |
| `mobileSize` | `number` | `56` | Cup size in px (mobile) |
| `position` | preset or offsets | `"bottom-right"` | Corner preset (`bottom-right`, `bottom-left`, `top-right`, `top-left`) or custom `{ top, right, bottom, left }` offsets. Only applied in fixed (viewport) mode; ignored when `anchor` is set |
| `anchor` | `Element \| string \| null` | `null` | Element (or selector) the CTA is appended into in normal document flow. Omit for fixed viewport positioning |
| `zIndex` | `number` | `44` | Stacking order |
| `theme.yellow` | `string` | `#ffdd00` | Coffee fill + tooltip background |
| `theme.ink` | `string` | `#0d0c22` | Cup outline (light theme) |
| `theme.chipBg` | `string` | `#ffdd00` | Tooltip background |
| `theme.chipFg` | `string` | `#0d0c22` | Tooltip text |
| `theme.fontFamily` | `string` | `system-ui, sans-serif` | Tooltip font |
| `theme.focusRing` | `string` | `#0066cc` | Keyboard focus ring |
| `darkTheme.ink` | `string` | `#e8e8e8` | Cup outline in dark mode |
| `darkTheme.chipFg` | `string` | `#ffffff` | Tooltip text in dark mode |
| `darkTheme.chipBg` | `string` | `#ffdd00` | Tooltip background in dark mode |
| `darkTheme.yellow` | `string` | `#ffdd00` | Coffee fill in dark mode |
| `darkMode` | `"auto" \| "class" \| "media" \| "off"` | `"auto"` | Dark theme detection — see [Dark theme](#dark-theme) |
| `scroll.fillDelay` | `number` | `0.12` | Scroll fraction before fill starts |
| `scroll.bottomThreshold` | `number` | `4` | px from bottom to show persistent tooltip |
| `scroll.touchHideMs` | `number` | `2200` | Mobile tooltip duration after tap |
| `scroll.target` | `Element \| string \| null` | `null` (window) | Scroll container that drives the animation |
| `scroll.reverse` | `boolean` | `false` | Reverse animation: cup starts full at the top and empties as you scroll down. Persistent tooltip lives at the top instead of the bottom. The CTA is hidden at the physical bottom when empty |
| `tooltipPosition` | `"auto" \| "left" \| "right" \| "top" \| "bottom"` | `"auto"` | Tooltip placement relative to the cup. In fixed mode, `auto` picks left/right from CTA position. In flow mode (`anchor` set), `auto` places the tooltip on the **right** |
| `className` | `string` | `""` | Extra CSS classes |

## API

`createCoffeeCta(config)` returns a **`CoffeeCtaInstance`**:

| Member | Description |
|--------|-------------|
| `element` | The mounted `<a>` element (read-only handle for testing or DOM queries) |
| `updateConfig(partial)` | Merge new options into the live CTA (label, theme, scroll target, placement, etc.). Remounts when placement changes. |
| `destroy()` | Remove listeners, unmount the element, and clear the singleton instance |

```ts
const cta = createCoffeeCta({ username: "yourname" });

cta.updateConfig({ label: "Support my work" });
cta.destroy();
cta.element; // HTMLAnchorElement
```

Only one CTA per page is supported. Creating a second instance destroys the previous one.

The CTA is **`display: none`** (no hover or touch) until scroll animation begins — at the top in normal mode, or at the bottom in reverse mode. Short pages that fit in the viewport stay visible when the cup would already be full.

### Tooltip position

Use `tooltipPosition` to control where the label appears relative to the cup:

```ts
createCoffeeCta({
  username: "yourname",
  tooltipPosition: "top", // left | right | top | bottom
});
```

With the default `"auto"`:

- **Fixed mode** — tooltip sits to the **left** of the cup (or **right** when the CTA is left-aligned) at all breakpoints.
- **Flow mode** (`anchor` set) — tooltip sits to the **right** of the cup at all breakpoints.

Explicit sides (`left`, `right`, `top`, `bottom`) apply in both modes at all breakpoints.

**Interaction:** desktop uses hover; mobile uses tap (then auto-hide). Only the trigger differs — not the tooltip side.

## Size

Approximate gzipped transfer size when both assets are loaded:

| Asset | Gzipped |
|-------|---------|
| JS (`dist/index.js`) | ~7.3 KB |
| CSS (`dist/style.css`) | ~2.0 KB |

The JS bundle includes the inline SVG artwork. No runtime dependencies.

## Placement

Two modes:

**Default — fixed to the viewport:**

```ts
createCoffeeCta({ username: "yourname" });
// position: fixed, bottom-right corner of the viewport
```

Use `position` to choose the corner or custom offsets:

```ts
createCoffeeCta({
  username: "yourname",
  position: "top-left",
});

createCoffeeCta({
  username: "yourname",
  position: { bottom: 16, right: 16 },
});
```

**Normal document flow inside an element:**

```ts
createCoffeeCta({
  username: "yourname",
  anchor: "main",
});
// rendered as an inline child of <main>; the parent controls layout
```

When `anchor` is set, `position` is ignored — the host element determines layout. With the default `tooltipPosition: "auto"`, the tooltip appears on the **right** side of the cup.

## Scroll target

By default the animation tracks **window scroll**. Pass a scroll container to track a nested panel instead — the [playground](https://getkode.github.io/buy-me-a-coffee-cta/) defaults to its main preview area (`#app`):

```ts
createCoffeeCta({
  username: "yourname",
  scroll: {
    target: document.querySelector(".article-body"),
    // or: target: ".article-body"
  },
});
```

Use `target: null` or omit `scroll.target` to follow the window.

## Reverse scroll

Flip the animation: the cup starts full at the top and empties as the user scrolls down. The persistent tooltip lives at the top of the page instead of the bottom.

```ts
createCoffeeCta({
  username: "yourname",
  scroll: { reverse: true },
});
```

## Dark theme

Four detection modes:

| Mode | Behavior |
|------|----------|
| `"auto"` (default) | Light palette from JS. Dark palette applied by CSS `@media (prefers-color-scheme: dark)` using your `darkTheme` colors. |
| `"media"` | JS follows the system color scheme and updates when the preference changes. |
| `"class"` | JS follows `<html data-theme="dark">` or `<html class="dark">`. |
| `"off"` | Light theme always. |

```ts
createCoffeeCta({
  username: "yourname",
  darkMode: "auto",
  darkTheme: {
    ink: "#e8e8e8",
    chipFg: "#ffffff",
  },
});
```

For sites that toggle dark mode with a class or data attribute on `<html>`, use `darkMode: "class"`.

## Utility exports

Low-level helpers exported for custom integrations, headless tests, or building your own scroll UI. You do not need these for a typical `createCoffeeCta` setup.

| Export | Purpose |
|--------|---------|
| `computeScrollState(scrollY, scrollHeight, innerHeight, options)` | Pure function: turns scroll metrics into `{ progress, fill, atBottom }` — the same math the CTA uses for outline draw and coffee fill. Pass `fillDelay`, `bottomThreshold`, and optional `reverse`. Typically pass `metrics.clientHeight` as `innerHeight`. |
| `getScrollMetrics(target)` | Reads `{ scrollY, scrollHeight, clientHeight }` from the window or a scroll container element. |
| `isCtaVisible(state)` | Returns whether the cup should be shown (`atBottom` or `progress > 0`). Hidden at scroll rest in normal mode (top) or reverse mode (bottom). |
| `resolveScrollTarget(target)` | Resolves `scroll.target` config (`null` → window, selector string → element). Throws if a selector matches nothing. |
| `normalizeBmcUrl(usernameOrUrl)` | Normalizes a BMC username or profile URL to a full `https://buymeacoffee.com/…` link. |
| `resolveUrl(config)` | Returns the profile URL from a config object (`url` if set, otherwise built from `username`). |

Types such as `CoffeeCtaConfig`, `CoffeeCtaInstance`, and `ScrollState` are also exported.

```ts
import {
  computeScrollState,
  getScrollMetrics,
  isCtaVisible,
  normalizeBmcUrl,
  resolveScrollTarget,
  resolveUrl,
} from "buy-me-a-coffee-cta";

const target = resolveScrollTarget(document.querySelector(".article"));
const metrics = getScrollMetrics(target);
const state = computeScrollState(
  metrics.scrollY,
  metrics.scrollHeight,
  metrics.clientHeight,
  { fillDelay: 0.12, bottomThreshold: 4 },
);
if (isCtaVisible(state)) {
  /* drive a custom progress indicator */
}
```

## Framework integration

Mount the CTA after your component loads and call `destroy()` on unmount. Use `updateConfig()` when props change — do not reimplement scroll logic in framework state.

```tsx
import { useEffect, useRef } from "react";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

export function BuyMeCoffeeCta(config: CoffeeCtaConfig) {
  const ctaRef = useRef<CoffeeCtaInstance>();

  useEffect(() => {
    ctaRef.current = createCoffeeCta(config);
    return () => ctaRef.current?.destroy();
  }, []);

  useEffect(() => {
    ctaRef.current?.updateConfig(config);
  }, [config]);

  return null;
}

// <BuyMeCoffeeCta username="yourname" label="Buy me a coffee" emoji="☕" />
```

For in-flow placement, mount into a ref-backed container and pass `anchor: ref.current` instead of a CSS selector. The [playground](https://getkode.github.io/buy-me-a-coffee-cta/) includes Vue, Solid, Angular, and Svelte snippets.

## Playground

Configure the CTA visually and copy install commands at **[getkode.github.io/buy-me-a-coffee-cta](https://getkode.github.io/buy-me-a-coffee-cta/)**.

Run locally:

```bash
pnpm install
pnpm demo
```

## Development

Requires **Node.js 20+** and **pnpm 10.28.2** (see `packageManager` in `package.json`; enable with `corepack enable`).

```bash
pnpm install
pnpm build
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm lint
pnpm smoke-test   # pack + install tarball in a temp project
```

## License

MIT
