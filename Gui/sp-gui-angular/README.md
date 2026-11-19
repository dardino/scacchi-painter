# SpGuiAngular

Angular application and internal `@sp/*` libraries for Scacchi Painter. The app is standalone, zoneless and signal-first; tests use Vitest.

## Development

The standard entry point is the root command:

```sh
cd ../..
pnpm dev
```

This starts the full local web stack (Azure Functions watch + host, Angular dev server on `https://localhost:4200`, Static Web Apps emulator). Required tools in `PATH`: `pnpm`, `func`, `swa`.

To enable an external phone to access a WSL2 web server:

```sh
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=4200 connectaddress=172.26.125.244 connectport=4200
```

If you need to run the processes manually, use four different terminals:

```sh
# terminal 1
cd Gui/sp-gui-angular/api && pnpm run watch
# terminal 2
cd Gui/sp-gui-angular/api && func start

# terminal 3
cd Gui/sp-gui-angular && pnpm start

# terminal 4
cd Gui/sp-gui-angular && swa start https://localhost:4200/ --ssl --api-devserver-url http://localhost:7071
```

## Build and test

```sh
pnpm build          # production web build
pnpm build:tauri    # build used by the Tauri wrapper
pnpm test           # Vitest
pnpm test:ci        # Vitest + TypeScript check
pnpm lint           # ESLint via Angular CLI
```

## Architecture notes

- UI lives in `@sp/gui`, board rendering in `@sp/chessboard`, persistence/auth/models in `@sp/dbmanager`, and platform access in `@sp/host-bridge`.
- Preferences use the `SettingsService` in `@sp/gui/src/app/services`: `localStorage` on the web, `tauri-plugin-store` in the desktop build. See [Tauri wrapper docs](../sp-gui/README.md).
- The landing page tip banner is documented in [docs/tips-banner.md](../../docs/tips-banner.md).

## Release documentation

- [GUI changelog](CHANGELOG.md)
- [In-app release notes](@sp/gui/src/assets/release-notes.md)
- [Release flow](../../release-flow.md)
