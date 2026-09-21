# Release Notes

## WIP - Future

### Startup Tip Banner

A future update will introduce a new “Did you know?” banner on the home page with weighted rotation, manual navigation, and per-session decay.

**What's New:**

* 🧠 **Startup tip banner** - a new banner appears on the home page with lightweight onboarding hints for key board features
* 🔁 **Weighted rotation** - tips are selected proportionally to their stored weights to avoid repetition while keeping newer tips more visible
* 🧭 **Manual navigation** - users can move between tips with next/previous controls and keep the banner useful as a quick reminder
* ♻️ **Per-session decay** - each tip can decay once per app session, reducing repetition without fully excluding it from future cycles
* 📎 **Direct problem editing** - a new menu item will allow direct access to the single problem editing page

**What changes for you:**

* The home page will offer helpful starter guidance when you open the app
* Important tips will surface more often without always repeating the same ones
* The banner can be hidden if you prefer not to see it at startup
* You'll be able to access the problem editor directly from the menu without navigating through the problem list

## Version 0.4.2

### Editor Fixes And More Stable Data Handling

This patch release includes a few editor and data-flow fixes reported while working with problem creation and metadata management.

**What's New:**

* 🧩 **New problem flow fixes** - corrected the file and source selection flow when creating a new problem
* 👤 **Author cards fix** - improved author metadata handling and the rendering of author-related UI cards
* 🗑️ **Twin deletion fix** - fixed deletion behavior for twin entries in the problem editor
* ✨ **Fairy deletion condition fix** - corrected the condition that controlled deletion of fairy entries
* 🔄 **Problem state consistency** - tightened synchronization between the current problem and related editor metadata

**What changes for you:**

* Creating a new problem is more reliable and predictable
* Author information displays and updates more consistently in the UI
* Deleting twins and fairy entries behaves correctly in edge cases
* Editing complex problem records feels more stable and less error-prone

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.4.1

This version is a patch version to fix a truncate problem with stipulation moves

## Version 0.4.0

### FEN Paste, Animations, And Zero-Position Support

This release brings a few highly requested editor improvements focused on faster position entry, smoother board interactions, and broader problem support.

**What's New:**

* ✨ **Paste FEN directly on the board** - You can now paste a plausible FEN string directly into the board editor and load it faster without manual setup
* 🎞️ **Board animation support** - Board updates and move transitions can now be shown with smoother animation for a clearer editing experience
* ➕ **Better placement for “Add new position”** - The action is easier to find and use in the editor layout
* ♾️ **Zero-position support** - Problems defined as zero-position are now handled correctly

**What changes for you:**

* Position entry is faster when copying setup data from other sources
* Editing feels smoother and more visually responsive
* The interface is easier to navigate when creating or adjusting positions
* A wider set of problem definitions can be represented and edited correctly

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.3.1

Release 0.3.1.

### A More Consistent Release Experience

This release brings the application versioning and release messaging into better alignment across the desktop and web experience, making the product presentation clearer and more consistent.

**What's New:**

* ✨ **Version alignment across the app** - Angular and desktop release metadata now match the same product version
* 🧭 **Cleaner release presentation** - Updated release notes and project summary reflect the current product state more clearly
* 📦 **More consistent product identity** - The desktop app and the web interface now present the same versioning story
* 🎨 **New configuration page** - A dedicated settings area now lets you personalize the board appearance, including square colors and other useful preferences
* ⚙️ **More control over the workspace** - Adjustable display and editing preferences make the app easier to tailor to your own working style
![Configuration page with board colors and interface preferences](./release-notes-images/0.3.1/settings.png)
* ♟️ **Support for fairy pieces** - The editor and board now work with a wider range of fairy-piece sets, making more problem styles and conventions available
* 🗂️ **More powerful problem list** - Problem entries can now be sorted by creation date, kings’ positions, personal ID, and related metadata, with more reliable multi-field text filtering across the list
* 🧾 **Problem data loads correctly** - The problem details panel now keeps the correct values for date, magazine, rank, award, personal ID, and tags instead of resetting them to defaults or blanks
* 🖼️ **Copy board as PNG from context menu** - The board can now be exported as an image directly from the contextual menu for easier sharing and publishing
* 📸 **Snapshot history during editing** - You can now save intermediate positions while working on a problem and keep them available for later review
![Snapshots manager with saved board states](./release-notes-images/0.3.1/snapshot_manager.png)
* 🔄 **Recover saved snapshots** - Saved board states can be restored easily when you want to return to a previous version of the position

**What changes for you:**

