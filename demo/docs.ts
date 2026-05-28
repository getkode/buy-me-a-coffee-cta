import "./styles.css";
import { getCodeText, highlightAll, inferFrameworkLang, setHighlightedCode } from "./highlight.js";
import {
  FRAMEWORK_TABS,
  getFrameworkSnippet,
  type FrameworkId,
} from "./snippets.js";
import { initSiteChrome } from "./site-chrome.js";

initSiteChrome("docs");
highlightAll();
initProseCopyButtons();
initDocsFrameworkSnippets();
initDocsSidebar();

function describeScrollTarget(element: HTMLElement) {
	const style = getComputedStyle(element);
	return {
		selector:
			element.id !== ""
				? `#${element.id}`
				: `${element.tagName.toLowerCase()}${element.className ? `.${element.className.split(/\s+/).join(".")}` : ""}`,
		overflowY: style.overflowY,
		scrollTop: element.scrollTop,
		scrollHeight: element.scrollHeight,
		clientHeight: element.clientHeight,
		canScroll: element.scrollHeight > element.clientHeight + 1,
	};
}

function getDocsScrollRoot(): HTMLElement | null {
	const main = document.getElementById("docs-main");
	return main instanceof HTMLElement ? main : null;
}

function logDocsScrollTargets(scrollRoot: HTMLElement) {
	const candidates = [
		document.documentElement,
		document.body,
		document.querySelector("main.page--docs"),
		document.querySelector(".page__layout"),
		document.querySelector(".page__content"),
		document.querySelector(".page__sidebar.page__toc"),
		document.querySelector(".page__sidebar .page__toc-list"),
	].filter((node): node is HTMLElement => node instanceof HTMLElement);

	console.group("[docs] scroll targets");
	console.log("resolved scroll root:", describeScrollTarget(scrollRoot));
	console.table(candidates.map(describeScrollTarget));
	console.groupEnd();
}

function isDocsMobileToc(): boolean {
	return window.matchMedia("(max-width: 900px)").matches;
}

function getDocsScrollOffset(scrollRoot: HTMLElement): number {
	if (!isDocsMobileToc()) return 12;

	const toc = scrollRoot.querySelector(".page__sidebar.page__toc");
	if (!(toc instanceof HTMLElement)) return 12;
	return Math.ceil(toc.getBoundingClientRect().height) + 8;
}

const DOCS_SCROLL_EDGE = 2;

function getSectionAnchor(section: HTMLElement): HTMLElement {
	return section.querySelector("h2") ?? section;
}

function getDocsViewportCenter(scrollRoot: HTMLElement): number {
	const rootRect = scrollRoot.getBoundingClientRect();
	const visibleTop = rootRect.top + getDocsScrollOffset(scrollRoot);
	return (visibleTop + rootRect.bottom) / 2;
}

function isAtDocsScrollTop(scrollRoot: HTMLElement): boolean {
	return scrollRoot.scrollTop <= DOCS_SCROLL_EDGE;
}

function isAtDocsScrollBottom(scrollRoot: HTMLElement): boolean {
	return scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - DOCS_SCROLL_EDGE;
}

function getActiveSectionId(sections: HTMLElement[], scrollRoot: HTMLElement): string | null {
	if (sections.length === 0) return null;

	if (isAtDocsScrollTop(scrollRoot)) {
		return sections[0]!.id;
	}

	if (isAtDocsScrollBottom(scrollRoot)) {
		return sections[sections.length - 1]!.id;
	}

	const viewportCenter = getDocsViewportCenter(scrollRoot);
	const secondSection = sections[1];

	if (secondSection) {
		const secondTop = getSectionAnchor(secondSection).getBoundingClientRect().top;
		if (secondTop > viewportCenter) {
			return sections[0]!.id;
		}
	}

	let active = sections[0]!;
	let closestTop = -Infinity;

	for (const section of sections) {
		const top = getSectionAnchor(section).getBoundingClientRect().top;
		if (top > viewportCenter) continue;

		if (top > closestTop) {
			closestTop = top;
			active = section;
		}
	}

	return active.id;
}

function scrollDocsSectionIntoView(target: HTMLElement, scrollRoot: HTMLElement, smooth = true) {
	const offset = getDocsScrollOffset(scrollRoot);
	const rootTop = scrollRoot.getBoundingClientRect().top;
	const targetTop = target.getBoundingClientRect().top;
	const nextTop = targetTop - rootTop + scrollRoot.scrollTop - offset;
	scrollRoot.scrollTo({
		top: Math.max(0, nextTop),
		behavior: smooth ? "smooth" : "auto",
	});
}

