import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const validExamples = new Set([
  "react",
  "vue",
  "solid",
  "angular",
  "svelte",
  "vanilla-js",
]);

function run(cmd, args, cwd = root) {
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

async function main() {
  const exampleId = process.argv[2];
  if (!exampleId || !validExamples.has(exampleId)) {
    throw new Error(
      `Usage: node setup-example.mjs <${[...validExamples].join("|")}>`,
    );
  }

  const exampleDir = join(root, "examples", exampleId);
  const packDir = join(exampleDir, ".tarball");

  console.log("Building buy-me-a-coffee-cta…");
  run("pnpm", ["build"]);

  await mkdir(packDir, { recursive: true });

  console.log("Packing tarball…");
  const packList = execFileSync("pnpm", ["pack", "--pack-destination", packDir], {
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
  const tarballName = tarballLine.trim().split("/").pop();

  const examplePkgPath = join(exampleDir, "package.json");
  const examplePkg = JSON.parse(await readFile(examplePkgPath, "utf8"));
  examplePkg.dependencies ??= {};
  examplePkg.dependencies["buy-me-a-coffee-cta"] = `file:.tarball/${tarballName}`;
  await writeFile(examplePkgPath, `${JSON.stringify(examplePkg, null, 2)}\n`);

  console.log(`Installing ${tarballName} in examples/${exampleId}…`);
  run("pnpm", ["install"], exampleDir);

  console.log(`${exampleId} example ready. Run: pnpm example:${exampleId.replace("-js", "")}:dev`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
