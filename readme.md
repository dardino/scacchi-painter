# Scacchi Painter Universal

[![Board Status](https://dev.azure.com/gabrielebrunori/32706370-69c9-42be-bb3e-ebc44421e7cc/fe41d1db-f853-4841-956f-308bfbda8968/_apis/work/boardbadge/67b9252f-2b34-4d5c-859d-2e50328506dd)](https://dev.azure.com/gabrielebrunori/32706370-69c9-42be-bb3e-ebc44421e7cc/_boards/board/t/fe41d1db-f853-4841-956f-308bfbda8968/Microsoft.RequirementCategory)[![Build Status](https://dev.azure.com/gabrielebrunori/Accademia%20Del%20Problema/_apis/build/status/dardino.scacchi-painter?branchName=master)](https://dev.azure.com/gabrielebrunori/Accademia%20Del%20Problema/_build/latest?definitionId=9&branchName=master)[![GitHub Action](https://github.com/dardino/scacchi-painter/actions/workflows/azure-static-web-apps-orange-sea-080bc3503.yml/badge.svg)](https://github.com/dardino/scacchi-painter/actions)

A new cross-platform engine and gui for chess problem composers

## Latest Changes (0.2.2)

The 0.2.2 release introduces:

- dedicated engine configuration dialog in the problem editor
- support for `Popeye (ASM)` as a selectable engine option
- richer solver summaries with elapsed time and attempts metadata
- updated solver option handling based on refutations count
- stronger Tauri <-> Rust payloads with explicit solution/threat data
- signal-first reactive state updates in DB manager flows
- auth/token fallback hardening for no-account scenarios

Release documentation:

- GUI changelog: [Gui/sp-gui-angular/CHANGELOG.md](Gui/sp-gui-angular/CHANGELOG.md)
- In-app release notes source: [Gui/sp-gui-angular/@sp/gui/src/assets/release-notes.md](Gui/sp-gui-angular/@sp/gui/src/assets/release-notes.md)

## Developer Quick Start

The standard local entry point is now a single root command:

```sh
pnpm dev
```

Required tools in `PATH`: `pnpm`, `func`, `swa`.

This starts the local web development stack:

- Azure Functions TypeScript watch
- Azure Functions host
- Angular dev server on `https://localhost:4200`
- Azure Static Web Apps emulator

Useful root shortcuts:

```sh
pnpm dev:api
pnpm dev:angular
pnpm dev:swa
pnpm build:web
pnpm test:web
pnpm lint:web
pnpm build:corejs
pnpm test:corejs
pnpm build:tauri
```

In VS Code you can run the `dev: full web stack` task from the workspace root.

A running and usable online preview is available

[Here (pre-release)](https://orange-sea-080bc3503-release.westeurope.azurestaticapps.net/)

or

[Here (lts)](https://orange-sea-080bc3503.azurestaticapps.net/)

Go to [Roadmap](https://github.com/dardino/scacchi-painter/wiki/RoadMap) to look at the future

## Rust Solver Planning

Internal planning documents for the new Rust-based chess problem solver are available here:

- [Master prompt](./.github/prompts/rust-engine-like-popeye.md)
- [Milestones index and branch map](./.github/prompts/rust-solver-milestones-index.md)
- [Execution roadmap](./.github/prompts/rust-solver-roadmap.md)
- [Milestone prompts](./.github/prompts/)

The Rust CLI reference is documented here:

- [solver-cli README](./CoreRust/apps/solver-cli/README.md)
- [Published CLI docs](./docs/solver-cli.md)
- [Published page](https://dardino.github.io/scacchi-painter/)
