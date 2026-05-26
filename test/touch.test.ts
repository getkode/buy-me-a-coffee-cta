import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bindTouch } from "../src/touch.js";

function mockMatchMedia(matchesByQuery: Record<string, boolean>) {
	window.matchMedia = vi.fn((query: string) => ({
		matches: matchesByQuery[query] ?? false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})) as unknown as typeof window.matchMedia;
}

function clearBody() {
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
}

describe("bindTouch", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		clearBody();
		mockMatchMedia({
			"(hover: hover) and (pointer: fine)": false,
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		clearBody();
	});

	it("activates on touch and auto-hides after touchHideMs", () => {
		const element = document.createElement("a");
		document.body.appendChild(element);

		const controller = bindTouch(element, 500);
		element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
		expect(element.classList.contains("is-active")).toBe(true);

		element.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
		vi.advanceTimersByTime(499);
		expect(element.classList.contains("is-active")).toBe(true);

		vi.advanceTimersByTime(1);
		expect(element.classList.contains("is-active")).toBe(false);

		controller.destroy();
	});

	it("does not activate when hidden or at bottom", () => {
		const element = document.createElement("a");
		element.classList.add("is-hidden");
		document.body.appendChild(element);

		const controller = bindTouch(element, 500);
		element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
		expect(element.classList.contains("is-active")).toBe(false);

		element.classList.remove("is-hidden");
		element.classList.add("is-bottom");
		element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
		expect(element.classList.contains("is-active")).toBe(false);

		controller.destroy();
	});

	it("dismisses active state when tapping outside", () => {
		const element = document.createElement("a");
		const outside = document.createElement("button");
		document.body.append(element, outside);

		const controller = bindTouch(element, 2000);
		element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
		expect(element.classList.contains("is-active")).toBe(true);

		outside.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
		expect(element.classList.contains("is-active")).toBe(false);

		controller.destroy();
	});

	it("ignores touch feedback on fine pointer devices", () => {
		mockMatchMedia({
			"(hover: hover) and (pointer: fine)": true,
		});

		const element = document.createElement("a");
		document.body.appendChild(element);

		const controller = bindTouch(element, 500);
		element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
		expect(element.classList.contains("is-active")).toBe(false);

		controller.destroy();
	});
});
