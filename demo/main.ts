import { createCoffeeCta } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";
import "./styles.css";
import { syncBmcIconTheme as applyBmcIconTheme } from "./bmc-icon.js";
import {buildCoffeeCtaConfig} from "./cta-config.js";
import {EMOJI_CATEGORIES} from "./emojis.js";
import {ensureFontLoaded} from "./fonts.js";
import {getCodeText, inferFrameworkLang, setHighlightedCode, type HighlightLang} from "./highlight.js";
import {
	DEFAULTS,
	getDefaultScrollTarget,
	hasScrollTargetUrlOverride,
	mobileMediaQuery,
	PRESETS,
	THEME_PRESETS,
	type PanelState,
} from "./panel-state.js";
import {
	buildConfigLines,
	buildConfigObject,
	INSTALL_COMMANDS,
	wrapFrameworkSnippet,
	type FrameworkId,
} from "./snippets.js";
import {initSiteChrome, getBmcIconLink} from "./site-chrome.js";
import {isDarkMode, setThemeMode} from "./theme.js";
import {buildShareUrl, panelStateFromUrlParams} from "./url-state.js";

function applyResponsiveScrollDefault() {
	if (hasScrollTargetUrlOverride()) return;
	scrollTargetSelect.value = getDefaultScrollTarget();
}

function bindResponsiveScrollTarget() {
	mobileMediaQuery.addEventListener("change", () => {
		syncViewA11y();
		updateDemoChrome();
	});
}

const appEl = document.getElementById("app")!;
const usernameInput = document.getElementById("username") as HTMLInputElement;
const labelInput = document.getElementById("label") as HTMLInputElement;
const emojiPicker = document.getElementById("emoji-picker") as HTMLDivElement;
const emojiDetails = document.getElementById("emoji-details") as HTMLDetailsElement;
const emojiSummaryEl = emojiDetails.querySelector("summary") as HTMLElement;
const emojiSummary = document.getElementById("emoji-summary")!;
const sizeInput = document.getElementById("size") as HTMLInputElement;
const sizeValue = document.getElementById("size-value") as HTMLOutputElement;
const positionSelect = document.getElementById("position") as HTMLSelectElement;
const tooltipPositionSelect = document.getElementById("tooltipPosition") as HTMLSelectElement;
const placementSelect = document.getElementById("anchor") as HTMLSelectElement;
const scrollTargetSelect = document.getElementById("scrollTarget") as HTMLSelectElement;
const fontSelect = document.getElementById("font") as HTMLSelectElement;
const lightYellowInput = document.getElementById("light-yellow") as HTMLInputElement;
const lightInkInput = document.getElementById("light-ink") as HTMLInputElement;
const lightChipBgInput = document.getElementById("light-chip-bg") as HTMLInputElement;
const lightChipFgInput = document.getElementById("light-chip-fg") as HTMLInputElement;
const darkYellowInput = document.getElementById("dark-yellow") as HTMLInputElement;
const darkInkInput = document.getElementById("dark-ink") as HTMLInputElement;
const darkChipBgInput = document.getElementById("dark-chip-bg") as HTMLInputElement;
const darkChipFgInput = document.getElementById("dark-chip-fg") as HTMLInputElement;
const fillDelayInput = document.getElementById("fillDelay") as HTMLInputElement;
const fillDelayValue = document.getElementById("fillDelay-value") as HTMLOutputElement;
const reverseInput = document.getElementById("reverse") as HTMLInputElement;
const darkPageInput = document.getElementById("darkPage") as HTMLInputElement;
const positionField = document.getElementById("position-field")!;
const positionHint = document.getElementById("position-hint")!;
const tooltipHint = document.getElementById("tooltip-hint")!;
const scrollProgressBar = document.getElementById("scroll-progress")!;
const statusChip = document.getElementById("status-chip")!;
const metricsReadout = document.getElementById("metrics-readout")!;
const scrollRevealHint = document.getElementById("scroll-reveal-hint")!;
const copyStatusEl = document.getElementById("copy-status")!;
const skipLink = document.getElementById("skip-link") as HTMLAnchorElement;
const previewSubtitle = document.getElementById("preview-subtitle")!;
const panelPmSnippet = document.getElementById("panel-pm-snippet")!;
const panelEl = document.getElementById("panel-configure")!;
const previewEl = document.getElementById("panel-preview")!;
const tabConfigureBtn = document.getElementById("tab-configure") as HTMLButtonElement;
const tabPreviewBtn = document.getElementById("tab-preview") as HTMLButtonElement;
const configSnippet = document.getElementById("config-snippet")!;
const installSnippet = document.getElementById("install-snippet")!;
const copySnippetBtn = document.getElementById("copy-snippet") as HTMLButtonElement;
const copyInstallBtn = document.getElementById("copy-install") as HTMLButtonElement;
const resetBtn = document.getElementById("reset-btn")!;
const presetSelect = document.getElementById("preset-select") as HTMLSelectElement;
const themePresetSelect = document.getElementById("theme-preset-select") as HTMLSelectElement;
const integrationPanel = document.getElementById("integration-panel")!;
const showIntegrationCodeBtn = document.getElementById("show-integration-code")!;
const shareConfigBtn = document.getElementById("share-config") as HTMLButtonElement;
const mainEl = document.getElementById("scroll-content")!;

