# Scacchi Painter GUI - CHANGELOG

## 0.2.2

**Feature release**: new engine configuration UX, richer solver telemetry, stronger Tauri/Rust message payloads, and internal migration hardening.

- [sp-gui-angular] **Engine configuration dialog**: added a dedicated solve engine configuration flow in the problem editor and refactored engine handling to centralize behavior
- [sp-gui-angular] **New engine target: Popeye (ASM)**: introduced support for the new engine option and aligned related configuration and toolbar logic
- [solver] **Richer solving feedback**: switched solver options to refutations count, added attempts reporting, and exposed elapsed-time tracking in solver summaries
- [sp-gui-angular] **Reactive DB manager state**: refactored current index, current file, and count tracking to signal-based reactive state with corresponding component updates
- [sp-gui-angular] **Auth resilience improvements**: enhanced token acquisition fallback logic, including explicit handling for "no account" scenarios
- [sp-gui / Tauri + CoreRust] **Bridge message expansion**: extended Tauri bridge and Rust solver integration to carry solution and threat data in message payloads
- [tooling] **Test/runtime and workspace alignment**: completed migration updates around Vitest configs, dependency refresh, workspace setup, and Rust toolchain pin (`rustc 1.88.0`)

## 0.2.1

**Bug fix and infrastructure release**: build pipeline hardening, solver-cli improvements, and migration of `popeye-js` from Yarn to pnpm.

- [ci] **Tag release workflow overhauled**: `ci-tag.yml` extended to publish multi-platform Tauri binaries (Linux AppImage/deb/rpm, Windows MSI/NSIS, macOS DMG) and upload them as GitHub Release assets
- [ci] **New `publish-docs.yml` workflow**: automatically publishes the Rust solver documentation to GitHub Pages on every push to `master`
- [CoreRust] **solver-cli expanded**: richer CLI output (JSON mode, tries, threats, refutations), corpus-based regression runner, and improved FEN/Popeye input parsing
- [CoreRust] **problem-solver hardened**: alpha-beta pruning improvements, transposition-table fixes, and stronger winning-line extraction
- [popeye-js] **Migrated from Yarn to pnpm**: removed Yarn 3 artefacts and aligned package manager with the rest of the monorepo
- [docs] **New documentation site**: added `docs/` folder with Jekyll configuration and pages for the solver CLI, release flow, and post-release sync procedures
- [build] **Fix build failures**: restored `tsconfig.json` `baseUrl` and pinned `concat@3.0.0` to resolve Angular build errors introduced in 0.2.0

## 0.2.0

**Feature release**: introduces the Rust solver workspace, richer solving workflows, and the first end-to-end platform integration updates for desktop and web builds.

- [CoreRust] **New Rust solver workspace**: added `chess-core`, `problem-io`, `problem-solver`, and `solver-cli` crates with a modular architecture for future engine evolution
- [CoreRust] **Orthodox solving foundations**: implemented legal move generation, castling, en passant, mate/stalemate detection, and Popeye-like input parsing for directmate problems
- [CoreRust] **Stronger solver output**: added winning line extraction, SAN notation, richer text reports, alpha-beta pruning, transposition-table caching with TTL, and iterative deepening support
- [sp-gui-angular] **Engine workflow improvements**: added engine selection, streaming solution updates, solution count tracking, and max-solution reporting in the editor toolbar
- [sp-gui / Tauri] **Desktop integration updates**: improved SpCore handling in the Tauri bridge and aligned CI/build assets for multi-platform desktop packaging
- [tests] **Expanded validation**: added end-to-end integration tests for chess positions and the streaming pipeline

## 0.1.1

**Bug fix release**: Fixed critical chessboard rendering issue and improved signal-based reactivity.

- [sp-gui-angular] **Fixed chessboard reactivity**: Resolved issue where piece changes (add/remove/move) were not triggering UI re-renders
  - Implemented version signal pattern to force computed re-evaluation when Problem object changes internally
  - Added Problem cloning to ensure change detection works correctly with input signals
  - Centralized change notifications after all board manipulation commands
