# CoreRust Architecture

This document captures the architectural decisions for Milestone 01 of the Rust solver workspace.

Its goal is to make the crate boundaries explicit before the real chess logic becomes large enough to make restructuring expensive.

## High-level design

The workspace is split by responsibility, not by deployment target.

That means:

1. reusable libraries own domain and solving logic
2. executable or integration layers stay thin
3. Tauri integration is deferred to a dedicated adapter layer rather than leaking UI concerns into the solver

The architectural direction is therefore:

```text
input text (Popeye-like)
    -> parser and AST
    -> problem definition
    -> solver orchestration
    -> future solution tree / diagnostics

orthodox core
    -> remains reusable from CLI, tests, and future Tauri adapter
```

## Why these crate boundaries

### Pragmatic MVP separation

The current split is:

1. `chess-core`
2. `problem-io`
3. `problem-solver`
4. `solver-cli`

This is a pragmatic midpoint.

It is more structured than a single-crate prototype, but less fragmented than a premature micro-crate layout.

Benefits:

1. parser concerns are already separate from search concerns
2. the CLI cannot accidentally become the real implementation home
3. future Tauri integration has an obvious insertion point above solver crates
4. the core can evolve independently of Popeye syntax details

Costs:

1. some domain types currently pass through `problem-io` instead of a dedicated `problem-domain` crate
2. refactoring may still be needed if `ProblemDefinition` grows substantially

This tradeoff is acceptable for Milestone 01 because the current goal is to stabilize direction, not optimize final layering.

## Long-term crate map

### Keep now

1. `crates/chess-core`
2. `crates/problem-io`
3. `crates/problem-solver`
4. `apps/solver-cli`

### Add later only when behavior exists

1. `crates/fairy-registry`
2. `crates/search-parallel`
3. `crates/solver-tauri-adapter`
4. `benches/solver-bench`

### Optional future split if pressure appears

If `ProblemDefinition`, stipulation metadata, capability flags, and semantic validation become too large, introduce:

1. `crates/problem-domain`

This crate would own shared problem-level types consumed by both `problem-io` and `problem-solver`.

Do not add it yet unless real duplication or cyclic pressure appears.

## Responsibilities crate by crate

### `chess-core`

Owns:

1. board representation
2. side to move
3. piece representation
4. squares, moves, make/unmake strategy
5. legality checks and check detection
6. future hooks for orthodox and fairy move semantics

Must not own:

1. parser grammar
2. CLI formatting
3. Tauri serialization contracts
4. milestone-specific debug adapters

### `problem-io`

Owns:

1. Popeye text compatibility layer
2. parsing diagnostics
3. AST types
4. semantic mapping from parsed input to solver-facing problem definitions
5. future unsupported-feature reporting

Must not own:

1. move search
2. Tauri commands
3. frontend formatting concerns

### `problem-solver`

Owns:

1. solver configuration
2. search orchestration
3. stipulation-driven solving contracts
4. future result trees and solution validation
5. future deterministic and parallel execution options

Must not own:

1. direct terminal I/O
2. Tauri job handling
3. input syntax parsing details beyond consuming mapped problem definitions

### `solver-cli`

Owns:

1. argument parsing
2. binary entry point
3. wiring parser and solver together for local use
4. future debug switches and regression corpus commands

Must not own:

1. business logic duplicated from libraries
2. solver internals hidden from tests behind process-only behavior

## Internal module direction

These modules do not all exist yet, but they are the intended structure as implementation grows.

### Planned modules inside `chess-core`

1. `board`
2. `position`
3. `square`
4. `piece`
5. `moves`
6. `legality`
7. `state`
8. `error`

### Planned modules inside `problem-io`

1. `lexer`
2. `parser`
3. `ast`
4. `diagnostics`
5. `mapper`
6. `capabilities`

### Planned modules inside `problem-solver`

1. `config`
2. `search`
3. `stipulation`
4. `result`
5. `validation`
6. `cancellation`
7. `ordering`

### Planned modules inside `solver-cli`

1. `commands`
2. `output`
3. `run` or equivalent execution helper

## Dependency rules

### Allowed dependencies

1. `problem-io -> chess-core`
2. `problem-solver -> chess-core`
3. `problem-solver -> problem-io`
4. `solver-cli -> problem-solver`
5. `solver-cli -> problem-io`