let selectedFramework: FrameworkId = "vanilla";
let selectedPackageManager: keyof typeof INSTALL_COMMANDS = "pnpm";

let selectedEmoji = DEFAULTS.emoji;
let scrollHintDismissed = false;
let urlSyncTimer = 0;
let lastMetricsKey = "";

function readPanelState(): PanelState {
	return {
		username: usernameInput.value,
		label: labelInput.value,
		emoji: selectedEmoji,
		size: Number(sizeInput.value),
		anchor: placementSelect.value,
		position: positionSelect.value,
		tooltipPosition: tooltipPositionSelect.value,
		scrollTarget: scrollTargetSelect.value,
		fillDelay: Number(fillDelayInput.value),
		reverse: reverseInput.checked,
		darkPage: darkPageInput.checked,
		font: fontSelect.value,
		light: {
			yellow: lightYellowInput.value,
			ink: lightInkInput.value,
			chipBg: lightChipBgInput.value,
			chipFg: lightChipFgInput.value,
		},
		dark: {
			yellow: darkYellowInput.value,
			ink: darkInkInput.value,
			chipBg: darkChipBgInput.value,
			chipFg: darkChipFgInput.value,
		},
	};
}

function applyPanelState(state: Partial<PanelState>) {
	const merged = {...DEFAULTS, ...state};
	usernameInput.value = merged.username;
	labelInput.value = merged.label;
	selectedEmoji = merged.emoji;
	sizeInput.value = String(merged.size);
	placementSelect.value = merged.anchor;
	positionSelect.value = merged.position;
	tooltipPositionSelect.value = merged.tooltipPosition;
	scrollTargetSelect.value = merged.scrollTarget;
	fillDelayInput.value = String(merged.fillDelay);
	reverseInput.checked = merged.reverse;
	darkPageInput.checked = merged.darkPage;
	fontSelect.value = merged.font;
	lightYellowInput.value = merged.light.yellow;
	lightInkInput.value = merged.light.ink;
	lightChipBgInput.value = merged.light.chipBg;
	lightChipFgInput.value = merged.light.chipFg;
	darkYellowInput.value = merged.dark.yellow;
	darkInkInput.value = merged.dark.ink;
	darkChipBgInput.value = merged.dark.chipBg;
	darkChipFgInput.value = merged.dark.chipFg;
	syncEmojiSelection();
	syncEmojiSummary();
	setThemeMode(merged.darkPage ? "dark" : "light");
}

function readConfig() {
	return buildCoffeeCtaConfig(readPanelState());
}

function readPlacement() {
	const state = readPanelState();
	const anchor = buildCoffeeCtaConfig(state).anchor;
	return {anchor};
}

function syncBmcIconTheme() {
	const state = readPanelState();
	const theme = document.body.classList.contains("is-dark") ? state.dark : state.light;
	applyBmcIconTheme(getBmcIconLink(), theme);
}

