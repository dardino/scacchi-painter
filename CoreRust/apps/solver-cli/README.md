# solver-cli

`solver-cli` is the Rust command-line entry point for the chess problem solver. It reads Popeye-style input, runs the shared Rust solver, and prints either human-readable text or JSON.

## What it solves

The CLI is intended for:

1. quick local debugging of a single problem
2. regression checks against a corpus of problems
3. inspection of key moves, tries, threats, and refutations from the terminal
4. benchmarking repeated runs on the same input

The binary stays thin. All solver logic lives in `problem-solver`, while the CLI only parses arguments, loads input, and formats the output.

## Input

You can provide input in one of two ways:

1. `--input-text "..."`
2. `--input-file path/to/problem.txt`

The input must be Popeye-style text with a stipulation and a FEN position.

Example:

```text
Stipulation: #2
FEN: 8/8/6p1/5p2/5p2/5k1P/1nB4P/4RK2 w - - 0 1
```

## Core flags

### `--refutations-try`

Controls whether tries and refutations are shown.

Semantics:

1. omitted: do not show tries
2. bare flag: defaults to `1`
3. explicit value: uses that threshold
4. `0`: keep the current hidden behavior

Examples:

```sh
solver-cli --input-file problem.txt --refutations-try
solver-cli --input-file problem.txt --refutations-try=2
solver-cli --input-file problem.txt --refutations-try=0
```

### `--show-all-defenses`

Shows every defensive continuation instead of collapsing identical mate continuations.

This flag is also accepted as `showAllDefenses` for compatibility with older naming styles.

Example:

```sh
solver-cli --input-file problem.txt --refutations-try=2 --show-all-defenses
```

### `--format`

Chooses the output format.

Supported values:

1. `text`
2. `json`

Text mode is useful for reading the analysis directly in the terminal. JSON mode is intended for downstream tooling.

### `--stream-solutions`

Enables streaming output while the solver is still exploring the tree.

### `--benchmark-runs`

Runs the solver repeatedly and reports aggregate timing information.

### `--corpus-dir`

Runs every problem in a directory and prints a report for each case.

## Output shape

When the solver finds a direct mate, the CLI prints the key move and the defense lines.

When `--refutations-try` is enabled, the CLI also prints:

1. try moves
2. numbered threat lines
3. `but:` refutations when a try is spoiled immediately

If a try does not produce direct mate threats, it is classified as zugzwang.

### Example output

The exact text depends on the problem, but the structure is:

```text
1. key move
   1... defense 2. continuation
1. try ? threats: 2. threat move
   1... defense 2. continuation
  but: refutation!
```

## Practical example

Run the fixture that was used while tuning the threat and refutation output:

```sh
solver-cli \
  --input-text "Stipulation: #2\nFEN: 8/8/6p1/5p2/5p2/5k1P/1nB4P/4RK2 w - - 0 1" \
  --refutations-try=2
```

## Development notes

1. `--refutations-try` is implemented in `CoreRust/crates/problem-solver/src/lib.rs` and wired into the CLI config in `CoreRust/apps/solver-cli/src/main.rs`.
2. The solver result model now exposes structured try lines so the CLI can format them without re-deriving solver semantics.
3. `--show-all-defenses` only affects how repeated mate continuations are rendered; it does not change the underlying solution.

## Related docs

1. [CoreRust workspace README](../../README.md)
2. [Published CLI docs](../../docs/solver-cli.md)
