// Usage: pnpm --filter @ethannet/schema sync:api <ref>
// Fetches the photos-api OpenAPI spec at <ref> (normally a release tag such as
// v0.1.0), vendors it into openapi/photos-api.yaml, pins <ref> in package.json
// and regenerates the TypeScript types.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { specUrl, withRef } from "./photos-api-source.mjs";

const ref = process.argv[2];
const pkg = withRef(JSON.parse(readFileSync("package.json", "utf8")), ref);
const url = specUrl(pkg.photosApi);

const res = await fetch(url);
if (!res.ok) {
  console.error(`Fetching ${url} failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
writeFileSync("openapi/photos-api.yaml", await res.text());
writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
execFileSync("pnpm", ["run", "generate:api"], { stdio: "inherit" });
console.log(`Vendored the photos-api spec at ${ref}.`);