function buildEmojiPicker() {
	const noneRow = document.createElement("div");
	noneRow.className = "emoji-picker__none";
	noneRow.setAttribute("role", "radiogroup");
	noneRow.setAttribute("aria-label", "No emoji");
	const noneBtn = document.createElement("button");
	noneBtn.type = "button";
	noneBtn.className = "emoji-picker__btn emoji-picker__btn--none";
	noneBtn.textContent = "None";
	noneBtn.dataset.emoji = "";
	noneBtn.setAttribute("role", "radio");
	noneBtn.setAttribute("aria-label", "No emoji");
	noneRow.appendChild(noneBtn);
	emojiPicker.appendChild(noneRow);

	for (const category of EMOJI_CATEGORIES) {
		const section = document.createElement("section");
		section.className = "emoji-picker__category";

		const heading = document.createElement("h3");
		heading.className = "emoji-picker__category-label";
		heading.textContent = category.label;
		section.appendChild(heading);

		const grid = document.createElement("div");
		grid.className = "emoji-picker__grid";
		grid.setAttribute("role", "radiogroup");
		grid.setAttribute("aria-label", category.label);

		for (const emoji of category.emojis) {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "emoji-picker__btn";
			btn.textContent = emoji;
			btn.dataset.emoji = emoji;
			btn.setAttribute("role", "radio");
			btn.setAttribute("aria-label", `${category.label}: ${emoji}`);
			grid.appendChild(btn);
		}

		section.appendChild(grid);
		emojiPicker.appendChild(section);
	}

	emojiPicker.addEventListener("click", (event) => {
		const target = (event.target as HTMLElement).closest<HTMLButtonElement>(".emoji-picker__btn");
		if (!target) return;
		selectEmojiRadio(target);
	});

	syncEmojiSelection();
	syncEmojiSummary();
	bindEmojiKeyboard();
}

function getEmojiGroups(): HTMLButtonElement[][] {
	const groups: HTMLButtonElement[][] = [];
	const noneRadios = [...emojiPicker.querySelectorAll<HTMLButtonElement>(".emoji-picker__none [role='radio']")];
	if (noneRadios.length > 0) groups.push(noneRadios);

	for (const section of emojiPicker.querySelectorAll(".emoji-picker__category")) {
		groups.push([...section.querySelectorAll<HTMLButtonElement>("[role='radio']")]);
	}

	return groups;
}

function syncEmojiSelection() {
	const groups = getEmojiGroups();

	for (const btn of emojiPicker.querySelectorAll<HTMLButtonElement>(".emoji-picker__btn")) {
		const isNone = btn.classList.contains("emoji-picker__btn--none");
		const isSelected = isNone ? selectedEmoji === "" : btn.dataset.emoji === selectedEmoji;
		btn.classList.toggle("is-selected", isSelected);
		btn.setAttribute("aria-checked", String(isSelected));
		btn.tabIndex = -1;
	}

	for (const group of groups) {
		const selectedInGroup = group.find((btn) => btn.classList.contains("is-selected"));
		const tabStop = selectedInGroup ?? group[0];
		if (tabStop) tabStop.tabIndex = 0;
	}
}

function syncEmojiSummary() {
	emojiSummary.textContent = selectedEmoji || "None";
}

function readScrollTarget(): string | null {
	const value = scrollTargetSelect.value.trim();
	return value || null;
}

function getScrollContainer(): HTMLElement | null {
	const target = readScrollTarget();
	if (target === null) return null;
	if (typeof target === "string") {
		return document.querySelector<HTMLElement>(target);
	}
	return target;
}

function getScrollMetrics() {
	const container = getScrollContainer();
	if (!container) {
		return {
			scrollTop: window.scrollY,
			scrollHeight: document.documentElement.scrollHeight,
			clientHeight: window.innerHeight,
		};
	}
	return {
		scrollTop: container.scrollTop,
		scrollHeight: container.scrollHeight,
		clientHeight: container.clientHeight,
	};
}

function updateScrollProgress() {
	const {scrollTop, scrollHeight, clientHeight} = getScrollMetrics();
	const maxScroll = Math.max(scrollHeight - clientHeight, 1);
	const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
	scrollProgressBar.style.width = `${progress * 100}%`;
}

function scrollToFraction(fraction: number) {
	const {scrollHeight, clientHeight} = getScrollMetrics();
	const maxScroll = Math.max(scrollHeight - clientHeight, 0);
	const top = maxScroll * fraction;
	const container = getScrollContainer();
	if (container) {
		container.scrollTo({top, behavior: "smooth"});
	} else {
		window.scrollTo({top, behavior: "smooth"});
	}
}

function updatePlacementControls() {
	const isFixed = placementSelect.value === "window";
	positionField.classList.toggle("is-disabled", !isFixed);
	positionSelect.disabled = !isFixed;
	positionHint.hidden = isFixed;
	tooltipHint.hidden = isFixed;
}

function updateAnchorHighlight() {
	for (const el of document.querySelectorAll<HTMLElement>(".cta-anchor")) {
		el.classList.remove("is-active-anchor");
	}
	const {anchor} = readPlacement();
	if (!anchor) return;
	const target = typeof anchor === "string" ? document.querySelector(anchor) : anchor;
	target?.classList.add("is-active-anchor");
}

