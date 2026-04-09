# Project Guidelines

## Code Style

- Use `pnpm` only (no `npm` or `yarn`).
- Angular code is standalone + zoneless + signal-first:
  - `standalone: true` components
  - `provideZonelessChangeDetection()` in bootstrap
  - prefer `signal()` / `computed()` for UI state
- For external async callbacks (WebWorker, Tauri IPC), trigger UI refresh with `ApplicationRef.tick()`.
- SCSS must use modern Sass modules (`@use`, `@forward`), not deprecated `@import`.
- Follow ESLint conventions in `Gui/sp-gui-angular/eslint.config.mjs`:
  - no `console.log` (use `console.warn` / `console.error`)
  - prefix intentionally-unused args with `_`

## Architecture

- Monorepo areas:
  - `Gui/sp-gui-angular`: Angular web app + internal `@sp/*` libraries
  - `Gui/sp-gui-angular/api`: Azure Functions backend
  - `Gui/sp-gui`: Tauri desktop wrapper
  - `Core`: .NET core + engine + tests
  - `CoreJS`: TypeScript chess core library
  - `CoreRust`: Rust solver workspace
- Critical boundary: platform execution must go through bridge abstractions (`BridgeGlobal`, `WebBridge`, `TauriBridge`), never direct platform APIs in feature code.
- Keep concerns separated: UI in `@sp/gui`, board rendering in `@sp/chessboard`, persistence/auth/models in `@sp/dbmanager`, platform abstraction in `@sp/host-bridge`.

## Build And Test

- Full local web stack from repo root: `pnpm dev`.
- Angular web app (`Gui/sp-gui-angular`):
  - dev: `pnpm start` (`https://localhost:4200`)
  - build: `pnpm build`
  - test: `pnpm test` / `pnpm test:ci`
- Functions API (`Gui/sp-gui-angular/api`):
  - watch: `pnpm watch`
  - host: `func start` (`http://localhost:7071`)
- Tauri desktop (`Gui/sp-gui`): `pnpm build` (orchestrates Angular tauri build + Popeye download + Tauri packaging).
- .NET (`Core`): `dotnet build`, `dotnet test`.
- CoreJS (`CoreJS`): `pnpm build`, `pnpm test`.
- CoreRust (`CoreRust`): `cargo build`, `cargo test`.

## Conventions

- Use workspace path aliases and existing public APIs; avoid introducing new ad-hoc import patterns.
- Avoid direct imports from internal implementation folders when a stable public entrypoint exists.
- Test framework is Vitest (not Jasmine/Karma). Use `vi.*` mocks/spies.
- For browser-crypto/MSAL tests in jsdom, prefer lazy initialization and explicit mocks/skips.
- Keep diffs minimal and scoped; do not reformat unrelated files.

## Docs Index

Link to existing docs instead of duplicating details:

- Root project overview and commands: `readme.md`
- Release process: `release-flow.md`, `post-release-sync.md`
- Published docs index: `docs/index.md`
- Solver CLI docs: `docs/solver-cli.md`
- Angular app docs: `Gui/sp-gui-angular/README.md`
- Tauri wrapper docs: `Gui/sp-gui/README.md`
- Rust architecture details: `CoreRust/ARCHITECTURE.md`

## Gotchas

- Local web flow assumes SSL app host + local Functions + SWA emulator.
- Required toolchain for common tasks: Node 20+, pnpm, Azure Functions Core Tools, SWA CLI; add Rust/.NET when touching those areas.
- Tauri builds depend on Popeye binary acquisition in `Gui/sp-gui/scripts/build.ts`; if packaging fails, verify that step first.
