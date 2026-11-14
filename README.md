# ethannet-ui

The Next.js UI for ethannet, as a pnpm-workspace TypeScript monorepo. The backend, a Spring Boot photos-api, lives in its own repo: [ethannet](https://github.com/Ethan-S-Evans/ethannet).

## Layout

- [apps/ui](apps/ui) — Next.js app
- [apps/e2e](apps/e2e) — Playwright end-to-end tests covering the ui against a running photos-api
- [packages/schema](packages/schema) — the photos-api OpenAPI contract (vendored, pinned to a release) and TypeScript types generated from it
- [packages/messages](packages/messages) — the ui copy
- [packages/navigation](packages/navigation) — the site link config
- [docs](docs) — documentation, including plans

See [docs/architecture.md](docs/architecture.md) for how the pieces fit together, [docs/features/api-contract.md](docs/features/api-contract.md) for the contract workflow, and [docs/releasing.md](docs/releasing.md) for the branch, versioning and release workflow.

## Getting started

Start the photos-api first, from a checkout of [ethannet](https://github.com/Ethan-S-Evans/ethannet) next to this one (it needs JDK 25 and Podman):

```
cd ../ethannet
podman compose up -d postgres
./mvnw spring-boot:run
```

Then, in this repo:

```
pnpm install
pnpm dev
```

The ui runs on http://localhost:3000 and calls the photos-api on http://localhost:4001.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Run the ui in dev mode |
| `pnpm build` | Build all packages |
| `pnpm start` | Run the built ui |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run unit tests (Vitest) in all packages |
| `pnpm test:e2e` | Run Playwright end-to-end tests (needs the photos-api running) |
| `pnpm storybook` | Run Storybook for the ui's components |
| `pnpm lint` | Lint the whole repo with Biome, and check the generated API types are current |
| `pnpm format` | Format the whole repo with Biome |
| `pnpm check:api` | Check the generated API types match the vendored spec |
| `pnpm changeset` | Add a changeset describing the current branch's change |
| `pnpm version-packages` | Release only: apply pending changesets to versions and changelogs |