function formatPct(value: number): string {
	return `${Math.round(value * 100)}%`;
}

function canShowScrollRevealHint(): boolean {
	if (!mobileMediaQuery.matches) return true;
	return appEl.classList.contains("is-tab-preview");
}

function updateScrollHintCopy() {
	if (mobileMediaQuery.matches && appEl.classList.contains("is-tab-configure")) {
		scrollRevealHint.textContent = "Open Preview and scroll to reveal the cup ↓";
	} else {
		scrollRevealHint.textContent = "Scroll down to reveal the cup ↓";
	}
}

function updatePreviewSubtitle() {
	if (mobileMediaQuery.matches) {
		previewSubtitle.textContent = "Open Preview and scroll to test scroll-linked animation";
	} else {
		previewSubtitle.textContent = "Scroll this panel to reveal and animate the cup";
	}
}

function updateSkipLink() {
	const mobile = mobileMediaQuery.matches;
	const onPreview = appEl.classList.contains("is-tab-preview");

	if (mobile && onPreview) {
		skipLink.textContent = "Skip to preview content";
		skipLink.href = "#scroll-content";
	} else if (mobile) {
		skipLink.textContent = "Skip to configuration";
		skipLink.href = "#panel-configure";
	} else {
		skipLink.textContent = "Skip to live preview";
		skipLink.href = "#scroll-content";
	}
}

function updateDemoChrome() {
	updateScrollHintCopy();
	updatePreviewSubtitle();
	updateSkipLink();
}

function syncViewA11y() {
	const mobile = mobileMediaQuery.matches;
	const onConfigure = appEl.classList.contains("is-tab-configure");
	const onPreview = appEl.classList.contains("is-tab-preview");

	if (mobile) {
		panelEl.setAttribute("role", "tabpanel");
		panelEl.setAttribute("aria-labelledby", "tab-configure");
		previewEl.setAttribute("role", "tabpanel");
		previewEl.setAttribute("aria-labelledby", "tab-preview");
		panelEl.setAttribute("aria-hidden", onPreview ? "true" : "false");
		previewEl.setAttribute("aria-hidden", onConfigure ? "true" : "false");
		tabConfigureBtn.tabIndex = onConfigure ? 0 : -1;
		tabPreviewBtn.tabIndex = onPreview ? 0 : -1;
	} else {
		panelEl.removeAttribute("role");
		panelEl.removeAttribute("aria-labelledby");
		panelEl.removeAttribute("aria-hidden");
		previewEl.removeAttribute("role");
		previewEl.removeAttribute("aria-labelledby");
		previewEl.removeAttribute("aria-hidden");
		tabConfigureBtn.tabIndex = 0;
		tabPreviewBtn.tabIndex = 0;
	}
}

function announceCopy(message: string) {
	copyStatusEl.textContent = message;
}

function updateLiveMetrics() {
	const style = getComputedStyle(cta.element);
	const progress = parseFloat(style.getPropertyValue("--progress") || "0");
	const fill = parseFloat(style.getPropertyValue("--fill") || "0");
	const hidden = cta.element.classList.contains("is-hidden");
	const atBottom = cta.element.classList.contains("is-bottom");
	const {scrollTop, scrollHeight, clientHeight} = getScrollMetrics();
	const maxScroll = Math.max(scrollHeight - clientHeight, 1);
	const scrollPct = scrollTop / maxScroll;

	let status: "hidden" | "drawing" | "full" = "drawing";
	if (hidden) {
		status = "hidden";
	} else if (atBottom || (progress >= 0.99 && fill >= 0.99)) {
		status = "full";
	}

	const showHint = hidden && !scrollHintDismissed && canShowScrollRevealHint();
	scrollRevealHint.classList.toggle("is-visible", showHint);
	scrollRevealHint.hidden = !showHint;
	if (!hidden && !scrollHintDismissed) {
		scrollHintDismissed = true;
		scrollRevealHint.classList.remove("is-visible");
		scrollRevealHint.hidden = true;
	}

	updateScrollProgress();

	const statusText = status === "hidden" ? "Hidden" : status === "full" ? "Full" : "Drawing";
	const statusClass = `status-chip status-chip--${status}`;
	const readout = `Scroll ${formatPct(scrollPct)} · Outline ${formatPct(progress)} · Fill ${formatPct(fill)}`;
	const metricsKey = `${statusText}|${readout}|${statusClass}`;

	if (metricsKey === lastMetricsKey) return;
	lastMetricsKey = metricsKey;

	statusChip.textContent = statusText;
	statusChip.className = statusClass;
	metricsReadout.textContent = readout;
}

