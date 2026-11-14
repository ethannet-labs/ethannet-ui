// Usage: pnpm --filter @ethannet/schema sync:api <ref> [path]
// Fetches the media-api OpenAPI spec at <ref> (normally a release tag such as
// v0.1.0), vendors it into openapi/media-api.yaml, pins <ref> in package.json
// and regenerates the TypeScript types. Pass [path] when the release moved the
// spec within the media-api repo (it's then saved as the new mediaApi.path).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { specUrl, withRef } from "./media-api-source.mjs";

const ref = process.argv[2];
const pkg = withRef(
  JSON.parse(readFileSync("package.json", "utf8")),
  ref,
  process.argv[3],
);
const url = specUrl(pkg.mediaApi);

const res = await fetch(url);
if (!res.ok) {
  console.error(`Fetching ${url} failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
writeFileSync("openapi/media-api.yaml", await res.text());
writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
execFileSync("pnpm", ["run", "generate:api"], { stdio: "inherit" });
console.log(`Vendored the media-api spec at ${ref}.`);
