# Scacchi Painter GUI - CHANGELOG

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