function startMetricsLoop() {
	const tick = () => {
		updateLiveMetrics();
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
}

function buildThemeBlock(
	theme: PanelState["light"],
	defaults: PanelState["light"],
	key: "theme" | "darkTheme"
): string | undefined {
	const hasOverride =
		theme.yellow !== defaults.yellow ||
		theme.ink !== defaults.ink ||
		theme.chipBg !== defaults.chipBg ||
		theme.chipFg !== defaults.chipFg;

	if (!hasOverride) return undefined;

	const lines = [`  ${key}: {`];
	if (theme.yellow !== defaults.yellow) lines.push(`    yellow: ${JSON.stringify(theme.yellow)},`);
	if (theme.ink !== defaults.ink) lines.push(`    ink: ${JSON.stringify(theme.ink)},`);
	if (theme.chipBg !== defaults.chipBg) lines.push(`    chipBg: ${JSON.stringify(theme.chipBg)},`);
	if (theme.chipFg !== defaults.chipFg) lines.push(`    chipFg: ${JSON.stringify(theme.chipFg)},`);
	lines.push("  },");
	return lines.join("\n");
}

function buildScrollBlock(scroll: ReturnType<typeof readConfig>["scroll"]): string | undefined {
	if (scroll.fillDelay === DEFAULTS.fillDelay && !scroll.target && !scroll.reverse) {
		return undefined;
	}

	const lines = ["  scroll: {"];
	if (scroll.fillDelay !== DEFAULTS.fillDelay) {
		lines.push(`    fillDelay: ${scroll.fillDelay},`);
	}
	if (scroll.target) {
		lines.push(`    target: ${JSON.stringify(scroll.target)},`);
	}
	if (scroll.reverse) lines.push("    reverse: true,");
	lines.push("  },");
	return lines.join("\n");
}

function generateSnippet(): string {
	const config = readConfig();
	const state = readPanelState();

	let anchorStr: string | null = null;
	if (state.anchor !== "window") {
		anchorStr = state.anchor;
	}

	const themeBlock = buildThemeBlock(config.theme, DEFAULTS.light, "theme");
	const darkThemeBlock = buildThemeBlock(config.darkTheme, DEFAULTS.dark, "darkTheme");

	const configLines = buildConfigLines({
		username: config.username,
		label: config.label,
		emoji: config.emoji || undefined,
		size: config.size !== 40 ? config.size : undefined,
		anchor: anchorStr,
		position: !anchorStr ? state.position : undefined,
		tooltipPosition: state.tooltipPosition !== "auto" ? state.tooltipPosition : undefined,
		themeBlock,
		darkThemeBlock,
		darkMode: state.darkPage ? "class" : undefined,
		scrollBlock: buildScrollBlock(config.scroll),
	});

	if (config.theme.fontFamily !== DEFAULTS.font) {
		const themeIndex = configLines.findIndex((line) => line.startsWith("  theme:"));
		if (themeIndex >= 0) {
			configLines.splice(themeIndex + 1, 0, `    fontFamily: ${JSON.stringify(config.theme.fontFamily)},`);
		} else {
			configLines.push("  theme: {");
			configLines.push(`    fontFamily: ${JSON.stringify(config.theme.fontFamily)},`);
			configLines.push("  },");
		}
	}

	return wrapFrameworkSnippet(selectedFramework, buildConfigObject(configLines), {
		embeddedConfig: true,
		anchored: !!anchorStr,
	});
}

function updateInstallSnippet() {
	setHighlightedCode(installSnippet, INSTALL_COMMANDS[selectedPackageManager], "bash");
}

function inferPlaygroundLang(framework: FrameworkId): HighlightLang {
	if (framework === "vanilla") return "html";
	return inferFrameworkLang(framework);
}

function updateSnippet() {
	setHighlightedCode(configSnippet, generateSnippet(), inferPlaygroundLang(selectedFramework));
	updateInstallSnippet();
}

function showIntegrationCode() {
	updateSnippet();
	if (mobileMediaQuery.matches) {
		switchTab("preview");
	}
	window.requestAnimationFrame(() => {
		integrationPanel.classList.add("is-highlighted");
		integrationPanel.scrollIntoView({behavior: "smooth", block: "start"});
		const heading = document.getElementById("integration-panel-title");
		if (heading) {
			heading.tabIndex = -1;
			heading.focus({preventScroll: true});
		}
		window.setTimeout(() => integrationPanel.classList.remove("is-highlighted"), 1600);
	});
}

function buildShareUrlForPage(): string {
	return buildShareUrl(readPanelState(), themePresetSelect.value, window.location.origin, window.location.pathname);
}

function syncUrlParams() {
	window.clearTimeout(urlSyncTimer);
	urlSyncTimer = window.setTimeout(() => {
		const url = buildShareUrlForPage();
		const pathWithQuery = url.slice(window.location.origin.length);
		window.history.replaceState(null, "", pathWithQuery);
	}, 300);
}

async function shareConfig() {
	window.clearTimeout(urlSyncTimer);
	urlSyncTimer = 0;

	const url = buildShareUrlForPage();
	window.history.replaceState(null, "", url.slice(window.location.origin.length));

	const titleEl = shareConfigBtn.querySelector(".integration-cta__title");
	const defaultLabel = titleEl?.textContent ?? "Share your config";

	try {
		await navigator.clipboard.writeText(url);
		if (titleEl) titleEl.textContent = "Link copied!";
		announceCopy("Link copied to clipboard");
		window.setTimeout(() => {
			if (titleEl) titleEl.textContent = defaultLabel;
		}, 1500);
	} catch {
		if (titleEl) titleEl.textContent = "Copy failed";
		announceCopy("Copy failed");
		window.setTimeout(() => {
			if (titleEl) titleEl.textContent = defaultLabel;
		}, 1500);
	}
}

function applyUrlParams() {
	const {state, themePreset} = panelStateFromUrlParams(new URLSearchParams(window.location.search));
	if (Object.keys(state).length === 0) return;

	applyPanelState(state);

	if (themePreset && THEME_PRESETS[themePreset]) {
		themePresetSelect.value = themePreset;
	}
}

function switchTab(tab: "configure" | "preview") {
	appEl.classList.remove("is-tab-configure", "is-tab-preview");
	appEl.classList.add(tab === "configure" ? "is-tab-configure" : "is-tab-preview");
	for (const btn of appEl.querySelectorAll<HTMLButtonElement>(".app-tabs__btn")) {
		const active = btn.dataset.tab === tab;
		btn.classList.toggle("is-active", active);
		btn.setAttribute("aria-selected", String(active));
	}
	syncViewA11y();
	updateDemoChrome();
	updateLiveMetrics();
}

function bindTabListKeyboard(tabs: HTMLButtonElement[], onActivate: (tab: HTMLButtonElement) => void) {
	for (const tab of tabs) {
		tab.addEventListener("keydown", (event) => {
			const index = tabs.indexOf(tab);
			let nextIndex: number;

			if (event.key === "ArrowRight") {
				nextIndex = (index + 1) % tabs.length;
			} else if (event.key === "ArrowLeft") {
				nextIndex = (index - 1 + tabs.length) % tabs.length;
			} else if (event.key === "Home") {
				nextIndex = 0;
			} else if (event.key === "End") {
				nextIndex = tabs.length - 1;
			} else {
				return;
			}

			event.preventDefault();
			const nextTab = tabs[nextIndex];
			nextTab.focus();
			onActivate(nextTab);
		});
	}
}

function bindAppTabKeys() {
	const tabs = [...appEl.querySelectorAll<HTMLButtonElement>(".app-tabs__btn")];
	bindTabListKeyboard(tabs, (tab) => {
		switchTab(tab.dataset.tab as "configure" | "preview");
	});
}

function selectEmojiRadio(radio: HTMLButtonElement) {
	selectedEmoji = radio.dataset.emoji ?? "";
	syncEmojiSelection();
	syncEmojiSummary();
	updateFromPanel();
}

function bindEmojiKeyboard() {
	emojiPicker.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			emojiDetails.open = false;
			emojiSummaryEl.focus();
			event.preventDefault();
			return;
		}

		const target = event.target;
		if (!(target instanceof HTMLButtonElement) || target.getAttribute("role") !== "radio") {
			return;
		}

		const groups = getEmojiGroups();
		const group = groups.find((radios) => radios.includes(target));
		if (!group) return;

		const index = group.indexOf(target);
		let next: HTMLButtonElement | undefined;

		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			next = group[(index + 1) % group.length];
		} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
			next = group[(index - 1 + group.length) % group.length];
		} else {
			return;
		}

		event.preventDefault();
		selectEmojiRadio(next);
		next.focus();
	});
}

