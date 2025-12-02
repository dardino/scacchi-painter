# Scacchi Painter - AI Agent Instructions

## Project Overview

Scacchi Painter is a chess problem composer and solver with multiple deployment targets: Azure Static Web Apps, Tauri desktop app, and local development. The application creates, edits, and solves chess problems using the Popeye chess problem solving engine.

## Architecture

### Multi-Project Monorepo Structure

The project is organized in workspace folders with distinct purposes:

```
sp-gui-angular/          # Main Angular 20+ web application (Azure Static Web Apps)
├── @sp/                 # Internal Angular libraries (monorepo packages)
│   ├── chessboard/      # Canvas-based chessboard rendering library
│   ├── dbmanager/       # Problem database and state management
│   ├── host-bridge/     # Platform abstraction layer (Web/Tauri/Azure)
│   └── ui-elements/     # Reusable UI components (Material Design)
├── api/                 # Azure Functions backend (TypeScript)
└── popeye/              # Popeye engine integration utilities

sp-gui/                  # Tauri desktop wrapper (Rust + Angular)
├── src-tauri/           # Rust backend for desktop app
└── build/               # Angular build output for Tauri

CoreJS/                  # Chess engine core library (TypeScript, pnpm)
popeye-js/              # Popeye WebAssembly wrapper
graphics/               # Assets, fonts, SVG/PNG pieces
```

### Platform Abstraction: The Bridge Pattern

**Critical architectural pattern**: The `BridgeGlobal` interface (`@sp/host-bridge/src/lib/bridge-global.ts`) abstracts platform differences:

- **WebBridge** (`@sp/gui/src/webbridge.ts`): Web Workers for Popeye execution in browser
- **TauriBridge** (`@sp/host-bridge/src/tauriBridge/index.ts`): Tauri IPC for native execution
- Azure Functions: Server-side execution (future)

All platform-specific code MUST implement `BridgeGlobal`. Never call platform APIs directly - use the bridge service.

### Internal Libraries (@sp/*)

Import from these namespaced packages using TypeScript path mapping:

```typescript
import { Problem, Piece } from "@sp/dbmanager/src/lib/models";
import { BridgeGlobal } from "@sp/host-bridge/src/lib/bridge-global";
import { ChessboardComponent } from "@sp/chessboard/src/lib/chessboard.component";
```

These are **internal Angular libraries**, not npm packages. They share the workspace's `node_modules` and tsconfig paths.

## Development Workflows

### Local Development (Web)

Run four terminals simultaneously:

```powershell
# Terminal 1: Watch Azure Functions API
cd sp-gui-angular/api && npm run watch

# Terminal 2: Start Azure Functions locally
cd sp-gui-angular/api && func start

# Terminal 3: Angular dev server
cd sp-gui-angular && yarn start

# Terminal 4: Azure Static Web Apps emulator
cd sp-gui-angular && swa start https://localhost:4200/ --ssl --api-devserver-url http://localhost:7071
```

**Important**: Angular serves on `https://localhost:4200` (SSL required for MSAL auth). Azure Functions on `http://localhost:7071`.

### Tauri Desktop Build

```powershell
cd sp-gui
yarn build  # Runs scripts/build.ts: builds Angular + downloads Popeye + bundles Tauri
```

The build script (`sp-gui/scripts/build.ts`) orchestrates:
1. Angular production build with Tauri environment (`build:tauri` → `environment.tauri.ts`)
2. Popeye executable download to `src-tauri/popeye/`
3. Tauri native build (invokes Rust toolchain)

### Production Deployment

**Azure**: GitHub Actions workflow (`.github/workflows/azure-static-web-apps-orange-sea-080bc3503.yml`) automatically deploys on push to `master` or PRs. Build command: `yarn build:Azure`.

**Tauri**: Manual release builds via `yarn tauri build` (requires Rust installed).

## Key Technologies & Patterns

### Angular 20 Standalone Components

**This project uses Angular 20+ standalone components exclusively** - no NgModules for feature code:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,  // Required
  imports: [CommonModule, MatButtonModule, RouterModule],  // Direct imports
})
export class ExampleComponent {}
```

Bootstrap is done via `bootstrapApplication()` in `@sp/gui/src/main.ts` with `provideRouter()`.

### Environment Configuration

Three environment files control behavior:

- `environment.ts` - Development (asset path: `../../../assets`)
- `environment.prod.ts` - Azure production (asset path: `./assets`)
- `environment.tauri.ts` - Tauri desktop (asset path: `./assets`, imports TauriBridge)

File replacements are configured in `angular.json` → `configurations`.

### Authentication (MSAL + OAuth)

Two OAuth providers for cloud storage:
- **OneDrive**: MSAL (`@azure/msal-browser`), config in `@sp/dbmanager/src/lib/oauth_providers/onedrive.config.ts`
- **Dropbox**: Custom PKCE implementation

**Auth flow**: User clicks cloud storage → redirect to `/redirect` → `AuthRedirectComponent` handles callback → stores token in `localStorage` → redirects to `/openfile#{provider}`.

