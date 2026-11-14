// Where the vendored OpenAPI spec comes from. The pin lives in this package's
// package.json under "mediaApi": { repo, path, ref }.

/**
 * Raw GitHub URL of the spec at the pinned ref.
 * @param {{ repo: string, path: string, ref: string | null }} source
 * @returns {string}
 */
export function specUrl({ repo, path, ref }) {
  if (!ref) {
    throw new Error(
      "No media-api ref is pinned yet. Run `pnpm --filter @ethannet/schema sync:api <tag>` once media-api has a release tag.",
    );
  }
  return `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
}

/**
 * A copy of `pkg` (this package's package.json) with `mediaApi.ref` set to `ref`,
 * and `mediaApi.path` set to `path` when given (for a release that moved the spec).
 * @template {{ mediaApi: { ref: string | null, path: string } }} P
 * @param {P} pkg
 * @param {string} ref
 * @param {string} [path]
 * @returns {P}
 */
export function withRef(pkg, ref, path) {
  if (!ref) {
    throw new Error("A media-api ref (tag, branch or commit) is required.");
  }
  return {
    ...pkg,
    mediaApi: { ...pkg.mediaApi, ref, ...(path ? { path } : {}) },
  };
}
