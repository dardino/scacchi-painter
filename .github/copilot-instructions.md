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
cd sp-gui-angular/api && pnpm run watch

# Terminal 2: Start Azure Functions locally
cd sp-gui-angular/api && func start

# Terminal 3: Angular dev server
cd sp-gui-angular && pnpm start

# Terminal 4: Azure Static Web Apps emulator
cd sp-gui-angular && swa start https://localhost:4200/ --ssl --api-devserver-url http://localhost:7071
```

**Important**: Angular serves on `https://localhost:4200` (SSL required for MSAL auth). Azure Functions on `http://localhost:7071`.

### Tauri Desktop Build

```powershell
cd sp-gui
pnpm build  # Runs scripts/build.ts: builds Angular + downloads Popeye + bundles Tauri
```

The build script (`sp-gui/scripts/build.ts`) orchestrates:
1. Angular production build with Tauri environment (`build:tauri` → `environment.tauri.ts`)
2. Popeye executable download to `src-tauri/popeye/`
3. Tauri native build (invokes Rust toolchain)

### Production Deployment

**Azure**: GitHub Actions workflow (`.github/workflows/azure-static-web-apps-orange-sea-080bc3503.yml`) automatically deploys on push to `master` or PRs. Build command: `pnpm build:Azure`.

**Tauri**: Manual release builds via `pnpm tauri build` (requires Rust installed).

## Key Technologies & Patterns

### Package Manager: pnpm

**This project uses pnpm exclusively** (not npm or yarn):

```powershell
pnpm install           # Install dependencies
pnpm start            # Development server
pnpm build            # Production build
pnpm test             # Run tests
```

Configuration:
- `.npmrc` - pnpm-specific settings (shamefully-hoist, public-hoist-pattern)
- `pnpm-workspace.yaml` - Workspace configuration (if using monorepo features)

### Angular 21 Standalone Components

**This project uses Angular 21+ standalone components exclusively** - no NgModules for feature code:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,  // Required
  imports: [CommonModule, MatButtonModule, RouterModule],  // Direct imports
})
export class ExampleComponent {}
```

Bootstrap is done via `bootstrapApplication()` in `@sp/gui/src/main.ts` with `provideRouter()`.

### Zoneless Change Detection (Signal-Based)

**This project runs without zone.js** using Angular's zoneless mode with signals:

- **NO zone.js dependency** - removed from package.json
- **Change detection**: Uses `provideZonelessChangeDetection()` in main.ts
- **Manual updates**: External async operations (like Popeye solver) trigger change detection via `ApplicationRef.tick()`

```typescript
// main.ts
import { provideZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),  // Enables zoneless mode
    // ... other providers
  ],
});
```

**For async operations outside Angular** (e.g., WebWorkers, Tauri IPC):
```typescript
import { ApplicationRef, inject } from '@angular/core';

export class MyService {
  private appRef = inject(ApplicationRef);

  handleExternalCallback(data: unknown) {
    this.updateState(data);
    this.appRef.tick();  // Manually trigger change detection
  }
}
```

**Migration considerations**:
- ✅ Prefer signals (`signal()`, `computed()`, `effect()`) over RxJS Observables
- ✅ Use `ApplicationRef.tick()` for external async callbacks
- ❌ NO `NgZone` imports - removed from codebase
- ❌ NO `runOutsideAngular()` - not needed in zoneless mode

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

### SCSS Styling (Dart Sass 3.0 Compatible)

**This project uses modern SCSS with `@use` and `@forward`** (not deprecated `@import`):

```scss
// ✅ GOOD: Modern module system
@use "sass:color";
@use "../../mediaquery" as mq;
@use "../../toolbarcommon" as tb;