function bindModalTabKeys() {
	const pmTabs = [...document.querySelectorAll<HTMLButtonElement>(".code-tab[data-pm]")];
	bindTabListKeyboard(pmTabs, (tab) => {
		selectedPackageManager = tab.dataset.pm as keyof typeof INSTALL_COMMANDS;
		setCodeTabGroup(pmTabs, tab, panelPmSnippet);
		updateInstallSnippet();
	});

	const fwTabs = [...document.querySelectorAll<HTMLButtonElement>(".code-tab[data-framework]")];
	bindTabListKeyboard(fwTabs, (tab) => {
		applyFrameworkTab(tab.dataset.framework as FrameworkId, tab);
	});
}

function focusPanelSection(sectionId: string) {
	if (mobileMediaQuery.matches) {
		switchTab("configure");
	}
	const section = document.getElementById(sectionId);
	if (!section) return;
	section.classList.add("is-highlighted");
	section.scrollIntoView({behavior: "smooth", block: "start"});
	const heading = section.querySelector<HTMLElement>(".panel__section-title");
	if (heading) {
		heading.tabIndex = -1;
		heading.focus({preventScroll: true});
	}
	window.setTimeout(() => section.classList.remove("is-highlighted"), 1600);
}

function applyThemePreset(presetId: string) {
	const preset = THEME_PRESETS[presetId];
	if (!preset) return;
	lightYellowInput.value = preset.light.yellow;
	lightInkInput.value = preset.light.ink;
	lightChipBgInput.value = preset.light.chipBg;
	lightChipFgInput.value = preset.light.chipFg;
	darkYellowInput.value = preset.dark.yellow;
	darkInkInput.value = preset.dark.ink;
	darkChipBgInput.value = preset.dark.chipBg;
	darkChipFgInput.value = preset.dark.chipFg;
	themePresetSelect.value = presetId;
	updateFromPanel();
}

