import type { components } from "./generated/media-api";

/**
 * Greeting returned by `GET /api/hello`: a human-readable `message` and the ISO
 * 8601 `timestamp` the api built it at.
 *
 * Generated from `openapi/media-api.yaml`, the source of truth for the
 * media-api contract. Change the spec, then run `generate:api`; never edit
 * the generated file.
 */
export type HelloResponse = components["schemas"]["HelloResponse"];
