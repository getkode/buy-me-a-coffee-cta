import {mountBmcIconSvg, syncBmcIconTheme} from "./bmc-icon.js";
import {initTheme, isDarkMode} from "./theme.js";

export type SitePage = "playground" | "docs" | "about";

const SITE_BMC_ICON_THEME = {
	light: {yellow: "#ffdd00", ink: "#0d0c22"},
	dark: {yellow: "#ffdd00", ink: "#ececf2"},
} as const;

function syncSiteBmcIconTheme(): void {
	const dark = isDarkMode();
	syncBmcIconTheme(getBmcIconLink(), dark ? SITE_BMC_ICON_THEME.dark : SITE_BMC_ICON_THEME.light);
}

function initNavMenu(): void {
	const header = document.getElementById("site-header");
	const toggle = document.getElementById("site-nav-toggle");
	const nav = document.getElementById("site-nav");
	if (!(header instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) {
		return;
	}

	const close = () => {
		header.classList.remove("is-nav-open");
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open menu");
	};

	const open = () => {
		header.classList.add("is-nav-open");
		toggle.setAttribute("aria-expanded", "true");
		toggle.setAttribute("aria-label", "Close menu");
	};

	toggle.addEventListener("click", () => {
		if (header.classList.contains("is-nav-open")) close();
		else open();
	});

	for (const link of nav.querySelectorAll<HTMLAnchorElement>(".site-nav__link")) {
		link.addEventListener("click", close);
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") close();
	});

	document.addEventListener("click", (event) => {
		if (!header.classList.contains("is-nav-open")) return;
		const target = event.target;
		if (!(target instanceof Node) || header.contains(target)) return;
		close();
	});

	window.matchMedia("(min-width: 769px)").addEventListener("change", (event) => {
		if (event.matches) close();
	});
}

export function initSiteChrome(page: SitePage) {
	initTheme();
	initNavMenu();
	for (const link of document.querySelectorAll<HTMLAnchorElement>(".site-nav__link")) {
		const active = link.dataset.nav === page;
		link.classList.toggle("is-active", active);
		if (active) {
			link.setAttribute("aria-current", "page");
		} else {
			link.removeAttribute("aria-current");
		}
	}
	mountBmcIconSvg(document.getElementById("bmc-icon-link"));

	if (page !== "playground") {
		syncSiteBmcIconTheme();
		window.addEventListener("demo-theme-change", syncSiteBmcIconTheme);
	}
}

export function getBmcIconLink(): HTMLElement | null {
	return document.getElementById("bmc-icon-link");
}
