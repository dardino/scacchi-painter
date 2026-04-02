# CoreRust Workspace

`CoreRust` hosts the new Rust solver workspace for chess problem solving.

The workspace is being introduced incrementally, milestone by milestone, so the early structure must already support three constraints:

1. reuse across pure library code, CLI tooling, and future Tauri integration
2. Popeye-compatible input from the existing frontend pipeline
3. future fairy extensions without forcing destructive refactors in the orthodox core

This directory currently contains the bootstrap delivered by Milestone 01: workspace layout, crate boundaries, shared dependencies, minimal public APIs, and an initial automated test suite.

## Milestone 01 scope

Included in this milestone:

1. Cargo workspace root and shared dependency management
2. initial crate structure for domain, input, solver, and CLI
3. minimal stable contracts between crates
4. unit tests and end-to-end MVP tests for the bootstrap flow
5. documentation for architecture, branch policy, and next-step evolution

Explicitly out of scope for this milestone:

1. real orthodox move generation
2. real Popeye parsing coverage beyond a stub MVP contract
3. directmate search logic beyond a placeholder API
4. fairy pieces, fairy conditions, or parallel search implementation
5. Tauri adapter code

## Current workspace layout

```text
CoreRust/
├── Cargo.toml
├── Cargo.lock
├── README.md
├── ARCHITECTURE.md
├── apps/
│   └── solver-cli/
└── crates/
	├── chess-core/
	├── problem-io/
	└── problem-solver/
```

Notes:

1. `target/` is a build artifact directory and should not be committed.
2. `apps/` hosts executable entry points.
3. `crates/` hosts reusable libraries.

## Crates created now

### `crates/chess-core`

Responsibility:

1. foundational chess domain types
2. position representation
3. side-to-move semantics
4. future home for orthodox legality, move generation, board state, and check detection

Current public role:

1. exposes `Side`
2. exposes `Position`
3. defines `CoreError`

Constraint:

1. must remain independent from parser, CLI, Tauri, and UI concerns

### `crates/problem-io`

Responsibility:

1. Popeye-compatible input surface
2. parsing and AST representation
3. mapping from text input to internal solver-facing problem definitions
4. future compatibility reporting for unsupported directives and capabilities

Current public role:

1. exposes `PopeyeAst`
2. exposes `ProblemDefinition`
3. exposes `ParseError`
4. exposes `parse_popeye()` and `ast_to_problem()`

Constraint:

1. syntax compatibility and semantic validation should remain separable

### `crates/problem-solver`

Responsibility:

1. stipulation-oriented solving contract
2. solver configuration and result model
3. future search orchestration, node expansion, and line validation
4. future seam for deterministic vs parallel solving modes

Current public role:

1. exposes `SolverConfig`
2. exposes `SearchResult`
3. exposes `SolverError`
4. exposes `solve()`

Constraint:

1. it may depend on `problem-io` and `chess-core`, but not on Tauri or frontend integration code

### `apps/solver-cli`

Responsibility:

1. executable shell for local development
2. parsing and solving smoke tests from the command line
3. future home for regression corpus runs, debugging flags, and benchmark entry points

Current public role:

1. parses a simple `--input` argument
2. invokes the shared parser and solver contracts
3. prints formatted solver output

Constraint:

1. must stay a thin adapter above reusable library crates

## Crates planned for later milestones

These are intentionally not created yet because they would add structure before the corresponding runtime behavior exists.

### `crates/fairy-registry`

Planned purpose:

1. dynamic registration of fairy pieces and conditions
2. extension hooks isolated from the orthodox core

### `crates/search-parallel`

Planned purpose:

1. root-split and first-ply parallel execution helpers
2. deterministic merge strategies for result ordering

### `crates/solver-tauri-adapter`

Planned purpose:

1. Tauri request and response DTOs
2. command handlers
3. progress, cancellation, and job lifecycle management

### `benches/solver-bench`

Planned purpose:

1. repeatable benchmark harness
2. performance baselines for single-thread and parallel search

## Dependency graph

Current intended dependency direction:

