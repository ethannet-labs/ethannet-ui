// Fails if src/generated/media-api.ts is out of date with openapi/media-api.yaml.
// Regenerates into a temp file and compares, so the committed file is untouched.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const committed = "src/generated/media-api.ts";
const dir = mkdtempSync(join(tmpdir(), "check-api-"));
const fresh = join(dir, "media-api.ts");

try {
  execFileSync(
    "pnpm",
    ["exec", "openapi-typescript", "openapi/media-api.yaml", "-o", fresh],
    { stdio: "ignore" },
  );
  if (readFileSync(fresh, "utf8") !== readFileSync(committed, "utf8")) {
    console.error(
      `${committed} is out of date with openapi/media-api.yaml. Run \`pnpm --filter @ethannet/schema generate:api\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`${committed} matches openapi/media-api.yaml.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
