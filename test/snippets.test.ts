import { describe, expect, it } from "vitest";
import { wrapFrameworkSnippet } from "../demo/snippets.js";

describe("wrapFrameworkSnippet", () => {
  it("generates React docs snippet with updateConfig", () => {
    const snippet = wrapFrameworkSnippet("react", `{
  username: "yourname",
  label: "Buy me a coffee",
}`);

    expect(snippet).toContain("useRef");
    expect(snippet).toContain("updateConfig");
    expect(snippet).toContain("// <BuyMeCoffeeCta");
  });

  it("generates embedded React snippet with ref element", () => {
    const snippet = wrapFrameworkSnippet(
      "react",
      `{
  username: "yourname",
}`,
      { embeddedConfig: true },
    );

    expect(snippet).toContain("const config: CoffeeCtaConfig");
    expect(snippet).toContain("anchorRef");
    expect(snippet).toContain('<div ref={anchorRef} />');
    expect(snippet).not.toContain("updateConfig");
    expect(snippet).not.toContain("return null");
  });

  it("uses ref container for anchored React snippets", () => {
    const snippet = wrapFrameworkSnippet(
      "react",
      `{
  username: "yourname",
  anchor: "#main",
}`,
      { embeddedConfig: true, anchored: true },
    );

    expect(snippet).toContain("anchorRef");
    expect(snippet).toContain("anchor: anchorRef.current");
    expect(snippet).not.toContain('anchor: "#main"');
  });

  it("generates embedded vanilla snippet with ref element", () => {
    const snippet = wrapFrameworkSnippet(
      "vanilla",
      `{
  username: "yourname",
}`,
      { embeddedConfig: true },
    );

    expect(snippet).toContain('<div id="coffee-cta-root"></div>');
    expect(snippet).toContain("createCoffeeCta(config)");
  });

  it("generates anchored vanilla snippet with getElementById ref", () => {
    const snippet = wrapFrameworkSnippet(
      "vanilla",
      `{
  username: "yourname",
  anchor: "#main",
}`,
      { embeddedConfig: true, anchored: true },
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
      { embeddedConfig: true, anchored: true },
    );

    expect(snippet).toContain(`username: "yourname"\n}`);
  });
});
