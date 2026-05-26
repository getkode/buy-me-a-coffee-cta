export type PanelState = {
	username: string;
	label: string;
	emoji: string;
	size: number;
	anchor: string;
	position: string;
	tooltipPosition: string;
	scrollTarget: string;
	fillDelay: number;
	reverse: boolean;
	darkPage: boolean;
	font: string;
	light: {yellow: string; ink: string; chipBg: string; chipFg: string};
	dark: {yellow: string; ink: string; chipBg: string; chipFg: string};
};

export const DEFAULTS: PanelState = {
	username: "getkode",
	label: "Buy me a coffee",
	emoji: "☕",
	size: 40,
	anchor: "window",
	position: "bottom-right",
	tooltipPosition: "auto",
	scrollTarget: "#app",
	fillDelay: 0.12,
	reverse: false,
	darkPage: false,
	font: "system-ui, sans-serif",
	light: {yellow: "#ffdd00", ink: "#0d0c22", chipBg: "#ffdd00", chipFg: "#0d0c22"},
	dark: {yellow: "#ffdd00", ink: "#e8e8e8", chipBg: "#ffdd00", chipFg: "#ffffff"},
};

export const DEFAULT_SCROLL_TARGET = "#app";

export const MOBILE_BREAKPOINT = "(max-width: 820px)";

export const mobileMediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

export const THEME_PRESETS: Record<string, {light: PanelState["light"]; dark: PanelState["dark"]}> = {
	bmc: {light: DEFAULTS.light, dark: DEFAULTS.dark},
	mono: {
		light: {yellow: "#000000", ink: "#111111", chipBg: "#111111", chipFg: "#ffffff"},
		dark: {yellow: "#e8e8e8", ink: "#f4f4f4", chipBg: "#f4f4f4", chipFg: "#111111"},
	},
	contrast: {
		light: {yellow: "#ffdd00", ink: "#000000", chipBg: "#000000", chipFg: "#ffdd00"},
		dark: {yellow: "#ffdd00", ink: "#ffffff", chipBg: "#ffffff", chipFg: "#000000"},
	},
	ocean: {
		light: {yellow: "#2dd4bf", ink: "#0f172a", chipBg: "#0f766e", chipFg: "#ecfeff"},
		dark: {yellow: "#5eead4", ink: "#e2e8f0", chipBg: "#134e4a", chipFg: "#ccfbf1"},
	},
	forest: {
		light: {yellow: "#84cc16", ink: "#1a2e1a", chipBg: "#365314", chipFg: "#ecfccb"},
		dark: {yellow: "#a3e635", ink: "#dcfce7", chipBg: "#3f6212", chipFg: "#f7fee7"},
	},
	sunset: {
		light: {yellow: "#fb923c", ink: "#431407", chipBg: "#ea580c", chipFg: "#fff7ed"},
		dark: {yellow: "#fdba74", ink: "#ffedd5", chipBg: "#c2410c", chipFg: "#fff7ed"},
	},
	rose: {
		light: {yellow: "#fb7185", ink: "#4c0519", chipBg: "#be123c", chipFg: "#fff1f2"},
		dark: {yellow: "#fda4af", ink: "#ffe4e6", chipBg: "#9f1239", chipFg: "#fff1f2"},
	},
	midnight: {
		light: {yellow: "#818cf8", ink: "#1e1b4b", chipBg: "#4338ca", chipFg: "#eef2ff"},
		dark: {yellow: "#a5b4fc", ink: "#e0e7ff", chipBg: "#3730a3", chipFg: "#eef2ff"},
	},
	lavender: {
		light: {yellow: "#c4b5fd", ink: "#3b0764", chipBg: "#7c3aed", chipFg: "#f5f3ff"},
		dark: {yellow: "#ddd6fe", ink: "#ede9fe", chipBg: "#6d28d9", chipFg: "#f5f3ff"},
	},
	espresso: {
		light: {yellow: "#d4a574", ink: "#3d2314", chipBg: "#6f4e37", chipFg: "#fef3c7"},
		dark: {yellow: "#e7c9a9", ink: "#fde68a", chipBg: "#78350f", chipFg: "#fffbeb"},
	},
};

export const PRESETS: Record<string, Partial<PanelState>> = {
	default: {},
	blog: {
		anchor: "#theme-bmc-cta-container",
		tooltipPosition: "auto",
		position: "bottom-right",
		reverse: false,
		darkPage: false,
	},
	reverse: {
		anchor: "window",
		position: "top-right",
		reverse: true,
		tooltipPosition: "auto",
		darkPage: false,
	},
	dark: {
		anchor: "window",
		position: "bottom-right",
		reverse: false,
		darkPage: true,
		light: {yellow: "#ffdd00", ink: "#0d0c22", chipBg: "#1a1a2e", chipFg: "#ffdd00"},
		dark: {yellow: "#ffdd00", ink: "#e8e8e8", chipBg: "#ffdd00", chipFg: "#0d0c22"},
	},
};

export function getDefaultScrollTarget(): string {
	return DEFAULT_SCROLL_TARGET;
}

export function hasScrollTargetUrlOverride(): boolean {
	return new URLSearchParams(window.location.search).has("scroll");
}