function applyDemoPreset(presetId: string) {
	const preset = PRESETS[presetId] ?? {};
	applyPanelState({...DEFAULTS, ...preset, scrollTarget: getDefaultScrollTarget()});
	presetSelect.value = presetId;
	scrollHintDismissed = false;
	lastMetricsKey = "";
	if (preset.anchor && preset.anchor !== "window") {
		switchTab("preview");
		window.setTimeout(() => {
			document.querySelector(preset.anchor as string)?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}, 150);
	}
	updateFromPanel();
}

async function copyText(text: string, button: HTMLButtonElement, successLabel: string) {
	const defaultLabel = button.textContent ?? "Copy";
	try {
		await navigator.clipboard.writeText(text);
		button.textContent = successLabel;
		announceCopy(successLabel);
		window.setTimeout(() => {
			button.textContent = defaultLabel;
		}, 1500);
	} catch {
		button.textContent = "Copy failed";
		announceCopy("Copy failed");
		window.setTimeout(() => {
			button.textContent = defaultLabel;
		}, 1500);
	}
}

function bindInput(el: HTMLElement, handler: () => void) {
	el.addEventListener("input", handler);
	el.addEventListener("change", handler);
}

function updateFromPanel() {
	sizeValue.textContent = sizeInput.value;
	fillDelayValue.textContent = fillDelayInput.value;
	updatePlacementControls();
	ensureFontLoaded(fontSelect.value);
	cta.updateConfig(readConfig());
	updateAnchorHighlight();
	updateSnippet();
	syncUrlParams();
	syncBmcIconTheme();
	updateDemoChrome();
	updateLiveMetrics();
}

initSiteChrome("playground");
applyUrlParams();
if (new URLSearchParams(window.location.search).size === 0) {
	darkPageInput.checked = isDarkMode();
}
applyResponsiveScrollDefault();
ensureFontLoaded(fontSelect.value);
syncBmcIconTheme();
updateDemoChrome();

buildEmojiPicker();
updatePlacementControls();
updateAnchorHighlight();
updateSnippet();

const cta = createCoffeeCta({
	...readConfig(),
	darkMode: "class",
});

syncViewA11y();
bindAppTabKeys();
bindModalTabKeys();
startMetricsLoop();
bindResponsiveScrollTarget();

for (const el of [
	usernameInput,
	labelInput,
	sizeInput,
	positionSelect,
	tooltipPositionSelect,
	placementSelect,
	scrollTargetSelect,
	fontSelect,
	lightYellowInput,
	lightInkInput,
	lightChipBgInput,
	lightChipFgInput,
	darkYellowInput,
	darkInkInput,
	darkChipBgInput,
	darkChipFgInput,
	fillDelayInput,
	reverseInput,
]) {
	bindInput(el, updateFromPanel);
}