- [sp-gui-angular] **Improved code organization**: Refactored edit-problem component for better maintainability
  - Consolidated board update notifications in single location
  - Cleaned up command mapper to separate business logic from change detection
- [sp-gui-angular] **Fixed signal violations**: Removed deprecated patterns causing NG0600 errors in computed expressions
- [sp-gui-angular] **Added comprehensive unit tests**: Created test suite for chessboard interaction features (14 passing tests)

## 0.1.0

- [sp-gui-angular] Angular 21
- [sp-gui-angular] Migration to pnpm + vitest + sass
- [sp-gui-angular] Implements change detection with signals
- [sp-gui-angular] **Completed signal-based reactivity**: Converted 11 critical UI components to use Angular signals for zoneless change detection:
  - **ChessboardComponent** - Chessboard visualization with cell rendering
  - **EditProblemComponent** - Problem editor with all UI state
  - **BoardCellComponent** - Individual cell computed properties
  - **SpSolutionDescComponent** - Solution display and editing
  - **DatabaseListComponent** - Problem list with search filtering
  - **DatabaseListItemComponent** - List item display properties
  - **ProblemPublicationComponent** - Publication metadata form
  - **ProblemDefinitionsComponent** - Problem stipulation and conditions
  - **ToolbarEngineComponent** - Engine toolbar with fontSize state
  - **ToolbarDbComponent** - Database navigation toolbar
  - **MenuComponent** - Main navigation menu
  - Implemented computed signals for derived properties and signal wrappers for mutable state
  - All components verified to compile without errors and provide instant UI updates without zone.js

## 0.0.13

- Improved Popeye move parser
- Added support for Tauri to build desktop applications
- Added Bridge support for Tauri to run the platform-specific Popeye process
- Added Terms and Conditions page
- Copy and Paste
- Fix small screen layout issues
- Adds board coordinates

## 0.0.12

- Publications info: [#168](https://github.com/dardino/scacchi-painter/issues/168)

## 0.0.11

- New Grid Layout to place elements in page
- Fixing imports from SP2: line-break
- Position and size of board in mobile

## 0.0.10

- Fix figurine in iOS

## 0.0.9

- [x] BugFix: [#129](https://github.com/dardino/scacchi-painter/issues/129) Save to local file
- [x] Some other smells:
  - [x] Menu item `Configuration` now is always visible
  - [x] The button `Save` in `save-as` page is now aligned to the field
- [x] Main toolbar as stiky
- [x] Better layout management
- [x] "Recent files" section is now as tall as its container
- [x] Clicking in one of the recent files now does not crash if any error occurs
- [x] Fix [#37](https://github.com/dardino/scacchi-painter/issues/37) Write SP2 files

## 0.0.8

- [x] Release Note

## 0.0.7

- [x] FEN in editor
- [x] Mini Author management

## 0.0.6

- [x] [#151](https://github.com/dardino/scacchi-painter/issues/151) Fix twins

## 0.0.5

- [x] [#149](https://github.com/dardino/scacchi-painter/issues/149) Added Quill editor to edit as HTML
- [x] "Try Move" function
- [x] [#105 List of problems](https://github.com/dardino/scacchi-painter/issues/105)
- [x] [#39 Twin editor](https://github.com/dardino/scacchi-painter/issues/39)
- [x] Showing saved solution when Opening specific position
- [x] Preferences:
  - [x] Size of the sidebar memoized
  - [x] Size of the font for the solution panel
- [x] Added the possibility to increase/decrease font size in the solution panel
- [x] Added the possibility to change the size of the chessboard sidebar in edit page
- [x] [#119](https://github.com/dardino/scacchi-painter/issues/119) Added functionality "Add" and "Remove" to the database
- [x] [#106](https://github.com/dardino/scacchi-painter/issues/106) Added commands to add a problem into current db
- [x] [#103](https://github.com/dardino/scacchi-painter/issues/103) Problem selection from database page
- [x] Update to latest Angular 15
- [x] Update to latest Angular Material
- [x] Yarn 3
- [x] New theme configuration
- [x] Better Toolbar incons