.example {
  width: mq.$smallScreen;
  @include tb.toolbar();
  background: color.adjust(#144e6c, $lightness: -10%);
}
```

```scss
// ❌ BAD: Deprecated syntax (will break in Dart Sass 3.0)
@import "mediaquery";
@import "toolbarcommon";

.example {
  width: $smallScreen;
  @include toolbar();
  background: darken(#144e6c, 10);
}
```

**Key SCSS conventions**:
- **Shared variables**: `@sp/mediaquery.scss` exports `$smallScreen`, `$maintoolbarH`, `$boardwidthSM`, `$verySmallScreen`
- **Shared mixins**: `@sp/toolbarcommon.scss` exports `toolbar()` mixin
- **Namespace usage**: Always use namespace prefix (`mq.$variable`, `tb.mixin()`)
- **Color functions**: Use `sass:color` module (`color.adjust()`, `color.scale()`) instead of global `darken()`/`lighten()`
- **Transparency**: Use `rgba()` instead of deprecated `transparentify()`

**Component-level SCSS pattern**:
```scss
@use "../../../../mediaquery" as mq;

:host {
  display: block;
}

@media (max-width: mq.$smallScreen) {
  // Mobile styles
}
```

## Common Tasks

### Adding a New Component

```powershell
# In sp-gui-angular root
ng generate component component-name --standalone
# Add --project=chessboard|dbmanager|uiElements|hostBridge for library components
```

**For components with styles**: Angular CLI generates `.scss` files by default (configured in `angular.json` → `schematics.style: "scss"`). Always use `@use` with namespaces for shared variables/mixins.

### Running Tests

```powershell
cd sp-gui-angular
pnpm test           # Vitest interactive mode
pnpm test:ci        # Vitest run mode (CI)
pnpm test:ui        # Vitest UI mode (browser-based)
```

**Test Framework**: This project uses **Vitest 4.0.15** with jsdom environment, not Karma/Jasmine.

### Building for Production

```powershell
# Azure Static Web App
cd sp-gui-angular && pnpm build

# Tauri Desktop App
cd sp-gui && pnpm build
```

**Build Tool**: Uses Vite for Angular builds (via `@angular-devkit/build-angular:application` builder), **Dart Sass** for SCSS compilation.

**Tech Stack**: Angular 21, TypeScript 5.9, Vite, Vitest 4, pnpm 9, Zoneless (signals), **Dart Sass 3.0-compatible SCSS**

### Updating Popeye Metadata

Scripts fetch data from Popeye repository:

```powershell
cd sp-gui-angular
pnpm exec vite-node ./scripts/update_fairy_pieces.ts
pnpm exec vite-node ./scripts/update_popeye_instructions.ts
```

**Note**: Uses `vite-node` for TypeScript execution (not ts-node).

## Troubleshooting

### MSAL Authentication Issues

- Redirect URI must match: `${location.origin}/redirect`
- Check `getLocalAuthInfo()` state in localStorage
- MSAL config: `@sp/dbmanager/src/lib/oauth_providers/onedrive.config.ts`

### Build Failures

- **"Cannot find module @sp/*"**: Check `tsconfig.json` paths and ensure libraries are built
- **Angular CLI errors**: Verify Node.js >= 20 and pnpm >= 9 (`package.json` engines requirement)
- **Tauri build errors**: Ensure Rust toolchain is installed and Popeye binary is in `src-tauri/popeye/`
- **pnpm install issues**: Clear node_modules and pnpm lock: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

### Asset Path Issues

Environment-specific asset paths can cause 404s. Verify:
- Development: `environment.ts` → `../../../assets` (relative to @sp/gui)
- Production/Tauri: `environment.prod.ts`/`environment.tauri.ts` → `./assets` (relative to dist root)

## Testing Philosophy

**Test Framework**: Vitest 4.0.15 with jsdom environment (migrated from Karma/Jasmine in Angular 21 migration).

### Test Structure & Best Practices

All test files (`*.spec.ts`) MUST include Vitest imports:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';  // Required!

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyComponent],  // Standalone component
    });
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Key Testing Patterns

**1. MSAL/Crypto-dependent tests** - Skip or mock when browser APIs unavailable:
```typescript
import { describe, it, vi } from 'vitest';

describe.skip('OneDriveCliProvider', () => {
  // Tests requiring browser crypto API - skipped in jsdom
});
```

**2. Lazy initialization for MSAL** - Avoid module-level initialization:
```typescript
// ❌ BAD: Immediate initialization fails in jsdom
static #myMSALObj = new PublicClientApplication(config);

// ✅ GOOD: Lazy getter pattern
static #myMSALObj: PublicClientApplication | null = null;
static #getMSALObj() {
  if (!this.#myMSALObj) {
    this.#myMSALObj = new PublicClientApplication(config);
  }
  return this.#myMSALObj;
}
```

**3. Vitest API usage** - Use Vitest APIs, not Jasmine:
```typescript
// ❌ BAD: Jasmine APIs
spyOn(obj, 'method').and.returnValue(value);
expect(value).toBeTrue();

// ✅ GOOD: Vitest APIs
vi.spyOn(obj, 'method').mockReturnValue(value);
vi.spyOn(obj, 'asyncMethod').mockResolvedValue(value);
expect(value).toBeTruthy();
```

**4. Mock providers** - Use Vitest mocks for services:
```typescript
beforeEach(() => {
  const mockService = {
    method: vi.fn().mockReturnValue('value'),
  };

  TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [
      { provide: MyService, useValue: mockService },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
    ],
  });
});
```

**5. ActivatedRoute mock** - Include all required properties:
```typescript
import { of } from 'rxjs';

providers: [
  {
    provide: ActivatedRoute,
    useValue: {
      params: of({}),
      queryParams: of({}),
      paramMap: of(new Map()),  // Don't forget paramMap!
    },
  },
]
```

### Test Configuration

- `vitest.config.ts` - Main Vitest configuration with path aliases
- `test-setup.ts` - Global test setup (webcrypto polyfills, Angular testing imports)
- Path aliases use regex patterns for specificity:
  ```typescript
  alias: [
    { find: /^@sp\/dbmanager\/src\/lib\/models\/twin$/, replacement: '...' },
    { find: /^@sp\/dbmanager\/(.*)$/, replacement: '...' },
  ]
  ```

### Coverage & CI

```powershell
pnpm test:coverage  # Run tests with coverage report
```

Test targets:
- Unit tests for data models and utilities (`*.spec.ts`)
- Component tests use Angular TestBed with minimal dependencies
- Mock `DbmanagerService` and `HostBridgeService` in tests
- Core chess logic tests in `CoreJS/src/**/*.spec.ts` (separate pnpm workspace)

## Important Files

- `angular.json` - Workspace configuration, build targets, file replacements, Vite integration
- `vite.config.ts` - Vite configuration for Angular builds
- `vitest.config.ts` - Vitest test runner configuration
- `test-setup.ts` - Global Vitest test setup
- `staticwebapp.config.json` - Azure SWA routing rules
- `@sp/host-bridge/src/lib/bridge-global.ts` - Platform abstraction interface
- `@sp/gui/src/app/app-routing-list.ts` - Route definitions
- `popeye/problemToPopeye.ts` - Popeye format converter
- `src-tauri/src/lib.rs` - Tauri native commands (Rust)
- `.npmrc` - pnpm configuration
- `pnpm-lock.yaml` - pnpm lockfile (DO NOT modify manually)
