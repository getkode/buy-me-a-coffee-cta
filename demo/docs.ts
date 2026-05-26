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

function getDocsScrollRoot(): HTMLElement | null {
	return document.querySelector("main.page--docs");
}

function getDocsScrollOffset(scrollRoot: HTMLElement): number {
	const toc = scrollRoot.querySelector(".page__sidebar.page__toc");
	if (!(toc instanceof HTMLElement)) return 12;
	const style = getComputedStyle(toc);
	if (style.position !== "sticky") return 12;
	return Math.ceil(toc.getBoundingClientRect().height) + 8;
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

function initDocsSidebar() {
	const scrollRoot = getDocsScrollRoot();
	const links = [...document.querySelectorAll<HTMLAnchorElement>(".page__sidebar .page__toc-list a")];
	const sections = links
		.map((link) => document.querySelector(link.getAttribute("href") ?? ""))
		.filter((section): section is HTMLElement => section instanceof HTMLElement);
	if (sections.length === 0 || !(scrollRoot instanceof HTMLElement)) return;

	const setActive = (id: string) => {
		let activeLink: HTMLAnchorElement | undefined;
		for (const link of links) {
			const active = link.hash === `#${id}`;
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

	for (const link of links) {
		link.addEventListener("click", (event) => {
			const id = link.hash.slice(1);
			const target = document.getElementById(id);
			if (!target) return;
			event.preventDefault();
			scrollDocsSectionIntoView(target, scrollRoot, true);
			history.pushState(null, "", link.hash);
			setActive(id);
		});
	}

	const createObserver = () => {
		const topOffset = getDocsScrollOffset(scrollRoot);
		return new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				const section = visible[0]?.target;
				if (section instanceof HTMLElement && section.id) {
					setActive(section.id);
				}
			},
			{
				root: scrollRoot,
				rootMargin: `-${topOffset}px 0px -55% 0px`,
				threshold: 0,
			}
		);
	};

	let observer = createObserver();
	for (const section of sections) {
		observer.observe(section);
	}

	window.addEventListener("resize", () => {
		observer.disconnect();
		observer = createObserver();
		for (const section of sections) {
			observer.observe(section);
		}
		const activeLink = links.find((link) => link.classList.contains("is-active"));
		if (activeLink) scrollActiveTocLinkIntoView(activeLink);
	});

	const hash = window.location.hash.slice(1);
	if (hash && sections.some((section) => section.id === hash)) {
		setActive(hash);
		const target = document.getElementById(hash);
		if (target) scrollDocsSectionIntoView(target, scrollRoot, false);
	} else if (sections[0]) {
		setActive(sections[0].id);
	}
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
