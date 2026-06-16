import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { createRequire } from "module";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const cliPackagePath = require.resolve("@openuidev/cli/package.json");
const cliPath = join(dirname(cliPackagePath), "dist", "index.js");
const entryPath = join(projectRoot, "src", "library.ts");
const outPath = join(projectRoot, "src", "generated", "system-prompt.txt");

if (!existsSync(cliPath)) {
  throw new Error(`OpenUI CLI not found at ${cliPath}`);
}

const result = spawnSync(
  process.execPath,
  [cliPath, "generate", entryPath, "--out", outPath],
  {
    cwd: tmpdir(),
    stdio: "inherit",
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