```text
chess-core
	↑
problem-io
	↑
problem-solver
	↑
solver-cli
```

More explicitly:

1. `chess-core` depends only on shared utility crates from the workspace dependency set
2. `problem-io` depends on `chess-core`
3. `problem-solver` depends on `problem-io` and `chess-core`
4. `solver-cli` depends on `problem-solver` and `problem-io`

Dependencies that are intentionally forbidden:

1. `chess-core -> problem-io`
2. `chess-core -> problem-solver`
3. any core crate -> Tauri
4. `solver-cli -> GUI or frontend code`

## Public API baseline

The initial API surface should stay intentionally small until Milestone 02 and 03 settle the real domain model.

Current baseline:

```rust
// chess-core
pub enum Side { White, Black }
pub struct Position {
	pub fen: String,
	pub side_to_move: Side,
}

// problem-io
pub struct PopeyeAst {
	pub stipulation: String,
	pub fen: String,
}

pub struct ProblemDefinition {
	pub position: Position,
	pub stipulation: String,
}

pub fn parse_popeye(input: &str) -> Result<PopeyeAst, ParseError>;
pub fn ast_to_problem(ast: PopeyeAst) -> ProblemDefinition;

// problem-solver
pub struct SolverConfig {
	pub max_depth: u16,
	pub deterministic: bool,
}

pub struct SearchResult {
	pub solved: bool,
	pub explored_nodes: u64,
}

pub fn solve(problem: &ProblemDefinition, config: &SolverConfig) -> Result<SearchResult, SolverError>;
```

This API is deliberately simple, because its job in Milestone 01 is to lock crate boundaries, not to solve the full chess domain yet.

## Conventions

### Error handling

1. use `thiserror` for domain and crate-local error enums
2. use `anyhow` only at executable boundaries such as CLI binaries
3. do not leak Tauri or transport-specific error types into core crates
4. model unsupported capabilities explicitly rather than hiding them behind generic parse failures

### Logging

1. use `tracing` inside libraries
2. initialize subscribers only in binaries or adapters
3. keep logs structured enough to support future debugging of search trees and parser diagnostics

### Testing

1. unit tests live next to crate code for narrow behavior
2. cross-crate integration tests live under `tests/` in the consuming crate
3. the current baseline covers core data creation, parser behavior, solver contract, CLI formatting, and parser-to-solver flow

### Feature flags

Feature flags are not required yet, but the intended use is:

1. `parallel` for root-split search support
2. `fairy` for extension points that should stay optional during orthodox MVP work
3. `tauri-adapter` only in the future integration crate, not in the core workspace crates

## Branch strategy for this solver work

Recommended policy:

1. integration branch: `refactoring`
2. milestone branches: `milestone/NN-slug`
3. each milestone branch contains only work for that milestone
4. milestone PRs target `refactoring`
5. merge to `master` only after the integrated Rust solver work is validated end-to-end

Current branch for this milestone:

1. `milestone/01-workspace-architecture`

Recommended PR title:

1. `[Milestone 01] Bootstrap Rust solver workspace architecture`

## Commands

Quick validation:

```bash
cd CoreRust
cargo check
cargo test
```

CLI smoke run:

```bash
cd CoreRust
cargo run -p solver-cli -- --input "BeginProblem"
```

## Current test coverage

The workspace currently contains:

1. unit tests in `chess-core`
2. unit tests in `problem-io`
3. unit tests in `problem-solver`
4. end-to-end integration tests in `problem-solver/tests`
5. CLI behavior tests in `solver-cli`

This gives Milestone 01 a basic safety net for refactoring the contracts in the next milestones.

## Next milestones

Planned progression:

1. Milestone 02: orthodox core MVP in `chess-core`
2. Milestone 03: Popeye-compatible input MVP in `problem-io`
3. Milestone 04: directmate single-thread in `problem-solver`
4. Milestone 05: CLI tooling, regression corpus, and debug support
5. Milestone 06: parallel root search
6. Milestone 07: fairy extensibility foundation
7. Milestone 08: Tauri adapter

For the detailed design rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).
