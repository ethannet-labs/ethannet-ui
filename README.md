# ethannet-ui

The Next.js UI for ethannet, as a pnpm-workspace TypeScript monorepo. The backend, a Spring Boot media-api, lives in its own repo: [ethannet-media](https://github.com/ethannet-labs/ethannet-media).

## Layout

- [apps/ui](apps/ui) — Next.js app
- [apps/e2e](apps/e2e) — Playwright end-to-end tests covering the ui against a running media-api
- [packages/schema](packages/schema) — the media-api OpenAPI contract (vendored, pinned to a release) and TypeScript types generated from it
- [packages/messages](packages/messages) — the ui copy
- [packages/navigation](packages/navigation) — the site link config
- [docs](docs) — documentation, including plans

See [docs/architecture.md](docs/architecture.md) for how the pieces fit together, [docs/features/api-contract.md](docs/features/api-contract.md) for the contract workflow, and [docs/releasing.md](docs/releasing.md) for the branch, versioning and release workflow.

## Getting started

Start the media-api first, from a checkout of [ethannet-media](https://github.com/ethannet-labs/ethannet-media) next to this one (it needs JDK 25 and Podman):

```
cd ../ethannet-media
podman compose up -d postgres
./mvnw spring-boot:run
```

Then, in this repo:

```
pnpm install
pnpm dev
```

The ui runs on http://localhost:3000 and calls the media-api on http://localhost:4001. Both, and Storybook, listen on `127.0.0.1` only, so they're never reachable from the network.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Run the ui in dev mode |
| `pnpm build` | Build all packages |
| `pnpm start` | Run the built ui |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run unit tests (Vitest) in all packages |
| `pnpm test:e2e` | Run Playwright end-to-end tests (needs the media-api running) |
| `pnpm storybook` | Run Storybook for the ui's components |
| `pnpm lint` | Lint the whole repo with Biome, and check the generated API types are current |
| `pnpm format` | Format the whole repo with Biome |
| `pnpm check:api` | Check the generated API types match the vendored spec |
| `pnpm changeset` | Add a changeset describing the current branch's change |
| `pnpm version-packages` | Release only: apply pending changesets to versions and changelogs |

## License

Licensed under the [Apache License, Version 2.0](LICENSE). See [NOTICE](NOTICE). Third-party dependencies keep their own licenses; see the license policy in [CLAUDE.md](CLAUDE.md#external-dependencies).