function scrollActiveTocLinkIntoView(activeLink: HTMLAnchorElement) {
	const tocList = activeLink.closest(".page__toc-list");
	if (!(tocList instanceof HTMLElement)) return;

	const style = getComputedStyle(tocList);
	const isHorizontal = style.display === "flex" && style.flexWrap !== "wrap";
	const padding = 10;

	if (isHorizontal) {
		const linkLeft = activeLink.offsetLeft;
		const linkRight = linkLeft + activeLink.offsetWidth;
		const visibleLeft = tocList.scrollLeft;
		const visibleRight = visibleLeft + tocList.clientWidth;

		if (linkLeft < visibleLeft + padding) {
			tocList.scrollTo({left: Math.max(0, linkLeft - padding), behavior: "smooth"});
			return;
		}

		if (linkRight > visibleRight - padding) {
			tocList.scrollTo({
				left: linkRight - tocList.clientWidth + padding,
				behavior: "smooth",
			});
		}
		return;
	}

	const linkTop = activeLink.offsetTop;
	const linkBottom = linkTop + activeLink.offsetHeight;
	const visibleTop = tocList.scrollTop;
	const visibleBottom = visibleTop + tocList.clientHeight;

	if (linkTop < visibleTop + padding) {
		tocList.scrollTo({top: Math.max(0, linkTop - padding), behavior: "smooth"});
		return;
	}

	if (linkBottom > visibleBottom - padding) {
		tocList.scrollTo({
			top: linkBottom - tocList.clientHeight + padding,
			behavior: "smooth",
		});
	}
}

function getLinkSectionId(link: HTMLAnchorElement): string {
	const href = link.getAttribute("href") ?? "";
	if (href.startsWith("#")) return href.slice(1);
	try {
		return new URL(href, window.location.href).hash.slice(1);
	} catch {
		return link.hash.slice(1);
	}
}

function initDocsSidebar() {
	const links = [...document.querySelectorAll<HTMLAnchorElement>(".page__sidebar .page__toc-list a")];
	const sections = links
		.map((link) => document.getElementById(getLinkSectionId(link)))
		.filter((section): section is HTMLElement => section instanceof HTMLElement);
	const scrollRoot = getDocsScrollRoot();
	if (sections.length === 0 || !(scrollRoot instanceof HTMLElement)) return;

	if (new URLSearchParams(window.location.search).has("debug-scroll")) {
		logDocsScrollTargets(scrollRoot);
	}
	(window as Window & {__buyMeDocsScrollDebug?: () => void}).__buyMeDocsScrollDebug = () => {
		const root = getDocsScrollRoot();
		if (root) logDocsScrollTargets(root);
	};

	let activeId = "";
	let syncScheduled = false;

	const setActive = (id: string) => {
		if (id === activeId) return;
		activeId = id;

		let activeLink: HTMLAnchorElement | undefined;
		for (const link of links) {
			const active = getLinkSectionId(link) === id;
			link.classList.toggle("is-active", active);
			if (active) {
				link.setAttribute("aria-current", "location");
				activeLink = link;
			} else {
				link.removeAttribute("aria-current");
			}
		}
		if (activeLink) scrollActiveTocLinkIntoView(activeLink);
	};

	const syncActiveFromScroll = () => {
		const root = getDocsScrollRoot();
		if (!(root instanceof HTMLElement)) return;
		const id = getActiveSectionId(sections, root);
		if (id) setActive(id);
	};

	const scheduleSync = () => {
		if (syncScheduled) return;
		syncScheduled = true;
		requestAnimationFrame(() => {
			syncScheduled = false;
			syncActiveFromScroll();
		});
	};

	const createSectionObserver = () => {
		const root = getDocsScrollRoot();
		if (!(root instanceof HTMLElement)) return null;

		const topOffset = getDocsScrollOffset(root);
		return new IntersectionObserver(
			() => {
				scheduleSync();
			},
			{
				root,
				rootMargin: `-${topOffset}px 0px -45% 0px`,
				threshold: [0, 0.25, 0.5, 0.75, 1],
			}
		);
	};

	let sectionObserver = createSectionObserver();
	if (sectionObserver) {
		for (const section of sections) {
			sectionObserver.observe(getSectionAnchor(section));
		}
	}

	for (const link of links) {
		link.addEventListener("click", (event) => {
			const id = getLinkSectionId(link);
			const target = document.getElementById(id);
			const root = getDocsScrollRoot();
			if (!target || !(root instanceof HTMLElement)) return;
			event.preventDefault();
			scrollDocsSectionIntoView(target, root, true);
			const hash = link.getAttribute("href")?.startsWith("#") ? link.getAttribute("href")! : `#${id}`;
			history.pushState(null, "", hash);
			setActive(id);
		});
	}

	scrollRoot.addEventListener("scroll", scheduleSync, {passive: true});
	scrollRoot.addEventListener("scrollend", scheduleSync, {passive: true});

	window.addEventListener("resize", () => {
		sectionObserver?.disconnect();
		sectionObserver = createSectionObserver();
		if (sectionObserver) {
			for (const section of sections) {
				sectionObserver.observe(getSectionAnchor(section));
			}
		}
		scheduleSync();
		const activeLink = links.find((link) => link.classList.contains("is-active"));
		if (activeLink) scrollActiveTocLinkIntoView(activeLink);
	});

	const hash = window.location.hash.slice(1);
	if (hash && sections.some((section) => section.id === hash)) {
		setActive(hash);
		const target = document.getElementById(hash);
		if (target) scrollDocsSectionIntoView(target, scrollRoot, false);
	} else {
		scheduleSync();
	}

	requestAnimationFrame(scheduleSync);
}

