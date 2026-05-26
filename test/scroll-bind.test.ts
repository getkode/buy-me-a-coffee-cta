import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyReducedMotion, bindScroll, resolveScrollTarget } from "../src/scroll.js";

function flushAnimationFrame() {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => resolve());
	});
}

function clearBody() {
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
}

function createScrollContainer(height = 2000, clientHeight = 500) {
	const container = document.createElement("div");
	container.className = "scroll-panel";
	Object.defineProperty(container, "scrollTop", { writable: true, configurable: true, value: 0 });
	Object.defineProperty(container, "scrollHeight", { configurable: true, value: height });
	Object.defineProperty(container, "clientHeight", { configurable: true, value: clientHeight });
	document.body.appendChild(container);
	return container;
}

describe("resolveScrollTarget", () => {
	beforeEach(clearBody);
	afterEach(clearBody);

	it("returns window when target is omitted", () => {
		expect(resolveScrollTarget()).toBe(window);
		expect(resolveScrollTarget(null)).toBe(window);
	});

	it("throws when a selector does not match", () => {
		expect(() => resolveScrollTarget(".missing-target")).toThrow(/scroll target not found/);
	});

	it("returns the element for a valid selector", () => {
		const el = document.createElement("div");
		el.className = "panel";
		document.body.appendChild(el);
		expect(resolveScrollTarget(".panel")).toBe(el);
	});
});

describe("bindScroll", () => {
	beforeEach(clearBody);
	afterEach(clearBody);

	it("updates css vars and visibility classes when the target scrolls", async () => {
		const container = createScrollContainer();
		const element = document.createElement("a");
		document.body.appendChild(element);

		const onBottomChange = vi.fn();
		const controller = bindScroll(
			element,
			{
				target: container,
				fillDelay: 0.12,
				bottomThreshold: 4,
				reverse: false,
			},
			onBottomChange,
		);

		expect(element.classList.contains("is-hidden")).toBe(true);

		container.scrollTop = 800;
		container.dispatchEvent(new Event("scroll"));
		await flushAnimationFrame();

		expect(Number(element.style.getPropertyValue("--progress"))).toBeGreaterThan(0);
		expect(element.classList.contains("is-hidden")).toBe(false);

		container.scrollTop = container.scrollHeight - container.clientHeight;
		container.dispatchEvent(new Event("scroll"));
		await flushAnimationFrame();

		expect(element.classList.contains("is-bottom")).toBe(true);
		expect(element.classList.contains("is-active")).toBe(false);
		expect(onBottomChange).toHaveBeenCalledWith(true);

		controller.destroy();
	});
});

describe("applyReducedMotion", () => {
	it("applies full state when reduced motion is preferred", () => {
		window.matchMedia = vi.fn((query: string) => ({
			matches: query === "(prefers-reduced-motion: reduce)",
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})) as unknown as typeof window.matchMedia;

		const element = document.createElement("a");
		const applied = applyReducedMotion(element);

		expect(applied).toBe(true);
		expect(element.classList.contains("coffee-cta--reduced")).toBe(true);
		expect(element.classList.contains("is-bottom")).toBe(true);
		expect(element.style.getPropertyValue("--progress")).toBe("1");
		expect(element.style.getPropertyValue("--fill")).toBe("1");
	});
});
