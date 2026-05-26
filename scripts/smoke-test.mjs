import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

function run(cmd, args, cwd = root) {
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

async function main() {
  console.log("Building package…");
  run("pnpm", ["build"]);
  run("pnpm", ["test"]);

  console.log("Packing tarball…");
  const packList = execFileSync("pnpm", ["pack", "--pack-destination", "/tmp"], {
    cwd: root,
    encoding: "utf8",
  });
  const tarballLine = packList
    .trim()
    .split("\n")
    .find((line) => line.endsWith(".tgz"));
  if (!tarballLine) {
    throw new Error("Could not find packed tarball path");
  }
  const tarball = tarballLine.trim();

  const workDir = await mkdtemp(join(tmpdir(), "buy-me-a-coffee-cta-smoke-"));
  console.log(`Smoke testing in ${workDir}`);

  try {
    await writeFile(
      join(workDir, "package.json"),
      JSON.stringify({ name: "smoke-test", private: true, type: "module" }, null, 2) + "\n",
    );

    run("pnpm", ["add", tarball], workDir);

    const cssPath = join(workDir, "node_modules/buy-me-a-coffee-cta/dist/style.css");
    const css = await readFile(cssPath, "utf8");
    if (!css.includes(".coffee-cta")) {
      throw new Error("style.css missing .coffee-cta rules");
    }

    const esmCheck = join(workDir, "check-esm.mjs");
    await writeFile(
      esmCheck,
      `import { createCoffeeCta, normalizeBmcUrl } from "buy-me-a-coffee-cta";

if (typeof createCoffeeCta !== "function") {
  throw new Error("createCoffeeCta export missing");
}
if (normalizeBmcUrl("demo") !== "https://buymeacoffee.com/demo") {
  throw new Error("normalizeBmcUrl failed");
}
console.log("ESM smoke test passed");
`,
    );
    run("node", ["check-esm.mjs"], workDir);

    const cjsCheck = join(workDir, "check-cjs.cjs");
    await writeFile(
      cjsCheck,
      `const { normalizeBmcUrl } = require("buy-me-a-coffee-cta");
if (normalizeBmcUrl("demo") !== "https://buymeacoffee.com/demo") {
  throw new Error("CJS normalizeBmcUrl failed");
}
console.log("CJS smoke test passed");
`,
    );
    run("node", ["check-cjs.cjs"], workDir);

    console.log("Smoke test passed.");
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