Local auth state: `getLocalAuthInfo()`/`setLocalAuthInfo()` in `@sp/dbmanager/src/lib/oauth_providers/helpers.ts`.

### Popeye Solver Integration

Popeye is a chess problem solving engine. Integration varies by platform:

**Web**: WebAssembly worker (`popeye-js/`) + Web Worker (`@sp/gui/src/assets/engine/popeye_ww.js`)
**Tauri**: Native binary execution via Rust command (`src-tauri/src/lib.rs` → `run_popeye` command)

Conversion from Problem model to Popeye format: `popeye/problemToPopeye.ts` generates text input for Popeye.

Solution parsing: `parsePopeyeRow()` converts Popeye output to move trees (`HalfMoveInfo[]` from `@dardino-chess/core`).

### Database & State Management

- **DbmanagerService**: Manages problem collections (CRUD operations)
- **CurrentProblemService**: Active problem singleton state
- **Problem model**: Core data structure (`@sp/dbmanager/src/lib/models/problem.ts`)
  - Chess position, stipulation, twins, fairy conditions
  - Supports snapshots (save/restore board states)
  - Export to XML (SP2 format), RTF, FEN

### Canvas Chessboard Rendering

`@sp/chessboard/src/lib/chessboard.component.ts` uses HTML5 Canvas for piece rendering:
- Draws pieces from SVG sprite files
- Handles piece dragging, rotation, fairy attributes
- Two modes: `edit` (composition) and `view` (display only)
- Custom font for figurine notation display

## Code Style & Conventions

### ESLint Configuration

Key rules from `eslint.config.mjs`:

```typescript
"@typescript-eslint/no-unused-vars": ["error", {
  "argsIgnorePattern": "^_",  // Prefix unused args with underscore
}]
"no-console": ["warn", { allow: ["warn", "error", "group", "groupEnd"] }]  // Use console.warn/error only
```

### Naming Conventions

- **Components**: PascalCase with `Component` suffix (`EditProblemComponent`)
- **Services**: PascalCase with `Service` suffix (`DbmanagerService`)
- **Library prefixes**: `lib-` for @sp/* components (`lib-toolbar-db`)
- **App prefix**: `app-` for main app components

### TypeScript Paths

Use configured paths (in `tsconfig.json`):
- `@sp/dbmanager/src/*` → `@sp/dbmanager/src/*`
- `@sp/chessboard/src/*` → `@sp/chessboard/src/*`
- Always import from `/src/` subdirectories, not from package roots

## Common Tasks

### Adding a New Component

```powershell
# In sp-gui-angular root
ng generate component component-name --standalone
# Add --project=chessboard|dbmanager|uiElements|hostBridge for library components
```

### Running Tests

```powershell
cd sp-gui-angular
yarn test           # Karma unit tests
yarn test:ci        # Headless Chrome (CI mode)
```

### Building for Production

```powershell
# Azure Static Web App
cd sp-gui-angular && yarn build

# Tauri Desktop App
cd sp-gui && yarn build
```

### Updating Popeye Metadata

Scripts fetch data from Popeye repository:

```powershell
cd sp-gui-angular
yarn vite-node ./scripts/update_fairy_pieces.ts
yarn vite-node ./scripts/update_popeye_instructions.ts
```

## Troubleshooting

### MSAL Authentication Issues

- Redirect URI must match: `${location.origin}/redirect`
- Check `getLocalAuthInfo()` state in localStorage
- MSAL config: `@sp/dbmanager/src/lib/oauth_providers/onedrive.config.ts`

### Build Failures

- **"Cannot find module @sp/*"**: Check `tsconfig.json` paths and ensure libraries are built
- **Angular CLI errors**: Verify Node.js >= 20 (`package.json` engines requirement)
- **Tauri build errors**: Ensure Rust toolchain is installed and Popeye binary is in `src-tauri/popeye/`

### Asset Path Issues

Environment-specific asset paths can cause 404s. Verify:
- Development: `environment.ts` → `../../../assets` (relative to @sp/gui)
- Production/Tauri: `environment.prod.ts`/`environment.tauri.ts` → `./assets` (relative to dist root)

## Testing Philosophy

- Unit tests for data models and utilities (`*.spec.ts`)
- Component tests use Angular TestBed with minimal dependencies
- Mock `DbmanagerService` and `HostBridgeService` in tests
- Core chess logic tests in `CoreJS/src/**/*.spec.ts` (Jest)

## Important Files

- `angular.json` - Workspace configuration, build targets, file replacements
- `staticwebapp.config.json` - Azure SWA routing rules
- `@sp/host-bridge/src/lib/bridge-global.ts` - Platform abstraction interface
- `@sp/gui/src/app/app-routing-list.ts` - Route definitions
- `popeye/problemToPopeye.ts` - Popeye format converter
- `src-tauri/src/lib.rs` - Tauri native commands (Rust)
