# Tauri Desktop Wrapper

Tauri 2 wrapper for the Scacchi Painter Angular app. It owns the native integrations: local file access, the Popeye solver process, preferences storage and Windows/MSIX packaging.

## Development

```sh
# from the repository root
pnpm dev:tauri
```

Or from this directory: `pnpm tauri dev` (the `beforeDevCommand` starts the Angular dev server).

## Native integrations

- **Local files** — a dedicated local file provider exposes native commands to list drives/folders and read/write database files (`list_local_roots`, `list_local_folder`, `read_local_file`, `write_local_file`). Web-specific cloud storage actions are hidden in Tauri builds.
- **Solver** — `run_popeye` launches the bundled Popeye executable or the custom path configured in Configuration → Solver Settings; `run_rust_solver` runs the Rust solver in-process.
- **Settings** — preferences are persisted with `@tauri-apps/plugin-store` in `settings.json` under the OS application config directory. Existing `spx:pref:*` values from `localStorage` are migrated on first run.
- **Capabilities** — `default.json` and `desktop.json` enable `core`, `opener`, `shell` and `store` permissions for the main window. The MSIX manifest declares `runFullTrust`, required for a packaged Win32 desktop app that launches Popeye and accesses local files.

## Build

```sh
pnpm build          # Angular (tauri config) + Popeye binary download + Tauri packages
pnpm run build:msix # unsigned MSIX for Microsoft Store submission (Windows + makeappx)
```

The build script in `scripts/build.ts` downloads the Popeye binary into `src-tauri/popeye`; if packaging fails, verify that step first.

Packaging references:

- [MSIX build guide](../../BUILD_MSIX.md)
- [Installation](../../INSTALLATION.md)
- [Store submission](../../STORE_SUBMISSION.md)
