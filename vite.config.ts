import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const pagesBase = "/buy-me-a-coffee-cta/";

export default defineConfig({
	base: process.env.GITHUB_ACTIONS ? pagesBase : "/",
	root: resolve(rootDir, "demo"),
	build: {
		rollupOptions: {
			input: {
				main: resolve(rootDir, "demo/index.html"),
				docs: resolve(rootDir, "demo/docs.html"),
				about: resolve(rootDir, "demo/about.html"),
			},
		},
	},
	resolve: {
		alias: [
			{
				find: "buy-me-a-coffee-cta/style.css",
				replacement: resolve(rootDir, "src/styles.css"),
			},
			{
				find: "buy-me-a-coffee-cta",
				replacement: resolve(rootDir, "src/index.ts"),
			},
		],
	},
});
