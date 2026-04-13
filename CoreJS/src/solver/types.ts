/**
 * Types and small helpers for the CoreJS solver engine.
 *
 * This file defines the canonical input/output shapes used by the
 * reference solver implementation and the fixture runner.
 */

export type ProblemInput = {
  id: string;
  title?: string[];
  fen: string;
  popeye?: string; // original Popeye snippet (optional)
  stipulation?: string; // e.g. "#2"
  yacpdb_solution?: string; // raw solution text from YACPDB (optional)
  metadata?: Record<string, unknown>;
};

export type SolverOptions = {
  /** Maximum search depth in plies (overrides stipulation-derived depth) */
  maxDepth?: number;
  /** Time limit in milliseconds for the whole search */
  timeLimitMs?: number;
  /** Number of worker threads to use (root-splitting). 1 = single-thread */
  threads?: number;
  /** Limit on visited nodes (optional) */
  nodesLimit?: number;
  verbose?: boolean;
};

export type SolverResult = {
  id: string;
  solved: boolean;
  /** Depth actually searched (in plies) */
  depthSearched: number;
  timeMs: number;
  nodes: number;
  /** Best found line, as an array of SAN/algebraic strings (best effort) */
  bestLine?: string[];
  /** Numeric score (centipawns) or special mate encoding */
  score?: number;
  /** If mate detected, mate in N moves (positive) or null */
  mateIn?: number | null;
  error?: string;
  raw?: unknown; // implementation-specific extra data
};

/**
 * Convert a Popeye-style stipulation ("#N") into a default max depth (plies).
 * For #N we use 2*N plies (N full moves). Returns a sane default (8 plies)
 * when the stipulation is absent or unrecognized.
 */
export function stipulationToMaxDepth(stipulation?: string): number {
  if (!stipulation) return 8;
  const m = /#\s*(\d+)/.exec(stipulation);
  if (!m) return 8;
  const moves = Number(m[1]);
  if (!Number.isFinite(moves) || moves <= 0) return 8;
  return moves * 2;
}

export const DEFAULT_SOLVER_OPTIONS: SolverOptions = {
  maxDepth: undefined,
  timeLimitMs: 30_000,
  threads: 1,
  nodesLimit: undefined,
  verbose: false,
};

export default {} as const;