* You’ll see a consistent version across the app and desktop build
* Release notes are easier to follow and match the current product state
* The experience feels more polished and coherent across platforms
* You can customize the chessboard colors and other settings more directly from the app
* The interface feels more personal and better suited to how you like to work
* More fairy-piece problems can be edited and represented correctly
* Problem lists are easier to sort, filter, and navigate by the metadata that matters to you
* Selected problem details now display the correct metadata instead of blank or default values
* You can quickly save and share the board as an image without extra steps
* It’s easier to experiment with different positions and safely return to earlier versions of your work

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.2.2

Release 0.2.2.

### Better Engine Configuration And Richer Solver Feedback

This snapshot focuses on the solve workflow, bringing clearer configuration options and more complete runtime feedback from both web and desktop integrations.

**What's New:**

* ⚙️ **Dedicated engine configuration dialog** - Engine settings are now managed through a dedicated dialog in the editor flow, with cleaner internal engine handling
* 🧩 **New engine option: Popeye (ASM)** - Added support for selecting and using the Popeye ASM engine profile
* 📈 **Richer solver summary** - Solver output now includes elapsed time and attempts, with updated options based on refutations count
* 🔁 **Improved reactive state in data manager** - Current item index, selected file, and counters are now signal-driven for more consistent UI updates
* 🖥️ **Desktop bridge payload improvements** - Tauri and Rust solver messaging now carries richer solution and threat information
* 🔐 **More robust account/token fallback** - Authentication token acquisition now handles missing-account scenarios more reliably

**What changes for you:**

* Engine setup is clearer before launching analysis
* Solver progress and results provide better diagnostic context
* Desktop solve data is more complete when rendering complex outcomes

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.2.1

### Build Hardening, CLI Improvements, And Docs Publication

This release focused on reliability and distribution: CI workflows were strengthened, the Rust solver CLI was expanded, and project documentation publishing was automated.

**What's New:**

* 🏗️ **Tag release workflow overhaul** - Release pipeline now publishes multi-platform Tauri artifacts (Linux, Windows, macOS) as GitHub Release assets
* 📚 **Automatic docs publishing** - Added documentation publishing workflow to GitHub Pages on pushes to `master`
* 🦀 **Expanded Rust solver CLI** - Improved CLI output (including JSON mode, tries, threats, refutations) and better FEN/Popeye parsing
* ♟️ **Solver engine hardening** - Improvements in alpha-beta pruning, transposition-table behavior, and winning-line extraction
* 📦 **Monorepo package-manager alignment** - `popeye-js` migrated from Yarn to pnpm
* 🧭 **Published docs structure** - Introduced project docs pages for solver CLI and release procedures
* 🔧 **Build fixes** - Restored `baseUrl` and pinned `concat@3.0.0` to resolve Angular build issues introduced in 0.2.0

**What changes for you:**

* Releases are more consistent across desktop targets
* Solver CLI output is richer and easier to integrate in automation
* Build and docs pipelines are more stable and predictable

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.2.0

### New Solver Foundations And Better Analysis Workflow

This release introduces the new Rust solver workspace and connects more of that solving pipeline to the application flow.

**What's New:**

* ♟️ **New solver core** - Added a Rust workspace with dedicated crates for chess rules, problem parsing, solving, and CLI tooling
* 📖 **Richer solution output** - Winning lines now support SAN-style formatting and improved textual reports
* 🚀 **Better search performance** - Added alpha-beta pruning, transposition-table caching, TTL handling, and iterative deepening in the solver stack
* 🎛️ **Improved GUI solving workflow** - The editor now supports engine selection, streaming updates while solving, live solution counts, and max-solution reporting
* 🖥️ **Desktop integration updates** - Tauri integration and CI packaging were improved for cross-platform desktop builds
* ✅ **Stronger validation** - Added end-to-end integration tests for chess positions and the streaming pipeline

**What changes for you:**

* You get earlier feedback while solutions are being generated
* Solution output is clearer and closer to standard chess notation
* The project has a stronger foundation for future solver and desktop releases

**Compatibility:**

* Existing problem files remain compatible

## Version 0.1.1

### Chessboard Reactivity And Stability Fixes

This maintenance release resolved rendering regressions and stabilized signal-based update flows.

**What's New:**

* 🔧 **Chessboard rendering fix** - Piece changes (add, remove, move) now trigger UI refresh correctly
* ⚙️ **Signal reactivity improvements** - Updated state propagation for `Problem` changes to improve consistency
* 🧹 **Refactoring for maintainability** - Cleanup of change-detection paths in the editor workflow

**What changes for you:**

* Board updates are reliably visible after edits
* Editing interactions feel more predictable
* Fewer visual inconsistencies while composing problems

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.1.0

### Performance and Stability Improvements

This release introduces significant improvements in responsiveness and interface fluidity.

**What's New:**

