# solver-cli

`solver-cli` is the Rust command-line entry point for the chess problem solver. It reads Popeye-style input, runs the shared Rust solver, and prints either human-readable text or JSON.

## What it solves

The CLI is intended for:

1. quick local debugging of a single problem
2. regression checks against a corpus of problems
3. inspection of key moves, tries, threats, and refutations from the terminal
4. benchmarking repeated runs on the same input

The binary stays thin. All solver logic lives in the shared solver crate, while the CLI only parses arguments, loads input, and formats the output.

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

### `--show-all-defenses`

Shows every defensive continuation instead of collapsing identical mate continuations.

This flag is also accepted as `showAllDefenses` for compatibility with older naming styles.

### `--format`

Chooses the output format.

Supported values:

1. `text`
2. `json`

### `--stream-solutions`

Enables streaming output while the solver is still exploring the tree.

### `--benchmark-runs`

Runs the solver repeatedly and reports aggregate timing information.

### `--corpus-dir`

Runs every problem in a directory and prints a report for each case.

## Output shape

When the solver finds a direct mate, the CLI prints the key move and the defense lines.

When `--refutations-try` is enabled, the CLI also prints try moves, numbered threat lines, and `but:` refutations when a try is spoiled immediately.

If a try does not produce direct mate threats, it is classified as zugzwang.

## Practical example

```sh
solver-cli \
  --input-text "Stipulation: #2\nFEN: 8/8/6p1/5p2/5p2/5k1P/1nB4P/4RK2 w - - 0 1" \
  --refutations-try=2
```
