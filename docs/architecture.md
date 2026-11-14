# Architecture

## Two repos

ethannet is split across two repos, one language each:

| Repo | What it is | Port |
| --- | --- | --- |
| **ethannet-ui** (this repo) | Next.js UI, its shared packages, Storybook and the Playwright e2e suite. TypeScript, pnpm. | ui 3000, Storybook 6006 |
| [**ethannet**](https://github.com/Ethan-S-Evans/ethannet) | The Spring Boot **photos-api** and its Postgres database. Java, Maven. It owns the API contract. | photos-api 4001, Postgres 5432 |

Each repo has its own toolchain, version and release cycle. Every dev server in both repos (ui, Storybook, photos-api, Postgres) listens on `127.0.0.1` only, so nothing is reachable from the network; the ui's `dev`, `start` and `storybook` scripts pass `-H 127.0.0.1` / `--host 127.0.0.1` for this. The UI talks to the photos-api only over HTTP, through the OpenAPI contract described in [API contract](features/api-contract.md). The plan behind the split is [2026-11-12-spring-boot-photos-api](plans/2026-11-12-spring-boot-photos-api.md).

## Monorepo layout

- `apps/ui` — Next.js app (App Router, TypeScript). Async server components fetch the photos-api at `NEXT_PUBLIC_API_URL` (default `http://localhost:4001`).
- `apps/e2e` — Playwright end-to-end tests that drive the ui in a real browser against a running photos-api. It's a workspace package rather than living inside the ui, so it can import the shared packages like any other consumer.
- `packages/schema` — the photos-api contract as the ui consumes it: a vendored copy of the OpenAPI spec, pinned to a photos-api release, and TypeScript types generated from it. See [API contract](features/api-contract.md).
- `packages/messages` — the ui copy as next-intl-style JSON (`messages/en.json`), and the `UiMessages` type it must satisfy. Shared by ui components and stories. See [UI messages](features/ui-messages.md).
- `packages/navigation` — the site link config (`navLinks`, `socialLinks`: each a route plus the message key of its label), its `LinkConfig`/`NavLinkId`/`SocialLinkId` types, and `resolveLinks`. Shared by the ui layout and the e2e suite. See [Site layout](features/site-layout.md).
- `docs` — documentation for this repo: [plans](plans) (one per piece of work, named `YYYY-MM-DD-short-slug.md`) and [features](features), which describe how each feature works and how to test it.

`apps/` holds things that run; `packages/` holds things apps import. This mirrors the convention used by Turborepo, Vercel's examples, and the T3 stack.

## Where types live

- **API contract types** come from `@ethannet/schema`, generated from the spec. Never hand-write a type for an API response.
- **Types a package needs** live in that package: `UiMessages` in `@ethannet/messages`, link config types in `@ethannet/navigation`. Packages never import from apps.
- **Types only the ui uses** live in `apps/ui/src/types/` (for example `NavLink`, `SocialLink`) and are imported as `@/types`.

## Shared packages, no build step

Each package in `packages/` points its `main`/`types`/`exports` directly at `./src/index.ts`: real TypeScript source, not compiled output. pnpm symlinks `node_modules/@ethannet/<name>` to the package folder, so consumers resolve it straight to source.

- **Next.js** normally refuses to process `.ts` files under `node_modules`, even symlinked workspace ones. `transpilePackages: ["@ethannet/messages", "@ethannet/navigation", "@ethannet/schema"]` in `apps/ui/next.config.ts` is the documented escape hatch for monorepo-internal packages. Any new internal package the ui imports needs adding there.
- `@ethannet/schema` is type-only, so consumers use `import type` and nothing from it exists at runtime. `packages/messages` and `packages/navigation` are runtime imports (a JSON object, plain arrays and a function).

## Tooling

- **Biome** — a single root `biome.json` handles linting and formatting for the whole repo (replaces ESLint + Prettier). It ignores the generated `packages/schema/src/generated/`.
- **openapi-typescript** — generates `packages/schema/src/generated/photos-api.ts` from the vendored spec. `pnpm lint` also runs `check:api`, which fails if the generated file is stale.
- **Vitest** — unit tests, scoped per package. The ui tests presentational components with `@testing-library/react` (`jsdom` environment), using `@testing-library/user-event` for realistic clicks and key presses.
- **CSS Modules** — the ui's styling approach. Each component has an `X.module.css` beside it; global resets and color variables live in `apps/ui/src/app/globals.css`. No CSS framework.
- **Storybook** — lives in `apps/ui` (via `@storybook/nextjs`) for developing UI components in isolation. It doubles as the UI documentation: each story file uses autodocs.
- **Changesets** — manages the single shared version of every package in this repo; see [Branching, versioning and releasing](releasing.md).
- **Playwright** — lives in `apps/e2e`. It starts the ui dev server itself (via `webServer`) but not the photos-api, which runs from its own repo. A `globalSetup` checks `PHOTOS_API_URL/actuator/health` (default `http://localhost:4001`) first and fails with instructions if the api isn't up.