function getPreCodeText(pre: HTMLElement): string {
  const code = pre.querySelector("code");
  return getCodeText(code instanceof HTMLElement ? code : pre);
}

function initProseCopyButtons() {
  const proseBlocks = document.querySelectorAll(".prose pre:not(.code-block__pre)");
  proseBlocks.forEach((pre, index) => {
    if (!(pre instanceof HTMLElement)) return;

    const wrapper = document.createElement("div");
    wrapper.className = "prose-code-block";
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    if (!pre.id) {
      pre.id = `prose-pre-${index + 1}`;
    }

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "code-block__copy btn btn--primary btn--sm";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy code");
    copyBtn.setAttribute("aria-describedby", pre.id);
    copyBtn.addEventListener("click", () => {
      void copySnippet(getPreCodeText(pre), copyBtn);
    });
    wrapper.insertBefore(copyBtn, pre);
  });
}

function initDocsFrameworkSnippets() {
  const tabsRoot = document.getElementById("docs-framework-tabs");
  const snippetPre = document.getElementById("docs-framework-snippet");
  const copyBtn = document.getElementById("copy-docs-framework");
  if (!(tabsRoot instanceof HTMLElement) || !(snippetPre instanceof HTMLElement)) return;
  if (!(copyBtn instanceof HTMLButtonElement)) return;

  let selectedFramework: FrameworkId = FRAMEWORK_TABS[0]!.id;

  for (const { id, label } of FRAMEWORK_TABS) {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `code-tab${id === selectedFramework ? " is-active" : ""}`;
    tab.dataset.framework = id;
    tab.id = `docs-tab-fw-${id}`;
    tab.role = "tab";
    tab.setAttribute("aria-selected", String(id === selectedFramework));
    tab.setAttribute("aria-controls", "docs-framework-snippet");
    tab.tabIndex = id === selectedFramework ? 0 : -1;
    tab.textContent = label;
    tabsRoot.appendChild(tab);
  }

  const tabs = [...tabsRoot.querySelectorAll<HTMLButtonElement>(".code-tab[data-framework]")];

  const updateSnippet = () => {
    setHighlightedCode(
      snippetPre,
      getFrameworkSnippet(selectedFramework),
      inferFrameworkLang(selectedFramework),
    );
    const activeTab = tabs.find((tab) => tab.dataset.framework === selectedFramework);
    if (activeTab) {
      snippetPre.setAttribute("aria-labelledby", activeTab.id);
    }
  };

  const setActiveTab = (activeTab: HTMLButtonElement) => {
    for (const tab of tabs) {
      const active = tab === activeTab;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    }
  };

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      selectedFramework = tab.dataset.framework as FrameworkId;
      setActiveTab(tab);
      updateSnippet();
    });
  }

  copyBtn.addEventListener("click", () => {
    void copySnippet(getCodeText(snippetPre), copyBtn);
  });

  updateSnippet();
}

async function copySnippet(text: string, button: HTMLButtonElement) {
  const originalLabel = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied!";
    window.setTimeout(() => {
      button.textContent = originalLabel;
    }, 1500);
  } catch {
    button.textContent = "Copy failed";
    window.setTimeout(() => {
      button.textContent = originalLabel;
    }, 1500);
  }
}
