// Where the vendored OpenAPI spec comes from. The pin lives in this package's
// package.json under "photosApi": { repo, path, ref }.

/**
 * Raw GitHub URL of the spec at the pinned ref.
 * @param {{ repo: string, path: string, ref: string | null }} source
 * @returns {string}
 */
export function specUrl({ repo, path, ref }) {
  if (!ref) {
    throw new Error(
      "No photos-api ref is pinned yet. Run `pnpm --filter @ethannet/schema sync:api <tag>` once photos-api has a release tag.",
    );
  }
  return `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
}

/**
 * A copy of `pkg` (this package's package.json) with `photosApi.ref` set to `ref`.
 * @template {{ photosApi: { ref: string | null } }} P
 * @param {P} pkg
 * @param {string} ref
 * @returns {P}
 */
export function withRef(pkg, ref) {
  if (!ref) {
    throw new Error("A photos-api ref (tag, branch or commit) is required.");
  }
  return { ...pkg, photosApi: { ...pkg.photosApi, ref } };
}
