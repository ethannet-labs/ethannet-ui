import { describe, expect, it } from "vitest";
import { specUrl, withRef } from "./photos-api-source.mjs";

const source = {
  repo: "Ethan-S-Evans/ethannet",
  path: "openapi/photos-api.yaml",
  ref: "v0.1.0",
};

describe("specUrl", () => {
  it("points at the raw spec file in the photos-api repo at the pinned ref", () => {
    expect(specUrl(source)).toBe(
      "https://raw.githubusercontent.com/Ethan-S-Evans/ethannet/v0.1.0/openapi/photos-api.yaml",
    );
  });

  it("throws when no ref is pinned yet", () => {
    expect(() => specUrl({ ...source, ref: null })).toThrow(
      /no photos-api ref/i,
    );
  });
});

describe("withRef", () => {
  it("returns a copy of package.json with the new ref, leaving the rest alone", () => {
    const pkg = {
      name: "@ethannet/schema",
      photosApi: { ...source, ref: null },
    };
    const next = withRef(pkg, "v0.2.0");
    expect(next.photosApi).toEqual({ ...source, ref: "v0.2.0" });
    expect(next.name).toBe("@ethannet/schema");
    expect(pkg.photosApi.ref).toBeNull();
  });

  it("rejects an empty ref", () => {
    expect(() => withRef({ photosApi: source }, "")).toThrow(/ref/i);
  });
});
