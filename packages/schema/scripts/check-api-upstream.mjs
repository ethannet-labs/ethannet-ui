// Fails if the vendored openapi/photos-api.yaml differs from the spec at the
// pinned photos-api ref. Needs network access, so it isn't part of `pnpm lint`.
import { readFileSync } from "node:fs";
import { specUrl } from "./photos-api-source.mjs";

const { photosApi } = JSON.parse(readFileSync("package.json", "utf8"));
const url = specUrl(photosApi);
const res = await fetch(url);
if (!res.ok) {
  console.error(`Fetching ${url} failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
if ((await res.text()) !== readFileSync("openapi/photos-api.yaml", "utf8")) {
  console.error(
    `openapi/photos-api.yaml differs from ${url}. Run \`pnpm --filter @ethannet/schema sync:api ${photosApi.ref}\`.`,
  );
  process.exit(1);
}
console.log(`openapi/photos-api.yaml matches photos-api ${photosApi.ref}.`);
