# Plan: Split into a UI repo and a Spring Boot photos-api repo

- **Date:** 2026-11-12 (revised 2026-11-14: two repos instead of one)
- **Status:** In progress. Parts A, B and C are done and merged. Waiting on the first release (C6). The backend repo is now `ethannet-media` (see [Rename](#rename-to-ethannet-media-2026-11-14)).
- **Repos:**
  - **`ethannet`** (this repo, `github.com/Ethan-S-Evans/ethannet`): becomes the Spring Boot **photos-api**. Its history is kept.
  - **`ethannet-ui`** (new): the Next.js UI monorepo, created from a clone of this repo so its history is kept too.
- **Produces:**
  - In `ethannet-ui`: [Architecture](../architecture.md) (updated), [API contract](../features/api-contract.md) (new, consumer side), [Releasing](../releasing.md) (updated), `CLAUDE.md` (updated)
  - In `ethannet`: `docs/architecture.md`, `docs/features/photos-api.md`, `docs/features/api-contract.md` (owner side) and `docs/releasing.md` (all rewritten for Java), plus `CLAUDE.md` (rewritten)

## Goal

Split the all-TypeScript monorepo into two repos with one language each: a Next.js UI repo and a Java Spring Boot backend repo. This plan covers the foundation only. It removes the Node backends, sets up the Spring Boot service, sets up an OpenAPI contract shared between the repos, and ports the existing hello endpoint as the first end-to-end slice. Photo features (upload, albums, sharing) come in later plans.

## Why

- The photo app ([see the target architecture below](#target-architecture)) needs a real backend with a relational database. Building it in Spring Boot with Postgres puts Java, JPA and SQL experience in the portfolio next to the existing TypeScript and React work.
- The Express `api` and `media-server` exist only as scaffolding. `core` does nothing.
- **Why two repos:** each repo gets one toolchain (pnpm + Biome + Vitest, or Maven + Spotless + JUnit), its own version and release cycle, and its own CI, with no workarounds such as a `package.json` wrapper around Maven. It also mirrors how a frontend team and a backend team usually work: the API owns its contract and publishes versions, and the UI consumes a pinned version.
- **Why the backend keeps this repo:** the backend is the long-lived service that the photo features grow into, and the GitHub repo name `ethannet` suits it. The UI moves to a fresh `ethannet-ui` repo. Starting it from a clone keeps the UI's full history.

## Decisions

| Decision | Choice | Notes |
|---|---|---|
| Repo layout | `ethannet` = photos-api, `ethannet-ui` = UI | `ethannet-ui` is cloned from `ethannet` at the split point, then each repo deletes the other's code. Both keep the shared history up to the split. |
| Local paths | `~/git/ethannet` (photos-api), `~/git/ethannet-ui` (UI) | Side by side, so the UI's e2e setup can find the api checkout during local development. |
| photos-api layout | Plain Maven project at the repo root | No pnpm, Biome or Changesets. `pom.xml`, `mvnw` and `src/` sit at the root. |
| Build tool | Maven, using the Maven wrapper (`./mvnw`) | Common in enterprise teams. The wrapper means no global Maven install is needed. |
| Java version | Java 25 (current LTS) | Spring Boot 4 supports Java 17 through 25. |
| Spring Boot | Latest stable 4.x from start.spring.io | Use the newest 4.x release available when scaffolding. |
| Port | **4001** (the old `api` port) | The UI's `NEXT_PUBLIC_API_URL` default keeps working unchanged. |
| URL prefix | `/api/*` | Same prefix as the Express `api`, so the existing UI fetch paths still work. |
| Database | PostgreSQL in containers (dev and tests) | `compose.yaml` lives in the photos-api repo. Schema managed with Flyway migrations. No tables in this plan. |
| Contract owner | The photos-api repo | The spec lives at `openapi/photos-api.yaml` in `ethannet`. The api generates its Java interfaces from it at build time. The spec's `info.version` equals the api's version. |
| Contract consumer | `packages/schema` in `ethannet-ui` | It holds a **vendored copy** of the spec, pinned to a photos-api release tag, plus the TS types generated from it. A `sync:api <tag>` script fetches the spec at that tag. Updating the UI to a new API version is an explicit, reviewable commit. |
| UI-only types | In `apps/ui/src/types/`, or in the package that owns them | Done in step A2. `UiMessages` is in `@ethannet/messages`, link types are in `@ethannet/navigation`, and `NavLink`/`SocialLink` are in `apps/ui/src/types/`. |
| TS generation | `openapi-typescript` (MIT) | Types only, so it keeps the "`import type` only" rule. |
| Java generation | `openapi-generator-maven-plugin` (Apache-2.0), `spring` generator | Version 7.16.0 or later, with `interfaceOnly=true`, `useSpringBoot4=true` and `useJackson3=true`. |
| Java formatting | Spotless + google-java-format (both Apache-2.0) | Only the photos-api repo uses them. |
| Java tests | JUnit 5, `@WebMvcTest`, Testcontainers (MIT) | Testcontainers runs a real Postgres in integration tests. |
| Health/readiness | Spring Boot Actuator `/actuator/health` | The UI's Playwright setup waits on it. |
| Versioning | Independent per repo | UI: Changesets as today, `fixed` across its own `@ethannet/*` packages. photos-api: `<version>` in `pom.xml`, with releases tagged `vX.Y.Z`. The contract follows the api's semver. |
| Cross-repo e2e | Playwright stays in the UI repo and runs against a real photos-api | Locally: reuse a photos-api already running from `../ethannet`, with a clear error if it isn't up. In CI (later): run a photos-api container image published by the api repo, pinned to the same tag as the vendored spec. |
| Container runtime | **Podman** | Podman runs Postgres locally through `podman compose`, and Testcontainers through Podman's Docker-compatible API socket (`systemctl --user enable --now podman.socket`, with `DOCKER_HOST` pointing at it). Docker isn't used. |
| Naming | `ethannet` everywhere | The repos, packages (`@ethannet/*`) and Java package (`net.ethannet`) all use `ethannet`. It may be shortened to `ethanet` in a future plan. |

### License check

Every new dependency must be on the CLAUDE.md allow-list:

- Spring Boot, Spring Framework, Spring Data JPA and Actuator: Apache-2.0
- Flyway (community edition): Apache-2.0
- PostgreSQL JDBC driver: BSD-2-Clause
- Testcontainers: MIT
- openapi-generator: Apache-2.0
- openapi-typescript: MIT (checked: 7.13.0)
- Spotless and google-java-format: Apache-2.0

Before adding each one, check its license in the published POM or `package.json`, as CLAUDE.md requires. Ask before adding anything outside this list.

## Steps

Follow TDD throughout: write the failing test first. In each repo, keep its typecheck, test and lint passing at the end of each step where possible. Never commit to `main` or `dev` in either repo; use feature branches.

### Part A: UI-side work before the split (in `ethannet`, done)

#### A1. Inventory (done)

See [Step 1 inventory](#step-1-inventory) under As built.

#### A2. Replace `packages/types` with `packages/schema`, move UI-only types (done)

`packages/schema` holds the spec, the generated `src/generated/photos-api.ts`, `generate:api` and `check:api`. `packages/types` is deleted, and every importer is repointed. See [Step 2 differences](#step-2-differences).

After the split, the spec in `packages/schema/openapi/` is treated as a vendored copy. Part C adds the `sync:api` script and the pin.

#### A3. Commit the split point

- Commit A1–A2 on `feature/spring-boot-photos-api` and merge it into `dev`. This commit is the split point both repos start from.

### Part B: Create `ethannet-ui` (new repo)

#### B1. Create the repo from a clone

- `git clone ~/git/ethannet ~/git/ethannet-ui`, then point `origin` at a new empty GitHub repo `Ethan-S-Evans/ethannet-ui` (public, like `ethannet`) and push `main` and `dev`.
- Set `dev` as the working branch, matching Git Flow.

#### B2. Remove the backend code (on `feature/remove-node-backends` in `ethannet-ui`)

- Delete `apps/api`, `apps/media-server` and `apps/core`.
- Root `package.json`: `dev` and `start` run only the UI (drop `concurrently` if nothing else uses it).
- Remove the temporary A2 shims: they go with the deleted apps.
- `pnpm install`, then `pnpm typecheck`, `pnpm test` and `pnpm lint`. The 16 pre-existing Biome errors all live in `media-server`, so lint should now pass with no errors.
- Changeset: `pnpm changeset --minor @ethannet/ui -m "Move the backend to its own repo and consume its OpenAPI contract"`.

#### B3. Make `packages/schema` a pinned consumer

- Add `sync:api`: `pnpm --filter @ethannet/schema sync:api v0.1.0` fetches `openapi/photos-api.yaml` from `Ethan-S-Evans/ethannet` at that tag (with `gh api`, or the raw GitHub URL since the repo is public), writes it to `packages/schema/openapi/photos-api.yaml`, records the tag in `packages/schema/package.json` (for example `"photosApi": { "ref": "v0.1.0" }`), and runs `generate:api`.
- `check:api` stays offline: it fails if the generated types differ from the vendored spec. A separate `check:api:upstream` compares the vendored spec with the spec at the pinned tag (network required, so it's not part of `pnpm lint`).
- Until photos-api has its first tag, keep the current spec. It already matches the hello endpoint.

#### B4. e2e against an external photos-api

- Playwright `webServer`: drop the `@ethannet/api` entry and keep the UI entry.
- Add a `globalSetup` that checks `http://localhost:4001/actuator/health` (overridable with `PHOTOS_API_URL`) and fails with a clear message naming the fix: start the api with `./mvnw spring-boot:run` from `../ethannet`.
- `tests/home.spec.ts` passes unchanged against the Spring Boot api. The current text is "Hello from the Express API!", so check the spec for hardcoded copy and update the expected message if it differs.
- Later (with CI): start a pinned photos-api container image and Postgres instead of relying on a local checkout.

#### B5. UI repo docs

- **`CLAUDE.md`:** the overview lists only `apps/ui`, `apps/e2e`, `packages/schema`, `packages/messages` and `packages/navigation`. Drop the `api` and `media-server` bullets. Rewrite the contract bullet: the spec is vendored from photos-api at a pinned tag, the generated TS types are committed, and `sync:api` and `check:api` handle updates and drift. `transpilePackages` now lists `@ethannet/schema`. Add a rule that UI-only types live in `apps/ui/src/types/`, and a type that a package needs lives in that package, because packages never import from apps. Point the UI copy bullet at `UiMessages` in `@ethannet/messages`. Commands: e2e needs photos-api running. Replace every remaining `packages/types` mention.
- **[Architecture](../architecture.md):** the UI repo's place in the two-repo system, the contract flow (photos-api spec at tag → vendored copy → TS types), and the port map (ui 3000, Storybook 6006, photos-api 4001 external).
- **New [API contract](../features/api-contract.md) (consumer side):** how to update to a new API version (`sync:api`), what `check:api` checks, and how a breaking API change reaches the UI.
- **[Releasing](../releasing.md), [UI messages](../features/ui-messages.md), [Site layout](../features/site-layout.md):** remove the backend packages and `packages/types`.
- README: describe the repo and link to the photos-api repo.

### Part C: Turn `ethannet` into the photos-api repo

#### C1. Remove the UI and Node tooling (on `feature/spring-boot-photos-api`, a new branch off `dev` after A3)

- Delete `apps/`, `packages/`, `node_modules`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `biome.json`, `.npmrc` and `.changeset/`. The pending changesets are all UI changes, and they live on in `ethannet-ui`.
- Keep `docs/plans/` (history), and this plan.
- Move the spec from `packages/schema/openapi/photos-api.yaml` to `openapi/photos-api.yaml` at the repo root (`git mv`, so its history follows).
- Replace `.gitignore` with Maven/Java entries (`target/`, IDE files).

#### C2. Scaffold the Spring Boot project at the repo root

- Generate it from start.spring.io: Maven, Java 25, latest stable Spring Boot 4.x, with Web, Data JPA, PostgreSQL Driver, Flyway, Actuator, Validation and Testcontainers. Package `net.ethannet.photos`. Version `0.1.0-SNAPSHOT`.
- Layout:

  ```
  ethannet/
    pom.xml
    mvnw, mvnw.cmd, .mvn/
    compose.yaml              # postgres for local dev
    openapi/photos-api.yaml   # the contract, source of truth
    src/main/java/net/ethannet/photos/
      PhotosApiApplication.java
      hello/                  # feature packages: controller, service, builder
      config/                 # e.g. CORS
    src/main/resources/
      application.yml         # port 4001, datasource from env vars, CORS origin from config
      db/migration/           # Flyway (empty for now)
    src/test/java/...
    docs/
  ```

- Configure `openapi-generator-maven-plugin` to read `openapi/photos-api.yaml` and generate interfaces and models into `target/generated-sources`. Controllers implement the generated interfaces. If the generator causes problems with the chosen Spring Boot version, generate models only, write the controllers by hand, and record that in "As built".
- Configure Spotless with google-java-format, bound to `verify` so `./mvnw verify` fails on unformatted code. Exclude generated sources.
- CORS: allow the UI origin from config (`app.cors.allowed-origins`, default `http://localhost:3000`). Inject it, don't hard-code it.

#### C3. Port the hello endpoint (first vertical slice)

Use the same pattern as the Express version: a pure builder holds the logic, and a thin controller delegates to it.

- **Test first:** a plain JUnit test for `HelloResponseBuilder` (message text, an ISO 8601 UTC timestamp from an injected `Clock`).
- **Test first:** a `@WebMvcTest` for `HelloController` that checks the status code, JSON shape and content type against the contract. Inject the builder through the constructor and mock it.
- Implement `HelloController` (implementing the generated `HelloApi` interface) and the builder.
- **Test first:** a `@SpringBootTest` + Testcontainers Postgres smoke test showing that the context starts, Flyway runs, and `/actuator/health` is `UP`.

#### C4. Local infrastructure

- `compose.yaml` with a `postgres` service: pinned major version, named volume, port 5432, and credentials matching the defaults in `application.yml`.
- Docs: `podman compose up -d postgres`, then `./mvnw spring-boot:run`.
- Testcontainers: document enabling the Podman socket and setting `DOCKER_HOST` (and `TESTCONTAINERS_RYUK_DISABLED=true` if Ryuk fails under rootless Podman).
- Prerequisites: JDK 25 and Podman.

#### C5. photos-api docs

- **`CLAUDE.md` (rewritten):** overview, commands (`./mvnw spring-boot:run`, `./mvnw test`, `./mvnw test -Dtest=HelloControllerTest`, `./mvnw spotless:apply`, `./mvnw verify`, compose), architecture (feature packages; controller → service → repository; the contract-first flow), and the Development Principles carried over and adapted: Git Flow, semver with `pom.xml` and `vX.Y.Z` tags (no Changesets), license rules for Maven dependencies and plugins, SOLID with constructor injection and no field `@Autowired`, TDD with JUnit, `@WebMvcTest` and Testcontainers, and documentation in Markdown for Obsidian.
- **`docs/architecture.md`:** the two-repo system, why it was split, the port map, and the target architecture.
- **`docs/features/photos-api.md`:** package structure, configuration and env vars, running it, the three test levels, and how to add an endpoint.
- **`docs/features/api-contract.md` (owner side):** the spec is the source of truth. Explains how the Java interfaces are generated, the rules for changing the contract (a breaking change is a major bump, or minor while pre-1.0), and how a release tag lets the UI run `sync:api`.
- **`docs/releasing.md`:** bump `<version>` in `pom.xml` and the spec's `info.version`, merge `dev` into `main`, tag `vX.Y.Z`, and bump to the next `-SNAPSHOT` on `dev`.
- README: describe the service and link to `ethannet-ui`.

#### C6. First release

- When you decide: release `v0.1.0` of photos-api. Then, in `ethannet-ui`, run `sync:api v0.1.0` so the UI pins its first real contract version.

## Definition of done

- **`ethannet-ui`:** no backend apps and no `packages/types`. `packages/schema` holds a vendored spec pinned to a photos-api tag (or the pre-release copy until C6). `pnpm typecheck`, `pnpm test` and `pnpm lint` pass with no errors, `check:api` passes, and `pnpm test:e2e` passes against a locally running photos-api.
- **`ethannet` (photos-api):** a Maven project at the root with no Node tooling left. `./mvnw verify` passes (unit, web-slice, Testcontainers and Spotless). `GET /api/hello` matches the contract, and `/actuator/health` is `UP`.
- The home page renders the hello response from Spring Boot.
- The docs listed above exist in each repo, link to each other (cross-repo links use GitHub URLs), and match the code.
- `ethannet-ui` has a changeset for the backend removal.

## Out of scope (next plans)

1. **CI for both repos:** UI CI runs a pinned photos-api image for e2e. photos-api CI builds, tests and publishes its image to GHCR on tags.
2. **Media upload:** the `StorageService` interface with an S3 implementation, presigned PUT URLs, the `media` table, and an upload UI. S3 setup includes a private bucket, a least-privilege IAM user, bucket CORS, a lifecycle rule to abort incomplete multipart uploads, a separate dev bucket, and a billing alert.
3. **Processing worker:** thumbnail variants, EXIF extraction, and GPS stripping on served copies.
4. **Auth:** Spring Security with sessions or JWT.
5. **Albums and sharing:** albums, members with roles, and share links.

## Target architecture

For context on later plans: Browser → Next.js UI (`ethannet-ui`, port 3000) → Spring Boot photos-api (`ethannet`, port 4001) → Postgres. Photo bytes go directly between the browser and S3 through presigned URLs, and an async worker writes thumbnails back to S3 and metadata to Postgres.

## As built

### Revision: two repos (2026-11-14)

The original plan put the Spring Boot app in `apps/photos-api` inside this pnpm monorepo, with a `package.json` wrapper to keep it in the Changesets fixed group and `-Drevision` to pass the version to Maven. It was revised before any Java work started: the UI moves to a new `ethannet-ui` repo, and this repo becomes the photos-api. That removes the wrapper, the `-Drevision` mechanism and the shared version, and moves contract ownership to the api repo.

### Step 1 inventory

- **API contract → `packages/schema`:** `HelloResponse`.
- **Owned by a package:** `UiMessages` → `@ethannet/messages` (it types `en.json` against it). `LinkConfig`, `NavLinkId`, `SocialLinkId` → `@ethannet/navigation` (it types its link config with them).
- **UI-only → `apps/ui/src/types/`:** `NavLink`, `SocialLink`.
- **Used only by removed apps (deleted):** `MediaFileMetadata`, `MediaFile`, `MediaFileSummary`.
- **Pending changeset naming a removed package:** `.changeset/few-cities-switch.md` (`@ethannet/media-server`), repointed at `@ethannet/ui`.

### Step 2 differences

- `check:api` is a small Node script (`packages/schema/scripts/check-api.mjs`) that regenerates into a temp file and compares, so a failed check never touches the committed file. Root `pnpm lint` runs it after Biome, and there's also a root `pnpm check:api`. There is no CI yet.
- Biome ignores `packages/schema/src/generated/**` entirely (format and lint), not just formatting.
- `@ethannet/navigation` now lists `@ethannet/messages` under `dependencies` rather than `devDependencies`, because its exported `NavLinkId` and `SocialLinkId` types are derived from `UiMessages`.
- `packages/types` was deleted before the Node apps were removed. To keep typecheck green in between, `apps/api` imports `HelloResponse` from `@ethannet/schema`, and `apps/media-server` keeps its media types locally in `src/types.ts`. Both apps are deleted in `ethannet-ui` step B2, and this repo drops them in C1.

### Part B (ethannet-ui) differences

- `photosApi.ref` in `packages/schema/package.json` is `null` until photos-api has its first tag. `specUrl` throws a clear error in that case, so `check:api:upstream` and an argument-less `sync:api` explain what to do.
- The `sync:api` helpers (`specUrl`, `withRef`) live in `packages/schema/scripts/photos-api-source.mjs` and are unit-tested with Vitest, so `@ethannet/schema` now has a `test` script. The scripts use Node's built-in `fetch` on the raw GitHub URL (the repo is public), not `gh`.
- Playwright's ui `webServer` now waits on `port: 3000` instead of `url: http://localhost:3000`. Playwright starts web servers before `globalSetup`, and with the api down `/` returns a 500, so a URL check hung for 60 seconds instead of reaching the health check's clear error.
- `tests/home.spec.ts` didn't pass unchanged: it hardcoded "Hello from the Express API!". It now expects "Hello from the photos API!", the message the Spring Boot builder returns (step C3).
- Root `package.json` was renamed to `ethannet-ui`, and `concurrently` was removed. The ui's `metadata.description` no longer mentions Express.
- With the Node apps gone, `pnpm lint` passes with no errors.

### Follow-ups in ethannet-ui (2026-11-14)

- **Localhost only:** the user works on public Wi-Fi, so `next dev`/`next start` run with `-H 127.0.0.1` and Storybook with `--host 127.0.0.1`. Checked with `ss -ltn`, and e2e still passes (12/12) against a photos-api bound to loopback.
- **License policy:** EPL-2.0 is allowed for unmodified dependencies, and dual-licensed packages are allowed under an allowed option, matching the photos-api repo.

### Rename to ethannet-media (2026-11-14)

The photos-api repo was renamed from `ethannet` to **`ethannet-media`**, both on GitHub (`Ethan-S-Evans/ethannet-media`; GitHub redirects the old name) and locally. Both repos now live side by side in a shared folder, `~/git/ethannet/` (`ethannet-media/` and `ethannet-ui/`). Wherever this plan says `ethannet` for the backend repo, read `ethannet-media`. Live docs, the ui's `photosApi.repo`, and the `../ethannet-media` paths were updated. The service and artifact are still called `photos-api`.
