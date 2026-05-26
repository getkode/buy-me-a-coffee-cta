import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const src = resolve(root, "src/styles.css");
const dest = resolve(root, "dist/style.css");

await mkdir(dirname(dest), { recursive: true });
await copyFile(src, dest);
console.log("Copied src/styles.css → dist/style.css");
