# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-26

### Changed

- **Tooltip position** — the tooltip now uses the same side on desktop and mobile. The previous mobile-only override that moved `auto` tooltips above the cup on small screens was removed.
- **`darkMode: "auto"`** — theme switching is CSS-only via `prefers-color-scheme`. JS sets light defaults and exposes `darkTheme` tokens; no media-query listener in auto mode.
- **Public API** — removed internal exports `ResolvedCoffeeCtaConfig` and `PositionMode`; added `isCtaVisible` alongside other scroll helpers.

### Fixed

- **`updateConfig`** — dark mode listeners are rebound when `darkMode` changes.
- **`darkMode: "class"`** — detects both `data-theme="dark"` and `class="dark"` on `<html>`.

### Added

- GitHub Actions CI (lint, typecheck, test, build, smoke test).
- Lifecycle tests (`destroy`, duplicate instance).
- Dark mode and `detectDark` tests.
- `packageManager` and `engines` fields in `package.json`.
- Cross-platform CSS copy script for builds.

## [0.1.0] - 2026-05-25 (unpublished)

Initial implementation — not released to npm or GitHub.

### Added

- `createCoffeeCta()` — scroll-driven Buy Me a Coffee floating button
- Configurable label, emoji, theme, dark mode, placement, and scroll behavior
- Fixed viewport positioning with corner presets and custom offsets
- In-flow placement via `anchor` element or selector
- Configurable tooltip position (`auto`, `left`, `right`, `top`, `bottom`)
- Reverse scroll mode (cup starts full at top)
- Nested scroll target support
- Dual ESM + CJS build with TypeScript types
- Separate `buy-me-a-coffee-cta/style.css` export
- Interactive Vite demo playground

[0.2.0]: https://github.com/getkode/buy-me-a-coffee-cta/releases/tag/v0.2.0
