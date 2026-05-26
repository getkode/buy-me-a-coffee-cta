import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["test/**/*.test.ts"],
		coverage: {
			provider: "v8",
			include: ["src/**/*.ts"],
			exclude: ["src/index.ts", "src/svg.ts"],
			thresholds: {
				lines: 70,
				functions: 70,
				statements: 70,
				branches: 65,
			},
		},
	},
});