### Forbidden dependencies

1. `chess-core -> problem-io`
2. `chess-core -> problem-solver`
3. `problem-io -> problem-solver`
4. any current crate -> Tauri
5. any library crate -> binary-only error model such as `anyhow` in public APIs

## Error handling policy

Use layered error handling.

In library crates:

1. prefer explicit enums with `thiserror`
2. encode unsupported behavior clearly
3. preserve distinctions between syntactic parse failure, semantic unsupported feature, and solver unsupported stipulation

In binary crates:

1. use `anyhow::Result` at the outer boundary
2. convert domain errors only at the presentation edge

Reason:

1. CLI and Tauri adapters need flexibility
2. core crates need explicit contracts and testable failure semantics

## Logging policy

1. use `tracing` inside libraries for search diagnostics and parser events
2. initialize subscribers only in binaries or adapters
3. avoid coupling log setup to the core crates

This matters because search debugging and future cancellation/progress reporting will rely on consistent instrumentation.

## Test strategy

The current test baseline is intentionally small but layered.

### Unit tests

Purpose:

1. validate narrow behavior of each crate in isolation
2. lock the minimal contracts introduced in Milestone 01

Current examples:

1. position creation in `chess-core`
2. parser stub behavior in `problem-io`
3. stipulation acceptance and rejection in `problem-solver`
4. output formatting in `solver-cli`

### Integration tests

Purpose:

1. validate cross-crate wiring
2. protect future refactors of parser-to-solver flow

Current example:

1. `problem-solver/tests/end_to_end.rs` covers parse, map, and solve in sequence

### What not to do yet

1. no benchmark-driven assertions in unit tests
2. no heavyweight process-spawning tests for CLI while the binary remains a thin wrapper
3. no parser snapshot corpus until Milestone 03 introduces real grammar coverage

## Feature flag policy

Do not add feature flags just to anticipate future work.

Introduce them only when they control real optional behavior.

Expected later flags:

1. `parallel`
2. `fairy`
3. adapter-specific flags in integration crates only

## Branching and merge policy

Recommended process:

1. `refactoring` is the integration branch for Rust solver work
2. each milestone starts from `refactoring`
3. each milestone branch contains only the work for that milestone
4. milestone PRs target `refactoring`
5. merge to `master` only after integrated validation across milestones

Current milestone branch:

1. `milestone/01-workspace-architecture`

Reason:

1. this keeps architectural bootstrap separate from the later orthodox core and parser implementation work
2. reviewers can validate boundaries before reviewing chess logic

## Bootstrap sequence used in Milestone 01

The workspace was bootstrapped in this order:

1. create `CoreRust/Cargo.toml` workspace root
2. create reusable library crates under `crates/`
3. create `solver-cli` under `apps/`
4. configure shared workspace dependencies
5. wire crate-to-crate path dependencies
6. define minimal public contracts in each crate
7. add unit tests
8. add end-to-end integration tests
9. validate with `cargo check` and `cargo test`

This order matters because it validates boundaries before implementation grows.

## MVP versus long-term architecture

### MVP in Milestone 01

1. minimal `Position` and `Side`
2. minimal `PopeyeAst` and `ProblemDefinition`
3. minimal `SolverConfig`, `SearchResult`, and `solve()`
4. thin CLI wrapper
5. test coverage for bootstrap contracts

### Long-term target

1. real orthodox engine data structures in `chess-core`
2. real Popeye subset parser and diagnostics in `problem-io`
3. directmate search in `problem-solver`
4. later parallel search, fairy extensions, and Tauri adapter on top

The important rule is that long-term flexibility should come from boundaries and contracts, not from speculative abstraction inside empty code.

## Immediate next steps

1. implement orthodox board and move model in Milestone 02
2. replace the parser stub with a real Popeye-compatible subset in Milestone 03
3. move from placeholder `solve()` behavior to directmate DFS in Milestone 04

## Decision summary

The current workspace chooses the following:

1. pragmatic crate separation over a monolith
2. explicit dependency direction over convenience imports
3. minimal public APIs over premature domain completeness
4. thin adapters over duplicated logic
5. milestone-isolated branch work over mixed architectural and behavioral changes

That is the right bias for this stage of the project.