darkPageInput.addEventListener("change", () => {
	setThemeMode(darkPageInput.checked ? "dark" : "light");
	updateFromPanel();
	syncBmcIconTheme();
});

window.addEventListener("demo-theme-change", (event) => {
	const dark = (event as CustomEvent<{dark: boolean}>).detail.dark;
	if (darkPageInput.checked !== dark) {
		darkPageInput.checked = dark;
		updateFromPanel();
	}
	syncBmcIconTheme();
});

resetBtn.addEventListener("click", () => {
	applyPanelState({...DEFAULTS, scrollTarget: getDefaultScrollTarget()});
	presetSelect.value = "default";
	themePresetSelect.value = "bmc";
	scrollHintDismissed = false;
	lastMetricsKey = "";
	updateFromPanel();
});

presetSelect.addEventListener("change", () => {
	applyDemoPreset(presetSelect.value);
});

themePresetSelect.addEventListener("change", () => {
	applyThemePreset(themePresetSelect.value);
});

const packageManagerTabs = document.querySelectorAll<HTMLButtonElement>(".code-tab[data-pm]");
for (const tab of packageManagerTabs) {
	tab.addEventListener("click", () => {
		selectedPackageManager = tab.dataset.pm as keyof typeof INSTALL_COMMANDS;
		setCodeTabGroup(packageManagerTabs, tab, panelPmSnippet);
		updateInstallSnippet();
	});
}

for (const tab of document.querySelectorAll<HTMLButtonElement>(".code-tab[data-framework]")) {
	tab.addEventListener("click", () => {
		applyFrameworkTab(tab.dataset.framework as FrameworkId, tab);
	});
}

function setCodeTabGroup(
	tabs: HTMLButtonElement[] | NodeListOf<HTMLButtonElement>,
	activeTab: HTMLButtonElement,
	panel?: HTMLElement
) {
	for (const btn of tabs) {
		const active = btn === activeTab;
		btn.classList.toggle("is-active", active);
		btn.setAttribute("aria-selected", String(active));
		btn.tabIndex = active ? 0 : -1;
	}
	panel?.setAttribute("aria-labelledby", activeTab.id);
}

function applyFrameworkTab(framework: FrameworkId, activeTab?: HTMLButtonElement) {
	selectedFramework = framework;
	const tabs = [...document.querySelectorAll<HTMLButtonElement>(".code-tab[data-framework]")];
	const tab = activeTab ?? tabs.find((btn) => btn.dataset.framework === framework);
	if (tab) {
		setCodeTabGroup(tabs, tab, configSnippet);
	}
	updateSnippet();
}

copySnippetBtn.addEventListener("click", () => {
	void copyText(getCodeText(configSnippet), copySnippetBtn, "Copied!");
});

copyInstallBtn.addEventListener("click", () => {
	void copyText(getCodeText(installSnippet), copyInstallBtn, "Copied!");
});

showIntegrationCodeBtn.addEventListener("click", () => showIntegrationCode());
shareConfigBtn.addEventListener("click", () => {
	void shareConfig();
});

for (const btn of appEl.querySelectorAll<HTMLButtonElement>(".app-tabs__btn")) {
	btn.addEventListener("click", () => {
		switchTab(btn.dataset.tab as "configure" | "preview");
	});
}

for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-scroll-to]")) {
	btn.addEventListener("click", () => {
		scrollToFraction(Number(btn.dataset.scrollTo));
	});
}

for (const btn of document.querySelectorAll<HTMLButtonElement>(".content-card__action[data-panel-section]")) {
	btn.addEventListener("click", () => {
		const sectionId = btn.dataset.panelSection;
		if (sectionId) focusPanelSection(sectionId);
	});
}

const scrollContainer = mainEl;
scrollContainer.addEventListener("scroll", updateLiveMetrics, {passive: true});
window.addEventListener("scroll", updateLiveMetrics, {passive: true});

placementSelect.addEventListener("change", () => {
	if (placementSelect.value !== "window") {
		switchTab("preview");
	}
});

setCodeTabGroup(packageManagerTabs, document.getElementById("tab-pm-pnpm") as HTMLButtonElement, panelPmSnippet);
applyFrameworkTab("vanilla", document.getElementById("tab-fw-vanilla") as HTMLButtonElement);
