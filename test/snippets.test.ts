import { describe, expect, it } from "vitest";
import { wrapFrameworkSnippet } from "../demo/snippets.js";

describe("wrapFrameworkSnippet", () => {
	it("generates React docs snippet with config prop and updateConfig", () => {
		const snippet = wrapFrameworkSnippet(
			"react",
			`{
  username: "yourname",
  label: "Buy me a coffee",
}`
		);

		expect(snippet).toContain("{ config }");
		expect(snippet).toContain("useRef");
		expect(snippet).toContain("updateConfig");
		expect(snippet).toContain('config={{ username: "yourname"');
	});

	it("generates embedded React snippet without anchor container", () => {
		const snippet = wrapFrameworkSnippet(
			"react",
			`{
  username: "yourname",
}`,
			{embeddedConfig: true}
		);

		expect(snippet).toContain("const config: CoffeeCtaConfig");
		expect(snippet).toContain("return null");
		expect(snippet).not.toContain("updateConfig");
		expect(snippet).not.toContain("anchorRef");
	});

	it("uses ref container for anchored React snippets", () => {
		const snippet = wrapFrameworkSnippet(
			"react",
			`{
  username: "yourname",
  anchor: "#main",
}`,
			{embeddedConfig: true, anchored: true}
		);

		expect(snippet).toContain("anchorRef");
		expect(snippet).toContain("anchor: anchorRef.current");
		expect(snippet).not.toContain('anchor: "#main"');
	});

	it("generates Vue docs snippet with config prop", () => {
		const snippet = wrapFrameworkSnippet(
			"vue",
			`{
  username: "yourname",
  label: "Buy me a coffee",
}`
		);

		expect(snippet).toContain("defineProps<{ config: CoffeeCtaConfig }>()");
		expect(snippet).toContain("props.config");
		expect(snippet).toContain(':config="ctaConfig"');
	});

	it("generates embedded vanilla snippet", () => {
		const snippet = wrapFrameworkSnippet(
			"vanilla",
			`{
  username: "yourname",
}`,
			{embeddedConfig: true}
		);

		expect(snippet).toContain("createCoffeeCta(config)");
		expect(snippet).not.toContain("coffee-cta-root");
	});

	it("generates anchored vanilla snippet with getElementById ref", () => {
		const snippet = wrapFrameworkSnippet(
			"vanilla",
			`{
  username: "yourname",
  anchor: "#main",
}`,
			{embeddedConfig: true, anchored: true}
		);

		expect(snippet).toContain('<div id="coffee-cta-anchor"></div>');
		expect(snippet).toContain('getElementById("coffee-cta-anchor")');
		expect(snippet).toContain("anchor: anchorEl");
	});

	it("strips trailing comma when anchor is the only extra field", () => {
		const snippet = wrapFrameworkSnippet(
			"react",
			`{
  username: "yourname",
  anchor: "#main",
}`,
			{embeddedConfig: true, anchored: true}
		);

		expect(snippet).toContain(`username: "yourname"\n}`);
	});

	it("generates Solid usage comment with spread props", () => {
		const snippet = wrapFrameworkSnippet("solid", EXAMPLE_CONFIG);
		expect(snippet).toContain("<BuyMeCoffeeCta {...ctaConfig} />");
	});

	it("generates Angular usage comment with config input", () => {
		const snippet = wrapFrameworkSnippet("angular", EXAMPLE_CONFIG);
		expect(snippet).toContain('[config]="ctaConfig"');
	});
});

const EXAMPLE_CONFIG = `{
  username: "yourname",
  label: "Buy me a coffee",
  emoji: "☕",
}`;