* ⚡ **Faster and more responsive interface** - The application responds instantly to your commands
* 🎯 **Immediate rendering** - No visible delays when modifying positions or stipulations
* 📊 **Improved stability** - Eliminated display update issues

**What changes for you:**

* The editor responds faster when you move pieces on the board
* The toolbar updates immediately when you change edit modes
* Database search is smoother and more responsive
* All changes to problems are displayed instantly without delays

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.13

### Desktop Foundations And Editor Usability

This release expanded platform support and introduced key editor usability enhancements.

**What's New:**

* Improved Popeye move parser as foundation for solution navigation with live board updates
* Added Tauri support with platform bridge integration and desktop build configuration
* Added Terms and Conditions page
* Improved small-screen layout behavior
* Added board coordinates
* Added copy/paste support for position editing, including toolbar buttons

![New buttons in toolbar for copy and paste](./release-notes-images/0.0.13/toolbar_copy_paste.png)

**What changes for you:**

* You can run desktop builds on supported platforms
* Position editing is faster with dedicated copy/paste controls
* Mobile and small-screen usage is more practical

**Compatibility:**

* Existing problem/database files remain compatible
  
## Version 0.0.12

### Publication Metadata Support

This release introduced publication-related metadata fields in the editor workflow.

**What's New:**

* Added controls for Publications, Awards, Tags, and related metadata

![Publication feature](./release-notes-images/0.0.12/publications.png)

**What changes for you:**

* You can store richer editorial and publication details directly in the problem record

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.11

### Layout Modernization And Import Fixes

This release focused on interface structure and SP2 import reliability.

**What's New:**

* Introduced a new grid layout for page composition
* Fixed SP2 import line-break handling

**What changes for you:**

* Screen layout is cleaner and more consistent
* SP2 imports are more robust in affected cases

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.10

### iOS Figurine Fix

This maintenance release corrected figurine rendering on iOS devices.

**What's New:**

* Fixed figurine display issues on iOS

**What changes for you:**

* Piece symbols render correctly on iPhone and iPad browsers

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.9

### Save, Layout, And File-Handling Stabilization

This release bundled a broad set of usability and reliability fixes across navigation, layout, and file operations.

**What's New:**

* Fixed local file save flow ([#129](https://github.com/dardino/scacchi-painter/issues/129))
* Kept `Configuration` menu item always visible
* Aligned `Save` button in the Save As page
* Improved toolbar stickiness and landing-page layout
* Fixed `Recent files` panel sizing and crash scenarios
* Improved engine toolbar scrolling on small devices
* Added SP2 open/save support with initial compatibility coverage ([#37](https://github.com/dardino/scacchi-painter/issues/37))

**What changes for you:**

* Save and navigation workflows are more stable
* Small-screen usability is improved
* SP2 workflows are supported with broader coverage than previous versions

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.8

### First Release Notes Publication

This release introduced the release-notes page itself.

**What's New:**

* Added project release-notes documentation page

**What changes for you:**

* Product updates are now documented in a centralized changelog narrative

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.7

### Early Editing Metadata Improvements

This release improved editor context and introduced basic author metadata management.

**What's New:**

* Added a FEN label under the chessboard in the editor page
* Added a minimal Author management flow

**What changes for you:**

* Position context is easier to read while editing
* You can store basic author information in the project workflow

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.6

### Twin Handling Fixes

This maintenance release corrected twin management behavior.

**What's New:**

* Fixed twins handling ([#151](https://github.com/dardino/scacchi-painter/issues/151))

**What changes for you:**

* Twin-related editing scenarios behave correctly in affected cases

**Compatibility:**

* Existing problem/database files remain compatible

## Version 0.0.5

### Foundational Editor And Database Features

This release laid important foundations for editing, database management, and user personalization.

**What's New:**

* Added WYSIWYG editor support for HTML content ([#149](https://github.com/dardino/scacchi-painter/issues/149))
* Implemented `Try this move` function
* Added menu command for problem listing ([#105](https://github.com/dardino/scacchi-painter/issues/105))
* Implemented twin editor ([#39](https://github.com/dardino/scacchi-painter/issues/39))
* Added localStorage preferences for sidebar size and solution font size
* Added controls to adjust plain-text solution font size
* Added resizable chessboard area in edit view
* Added database `Add`/`Remove` operations ([#119](https://github.com/dardino/scacchi-painter/issues/119))
* Added commands to insert problems into current database ([#106](https://github.com/dardino/scacchi-painter/issues/106))
* Added problem selection from database page ([#103](https://github.com/dardino/scacchi-painter/issues/103))

**What changes for you:**

* Editing and experimentation workflows are more complete
* Database operations are integrated into the UI flow
* Personalization settings persist between sessions

**Compatibility:**

* Existing problem/database files remain compatible
