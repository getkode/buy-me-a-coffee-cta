import { COFFEE_CUP_SVG } from "./svg.js";
import type { ResolvedCoffeeCtaConfig } from "./types.js";
import { applyConfig } from "./apply-config.js";

function parseSvgMarkup(svgString: string): SVGSVGElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.documentElement;
  if (!(svg instanceof SVGSVGElement)) {
    throw new Error("buy-me-a-coffee-cta: invalid SVG markup");
  }
  return svg;
}

export function createElement(config: ResolvedCoffeeCtaConfig): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.className = "coffee-cta";
  anchor.dataset.coffeeCta = "";
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";

  const cup = document.createElement("div");
  cup.className = "coffee-cta__cup";
  cup.setAttribute("aria-hidden", "true");

  const svgWrap = document.createElement("div");
  svgWrap.className = "coffee-cta__svg-wrap";
  svgWrap.appendChild(parseSvgMarkup(COFFEE_CUP_SVG));

  const tooltip = document.createElement("span");
  tooltip.className = "coffee-cta__tooltip";
  tooltip.setAttribute("aria-hidden", "true");

  const emoji = document.createElement("span");
  emoji.className = "coffee-cta__emoji";

  const label = document.createElement("span");
  label.className = "coffee-cta__label";

  tooltip.append(emoji, label);
  cup.append(svgWrap, tooltip);
  anchor.appendChild(cup);

  applyConfig(anchor, config);
  initPathLengths(anchor);

  return anchor;
}

export function initPathLengths(element: HTMLElement): void {
  const paths = element.querySelectorAll(".coffee-cta__cup svg path");
  paths.forEach((path) => {
    if (!(path instanceof SVGPathElement)) return;
    const len = Math.ceil(path.getTotalLength());
    path.style.setProperty("--len", String(len));
  });
}

export function resolveMountTarget(mount: Element | string): Element {
  if (typeof mount === "string") {
    const target = document.querySelector(mount);
    if (!target) {
      throw new Error(`buy-me-a-coffee-cta: mount target not found: ${mount}`);
    }
    return target;
  }
  return mount;
}

export function mountElement(
  element: HTMLAnchorElement,
  mount: Element | string,
): void {
  resolveMountTarget(mount).appendChild(element);
}

export function unmountElement(element: HTMLAnchorElement): void {
  element.remove();
}
