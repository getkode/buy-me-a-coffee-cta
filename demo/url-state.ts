import {
	DEFAULTS,
	getDefaultScrollTarget,
	type PanelState,
	THEME_PRESETS,
} from "./panel-state.js";

export const COLOR_URL_KEYS = {
	ly: "yellow",
	li: "ink",
	lb: "chipBg",
	lf: "chipFg",
	dy: "yellow",
	di: "ink",
	db: "chipBg",
	df: "chipFg",
} as const;

export function colorParam(value: string): string {
	return value.replace(/^#/, "");
}

export function colorFromParam(value: string | null, fallback: string): string {
	if (!value) return fallback;
	return value.startsWith("#") ? value : `#${value}`;
}

function normalizePlaygroundScrollTarget(value: string): string {
	return value === ".content" ? "#app" : value;
}

export function readThemeFromUrl(params: URLSearchParams): {
	preset?: string;
	light: Partial<PanelState["light"]>;
	dark: Partial<PanelState["dark"]>;
} {
	const preset = params.get("tp") ?? undefined;
	const base = preset && THEME_PRESETS[preset] ? THEME_PRESETS[preset] : {light: DEFAULTS.light, dark: DEFAULTS.dark};
	const light = {...base.light};
	const dark = {...base.dark};

	for (const [param, key] of Object.entries(COLOR_URL_KEYS)) {
		if (!params.has(param)) continue;
		const color = colorFromParam(params.get(param), "");
		if (param.startsWith("l")) {
			light[key as keyof PanelState["light"]] = color;
		} else {
			dark[key as keyof PanelState["dark"]] = color;
		}
	}

	return {preset, light, dark};
}

export function appendThemeUrlParams(params: URLSearchParams, state: PanelState, themePreset: string) {
	if (themePreset !== "bmc") {
		params.set("tp", themePreset);
	}

	const entries: [string, string, string][] = [
		["ly", state.light.yellow, DEFAULTS.light.yellow],
		["li", state.light.ink, DEFAULTS.light.ink],
		["lb", state.light.chipBg, DEFAULTS.light.chipBg],
		["lf", state.light.chipFg, DEFAULTS.light.chipFg],
		["dy", state.dark.yellow, DEFAULTS.dark.yellow],
		["di", state.dark.ink, DEFAULTS.dark.ink],
		["db", state.dark.chipBg, DEFAULTS.dark.chipBg],
		["df", state.dark.chipFg, DEFAULTS.dark.chipFg],
	];

	for (const [key, value, fallback] of entries) {
		if (value !== fallback) params.set(key, colorParam(value));
	}
}

export function panelStateFromUrlParams(params: URLSearchParams): {
	state: Partial<PanelState>;
	themePreset?: string;
} {
	if ([...params.keys()].length === 0) {
		return {state: {}};
	}

	const theme = readThemeFromUrl(params);

	return {
		themePreset: theme.preset,
		state: {
			username: params.get("u") ?? DEFAULTS.username,
			label: params.get("l") ?? DEFAULTS.label,
			emoji: params.get("e") ?? DEFAULTS.emoji,
			size: params.has("size") ? Number(params.get("size")) : DEFAULTS.size,
			anchor: params.get("anchor") ?? DEFAULTS.anchor,
			position: params.get("position") ?? DEFAULTS.position,
			tooltipPosition: params.get("tooltip") ?? DEFAULTS.tooltipPosition,
			scrollTarget: params.has("scroll")
				? normalizePlaygroundScrollTarget(params.get("scroll") ?? "")
				: getDefaultScrollTarget(),
			fillDelay: params.has("fillDelay") ? Number(params.get("fillDelay")) : DEFAULTS.fillDelay,
			reverse: params.get("reverse") === "1",
			darkPage: params.get("dark") === "1",
			font: params.get("font") ?? DEFAULTS.font,
			light: {...DEFAULTS.light, ...theme.light},
			dark: {...DEFAULTS.dark, ...theme.dark},
		},
	};
}

export function buildShareUrl(
	state: PanelState,
	themePreset: string,
	origin: string,
	pathname: string,
): string {
	const params = new URLSearchParams();
	if (state.username !== DEFAULTS.username) params.set("u", state.username);
	if (state.label !== DEFAULTS.label) params.set("l", state.label);
	if (state.emoji !== DEFAULTS.emoji) params.set("e", state.emoji);
	if (state.size !== DEFAULTS.size) params.set("size", String(state.size));
	if (state.anchor !== DEFAULTS.anchor) params.set("anchor", state.anchor);
	if (state.position !== DEFAULTS.position) params.set("position", state.position);
	if (state.tooltipPosition !== DEFAULTS.tooltipPosition) {
		params.set("tooltip", state.tooltipPosition);
	}
	if (state.scrollTarget !== getDefaultScrollTarget()) params.set("scroll", state.scrollTarget);
	if (state.fillDelay !== DEFAULTS.fillDelay) params.set("fillDelay", String(state.fillDelay));
	if (state.reverse) params.set("reverse", "1");
	if (state.darkPage) params.set("dark", "1");
	if (state.font !== DEFAULTS.font) params.set("font", state.font);
	appendThemeUrlParams(params, state, themePreset);

	const query = params.toString();
	return query ? `${origin}${pathname}?${query}` : `${origin}${pathname}`;
}
