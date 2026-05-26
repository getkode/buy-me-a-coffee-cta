import { COFFEE_CUP_SVG } from "../src/svg.js";

export function mountBmcIconSvg(link: HTMLElement | null) {
  const host = link?.querySelector<SVGSVGElement>(".icon-link__svg--bmc");
  if (!host || host.querySelector("path")) return;

  const doc = new DOMParser().parseFromString(COFFEE_CUP_SVG, "image/svg+xml");
  for (const path of doc.querySelectorAll("path")) {
    const node = path.cloneNode(true) as SVGPathElement;
    if (node.classList.contains("coffee-cta__body")) {
      node.classList.replace("coffee-cta__body", "bmc-icon__body");
    } else if (node.classList.contains("coffee-cta__outline")) {
      node.classList.replace("coffee-cta__outline", "bmc-icon__outline");
    }
    host.appendChild(node);
  }
}

export function syncBmcIconTheme(
  link: HTMLElement | null,
  theme: { yellow: string; ink: string },
) {
  if (!link) return;
  link.style.setProperty("--bmc-icon-coffee", theme.yellow);
  link.style.setProperty("--bmc-icon-ink", theme.ink);
}
