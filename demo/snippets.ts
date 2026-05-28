export type FrameworkId =
  | "vanilla"
  | "react"
  | "vue"
  | "solid"
  | "angular"
  | "svelte";

export const INSTALL_COMMANDS: Record<"pnpm" | "npm" | "yarn", string> = {
  pnpm: "pnpm add buy-me-a-coffee-cta",
  npm: "npm install buy-me-a-coffee-cta",
  yarn: "yarn add buy-me-a-coffee-cta",
};

export const EXAMPLE_CONFIG = `{
  username: "yourname",
  label: "Buy me a coffee",
  emoji: "☕",
}`;

export const FRAMEWORK_TABS: {id: FrameworkId; label: string}[] = [
	{id: "vanilla", label: "Vanilla JS"},
	{id: "react", label: "React"},
	{id: "vue", label: "Vue"},
	{id: "solid", label: "Solid"},
	{id: "angular", label: "Angular"},
	{id: "svelte", label: "Svelte"},
];

export type FrameworkSnippetOptions = {
	/** Embed config as a module-level constant (playground copy). */
	embeddedConfig?: boolean;
	/** Mount into a framework ref instead of a CSS selector. */
	anchored?: boolean;
};

function indentBlock(block: string, spaces: number): string {
	const pad = " ".repeat(spaces);
	return block
		.split("\n")
		.map((line) => (line ? pad + line : line))
		.join("\n");
}

function stripAnchorFromConfig(configObject: string): string {
	const lines = configObject.trim().split("\n");
	const filtered = lines.filter((line) => !/^\s*anchor:/.test(line));

	if (filtered.length <= 2) {
		return filtered.join("\n");
	}

	const last = filtered.at(-1)!;
	if (last.trim() === "}") {
		const prev = filtered.at(-2)!;
		if (prev.trim().endsWith(",")) {
			filtered[filtered.length - 2] = prev.replace(/,\s*$/, "");
		}
	}

	return filtered.join("\n");
}

function configPropType(anchored: boolean): string {
	return anchored ? 'Omit<CoffeeCtaConfig, "anchor">' : "CoffeeCtaConfig";
}

function buildUsageComment(configObject: string, framework: FrameworkId): string {
	const configOneLine = configObject
		.trim()
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.join(" ");

	switch (framework) {
		case "react":
			return `// <BuyMeCoffeeCta config={${configOneLine}} />`;
		case "vue":
			return `<!-- <BuyMeCoffeeCta :config="ctaConfig" /> -->`;
		case "solid":
			return `// <BuyMeCoffeeCta {...ctaConfig} />`;
		case "angular":
			return `<!-- <app-buy-me-coffee-cta [config]="ctaConfig" /> -->`;
		case "svelte":
			return `<!-- <BuyMeCoffeeCta {config} /> -->`;
		default:
			return "";
	}
}

export function buildConfigObject(configLines: string[]): string {
	if (configLines.length === 0) {
		return `{
  username: "yourname",
  label: "Buy me a coffee",
}`;
	}
	return `{\n${configLines.join("\n")}\n}`;
}

export function buildConfigLines(options: {
	username: string;
	label: string;
	emoji?: string;
	size?: number;
	anchor?: string | null;
	position?: string;
	tooltipPosition?: string;
	themeBlock?: string;
	darkThemeBlock?: string;
	darkMode?: string;
	scrollBlock?: string;
}): string[] {
	const lines: string[] = [
		`  username: ${JSON.stringify(options.username)},`,
		`  label: ${JSON.stringify(options.label)},`,
	];

	if (options.emoji) lines.push(`  emoji: ${JSON.stringify(options.emoji)},`);
	if (options.size && options.size !== 40) lines.push(`  size: ${options.size},`);

	if (options.anchor) {
		lines.push(`  anchor: ${JSON.stringify(options.anchor)},`);
	} else if (options.position && options.position !== "bottom-right") {
		lines.push(`  position: ${JSON.stringify(options.position)},`);
	}

	if (options.tooltipPosition && options.tooltipPosition !== "auto") {
		lines.push(`  tooltipPosition: ${JSON.stringify(options.tooltipPosition)},`);
	}

	if (options.themeBlock) lines.push(options.themeBlock);
	if (options.darkThemeBlock) lines.push(options.darkThemeBlock);
	if (options.darkMode) lines.push(`  darkMode: ${JSON.stringify(options.darkMode)},`);
	if (options.scrollBlock) lines.push(options.scrollBlock);

	return lines;
}

