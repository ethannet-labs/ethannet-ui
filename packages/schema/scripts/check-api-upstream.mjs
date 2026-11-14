// Fails if the vendored openapi/media-api.yaml differs from the spec at the
// pinned media-api ref. Needs network access, so it isn't part of `pnpm lint`.
import { readFileSync } from "node:fs";
import { specUrl } from "./media-api-source.mjs";

const { mediaApi } = JSON.parse(readFileSync("package.json", "utf8"));
const url = specUrl(mediaApi);
const res = await fetch(url);
if (!res.ok) {
  console.error(`Fetching ${url} failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
if ((await res.text()) !== readFileSync("openapi/media-api.yaml", "utf8")) {
  console.error(
    `openapi/media-api.yaml differs from ${url}. Run \`pnpm --filter @ethannet/schema sync:api ${mediaApi.ref}\`.`,
  );
  process.exit(1);
}
console.log(`openapi/media-api.yaml matches media-api ${mediaApi.ref}.`);
