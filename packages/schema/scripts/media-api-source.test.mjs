import { describe, expect, it } from "vitest";
import { specUrl, withRef } from "./media-api-source.mjs";

const source = {
  repo: "Ethan-S-Evans/ethannet-media",
  path: "openapi/media-api.yaml",
  ref: "v0.1.0",
};

describe("specUrl", () => {
  it("points at the raw spec file in the media-api repo at the pinned ref", () => {
    expect(specUrl(source)).toBe(
      "https://raw.githubusercontent.com/Ethan-S-Evans/ethannet-media/v0.1.0/openapi/media-api.yaml",
    );
  });

  it("throws when no ref is pinned yet", () => {
    expect(() => specUrl({ ...source, ref: null })).toThrow(
      /no media-api ref/i,
    );
  });
});

describe("withRef", () => {
  it("returns a copy of package.json with the new ref, leaving the rest alone", () => {
    const pkg = {
      name: "@ethannet/schema",
      mediaApi: { ...source, ref: null },
    };
    const next = withRef(pkg, "v0.2.0");
    expect(next.mediaApi).toEqual({ ...source, ref: "v0.2.0" });
    expect(next.name).toBe("@ethannet/schema");
    expect(pkg.mediaApi.ref).toBeNull();
  });

  it("rejects an empty ref", () => {
    expect(() => withRef({ mediaApi: source }, "")).toThrow(/ref/i);
  });
});

describe("withRef with a new path", () => {
  it("also moves the spec path when one is given", () => {
    const pkg = { mediaApi: { ...source, path: "openapi/photos-api.yaml" } };
    const next = withRef(pkg, "v0.2.0", "openapi/media-api.yaml");
    expect(next.mediaApi).toEqual({
      ...source,
      ref: "v0.2.0",
      path: "openapi/media-api.yaml",
    });
  });

  it("keeps the current path when none is given", () => {
    const pkg = { mediaApi: { ...source, path: "openapi/photos-api.yaml" } };
    expect(withRef(pkg, "v0.2.0").mediaApi.path).toBe(
      "openapi/photos-api.yaml",
    );
  });
});