export function getFrameworkSnippet(framework: FrameworkId, configObject: string = EXAMPLE_CONFIG): string {
	return wrapFrameworkSnippet(framework, configObject);
}

export function wrapFrameworkSnippet(
	framework: FrameworkId,
	configObject: string,
	options: FrameworkSnippetOptions = {}
): string {
	const embeddedConfig = options.embeddedConfig ?? false;
	const anchored = options.anchored ?? false;
	const config = anchored ? stripAnchorFromConfig(configObject) : configObject;
	const propType = configPropType(anchored);

	switch (framework) {
		case "vanilla":
			if (embeddedConfig) {
				if (anchored) {
					return `<div id="coffee-cta-anchor"></div>
<script type="module">
import { createCoffeeCta } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config = ${config};

const anchorEl = document.getElementById("coffee-cta-anchor");
if (!anchorEl) throw new Error("Missing #coffee-cta-anchor");

createCoffeeCta({ ...config, anchor: anchorEl });
</script>`;
				}

				return `<script type="module">
import { createCoffeeCta } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config = ${config};

createCoffeeCta(config);
</script>`;
			}

			return `import { createCoffeeCta } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

createCoffeeCta(${configObject});`;

		case "react":
			if (embeddedConfig) {
				if (anchored) {
					return `import { useEffect, useRef } from "react";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: ${propType} = ${config};

export function BuyMeCoffeeCta() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<CoffeeCtaInstance | undefined>(undefined);

  useEffect(() => {
    if (!anchorRef.current) return;
    ctaRef.current = createCoffeeCta({ ...config, anchor: anchorRef.current });
    return () => ctaRef.current?.destroy();
  }, []);

  return <div ref={anchorRef} />;
}`;
				}

				return `import { useEffect, useRef } from "react";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: CoffeeCtaConfig = ${config};

export function BuyMeCoffeeCta() {
  const ctaRef = useRef<CoffeeCtaInstance | undefined>(undefined);

  useEffect(() => {
    ctaRef.current = createCoffeeCta(config);
    return () => ctaRef.current?.destroy();
  }, []);

  return null;
}`;
			}

			if (anchored) {
				return `import { useEffect, useRef } from "react";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

type BuyMeCoffeeCtaProps = Omit<CoffeeCtaConfig, "anchor">;

export function BuyMeCoffeeCta({ config }: { config: BuyMeCoffeeCtaProps }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<CoffeeCtaInstance | undefined>(undefined);

  useEffect(() => {
    if (!anchorRef.current) return;
    ctaRef.current = createCoffeeCta({ ...config, anchor: anchorRef.current });
    return () => ctaRef.current?.destroy();
  }, []);

  useEffect(() => {
    ctaRef.current?.updateConfig(config);
  }, [config]);

  return <div ref={anchorRef} />;
}

${buildUsageComment(configObject, "react")}`;
			}

			return `import { useEffect, useRef } from "react";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

export function BuyMeCoffeeCta({ config }: { config: CoffeeCtaConfig }) {
  const ctaRef = useRef<CoffeeCtaInstance | undefined>(undefined);

  useEffect(() => {
    ctaRef.current = createCoffeeCta(config);
    return () => ctaRef.current?.destroy();
  }, []);

  useEffect(() => {
    ctaRef.current?.updateConfig(config);
  }, [config]);

  return null;
}

${buildUsageComment(configObject, "react")}`;

		case "vue":
			if (embeddedConfig) {
				if (anchored) {
					return `<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from "vue";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: ${propType} = ${indentBlock(config, 0).trim()};

const anchorEl = useTemplateRef<HTMLDivElement>("anchorEl");
const cta = shallowRef<CoffeeCtaInstance>();

onMounted(() => {
  if (!anchorEl.value) return;
  cta.value = createCoffeeCta({ ...config, anchor: anchorEl.value });
});

onUnmounted(() => {
  cta.value?.destroy();
});
</script>

<template>
  <div ref="anchorEl" />
</template>`;
				}

				return `<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from "vue";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: CoffeeCtaConfig = ${indentBlock(config, 0).trim()};

const cta = shallowRef<CoffeeCtaInstance>();

onMounted(() => {
  cta.value = createCoffeeCta(config);
});

onUnmounted(() => {
  cta.value?.destroy();
});
</script>`;
			}

			if (anchored) {
				return `<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from "vue";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const props = defineProps<{ config: ${propType} }>();
const anchorEl = useTemplateRef<HTMLDivElement>("anchorEl");
const cta = shallowRef<CoffeeCtaInstance>();

onMounted(() => {
  if (!anchorEl.value) return;
  cta.value = createCoffeeCta({ ...props.config, anchor: anchorEl.value });
});

watch(
  () => props.config,
  (next) => cta.value?.updateConfig(next),
  { deep: true },
);

onUnmounted(() => {
  cta.value?.destroy();
});
</script>

<template>
  <div ref="anchorEl" />
</template>

${buildUsageComment(configObject, "vue")}`;
			}

			return `<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, watch } from "vue";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const props = defineProps<{ config: CoffeeCtaConfig }>();
const cta = shallowRef<CoffeeCtaInstance>();

onMounted(() => {
  cta.value = createCoffeeCta(props.config);
});

watch(
  () => props.config,
  (next) => cta.value?.updateConfig(next),
  { deep: true },
);

onUnmounted(() => {
  cta.value?.destroy();
});
</script>

${buildUsageComment(configObject, "vue")}`;

		case "solid":
			if (embeddedConfig) {
				if (anchored) {
					return `import { onCleanup, onMount } from "solid-js";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: ${propType} = ${config};

export function BuyMeCoffeeCta() {
  let anchorEl: HTMLDivElement | undefined;
  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    if (!anchorEl) return;
    cta = createCoffeeCta({ ...config, anchor: anchorEl });
    onCleanup(() => cta?.destroy());
  });

  return <div ref={anchorEl} />;
}`;
				}

				return `import { onCleanup, onMount } from "solid-js";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: CoffeeCtaConfig = ${config};

export function BuyMeCoffeeCta() {
  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    cta = createCoffeeCta(config);
    onCleanup(() => cta!.destroy());
  });

  return null;
}`;
			}

			if (anchored) {
				return `import { createEffect, onCleanup, onMount } from "solid-js";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

export function BuyMeCoffeeCta(props: ${propType}) {
  let anchorEl: HTMLDivElement | undefined;
  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    if (!anchorEl) return;
    cta = createCoffeeCta({ ...props, anchor: anchorEl });
    onCleanup(() => cta?.destroy());
  });

  createEffect(() => {
    cta?.updateConfig(props);
  });

  return <div ref={anchorEl} />;
}

${buildUsageComment(configObject, "solid")}`;
			}

			return `import { createEffect, onCleanup, onMount } from "solid-js";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

export function BuyMeCoffeeCta(props: CoffeeCtaConfig) {
  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    cta = createCoffeeCta(props);
    onCleanup(() => cta!.destroy());
  });

  createEffect(() => {
    cta?.updateConfig(props);
  });

  return null;
}

${buildUsageComment(configObject, "solid")}`;

		case "angular":
			if (embeddedConfig) {
				if (anchored) {
					return `import { Component, ElementRef, OnDestroy, OnInit, viewChild } from "@angular/core";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: ${propType} = ${indentBlock(config, 0).trim()};

@Component({
  selector: "app-buy-me-coffee-cta",
  standalone: true,
  template: \`<div #anchor></div>\`,
})
export class BuyMeCoffeeCtaComponent implements OnInit, OnDestroy {
  private readonly anchor = viewChild.required<ElementRef<HTMLDivElement>>("anchor");
  private cta?: CoffeeCtaInstance;

  ngOnInit(): void {
    this.cta = createCoffeeCta({
      ...config,
      anchor: this.anchor().nativeElement,
    });
  }

  ngOnDestroy(): void {
    this.cta?.destroy();
  }
}`;
				}

				return `import { Component, OnDestroy, OnInit } from "@angular/core";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

const config: CoffeeCtaConfig = ${indentBlock(config, 0).trim()};

@Component({
  selector: "app-buy-me-coffee-cta",
  standalone: true,
  template: "",
})
export class BuyMeCoffeeCtaComponent implements OnInit, OnDestroy {
  private cta?: CoffeeCtaInstance;

  ngOnInit(): void {
    this.cta = createCoffeeCta(config);
  }

  ngOnDestroy(): void {
    this.cta?.destroy();
  }
}`;
			}

			if (anchored) {
				return `import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  viewChild,
} from "@angular/core";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

@Component({
  selector: "app-buy-me-coffee-cta",
  standalone: true,
  template: \`<div #anchor></div>\`,
})
export class BuyMeCoffeeCtaComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: ${propType};

  private readonly anchor = viewChild.required<ElementRef<HTMLDivElement>>("anchor");
  private cta?: CoffeeCtaInstance;

  ngOnInit(): void {
    this.cta = createCoffeeCta({
      ...this.config,
      anchor: this.anchor().nativeElement,
    });
  }

  ngOnChanges(): void {
    this.cta?.updateConfig(this.config);
  }

  ngOnDestroy(): void {
    this.cta?.destroy();
  }
}`;
			}

			return `import { Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
import "buy-me-a-coffee-cta/style.css";

@Component({
  selector: "app-buy-me-coffee-cta",
  standalone: true,
  template: "",
})
export class BuyMeCoffeeCtaComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: CoffeeCtaConfig;

  private cta?: CoffeeCtaInstance;

  ngOnInit(): void {
    this.cta = createCoffeeCta(this.config);
  }

  ngOnChanges(): void {
    this.cta?.updateConfig(this.config);
  }

  ngOnDestroy(): void {
    this.cta?.destroy();
  }
}

${buildUsageComment(configObject, "angular")}`;

		case "svelte":
			if (embeddedConfig) {
				if (anchored) {
					return `<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
  import "buy-me-a-coffee-cta/style.css";

  const config: ${propType} = ${indentBlock(config, 2).trimStart()};

  let anchorEl: HTMLDivElement | undefined;
  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    if (!anchorEl) return;
    cta = createCoffeeCta({ ...config, anchor: anchorEl });
  });

  onDestroy(() => {
    cta?.destroy();
  });
</script>

<div bind:this={anchorEl}></div>`;
				}

				return `<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
  import "buy-me-a-coffee-cta/style.css";

  const config: CoffeeCtaConfig = ${indentBlock(config, 2).trimStart()};

  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    cta = createCoffeeCta(config);
  });

  onDestroy(() => {
    cta?.destroy();
  });
</script>`;
			}

			if (anchored) {
				return `<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
  import "buy-me-a-coffee-cta/style.css";

  export let config: ${propType};

  let anchorEl: HTMLDivElement | undefined;
  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    if (!anchorEl) return;
    cta = createCoffeeCta({ ...config, anchor: anchorEl });
  });

  $: cta?.updateConfig(config);

  onDestroy(() => {
    cta?.destroy();
  });
</script>

<div bind:this={anchorEl}></div>

${buildUsageComment(configObject, "svelte")}`;
			}

			return `<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createCoffeeCta, type CoffeeCtaConfig, type CoffeeCtaInstance } from "buy-me-a-coffee-cta";
  import "buy-me-a-coffee-cta/style.css";

  export let config: CoffeeCtaConfig;

  let cta: CoffeeCtaInstance | undefined;

  onMount(() => {
    cta = createCoffeeCta(config);
  });

  $: cta?.updateConfig(config);

  onDestroy(() => {
    cta?.destroy();
  });
</script>

${buildUsageComment(configObject, "svelte")}`;
	}
}
