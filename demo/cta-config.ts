import type {PanelState} from "./panel-state.js";

export function readScrollTargetValue(value: string): string | null {
	return value || null;
}

export function buildCoffeeCtaConfig(state: PanelState) {
	return {
		username: state.username,
		label: state.label,
		emoji: state.emoji,
		size: state.size,
		anchor: state.anchor === "window" ? null : state.anchor,
		position: state.position as "bottom-right",
		tooltipPosition: state.tooltipPosition as "auto",
		theme: {
			yellow: state.light.yellow,
			ink: state.light.ink,
			chipBg: state.light.chipBg,
			chipFg: state.light.chipFg,
			fontFamily: state.font,
		},
		darkTheme: {
			yellow: state.dark.yellow,
			ink: state.dark.ink,
			chipBg: state.dark.chipBg,
			chipFg: state.dark.chipFg,
		},
		scroll: {
			fillDelay: state.fillDelay,
			target: readScrollTargetValue(state.scrollTarget),
			reverse: state.reverse,
		},
	};
}
