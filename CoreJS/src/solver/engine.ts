import { Bitboard } from "../board/board.types";
import { MoveGeneratorMap } from "../pieces/piece.helpers";
import { parseFEN } from "./parse";
import { DEFAULT_SOLVER_OPTIONS, ProblemInput, SolverOptions, SolverResult } from "./types";

function indexToSquare(idx: number): string {
  const file = String.fromCharCode(97 + (idx % 8));
  const rank = Math.floor(idx / 8) + 1;
  return `${file}${rank}`;
}

function bitboardToIndexes(bb: Bitboard): number[] {
  const out: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (((bb >> BigInt(i)) & 1n) === 1n) out.push(i);
  }
  return out;
}

/**
 * Very small reference solver engine: builds pseudo-legal moves for the side to move
 * and returns the first found move as the "best line". This is intentionally
 * minimal and will be expanded with full search and legality checks later.
 */
export async function solve(problem: ProblemInput, opts?: SolverOptions): Promise<SolverResult> {
  const start = Date.now();
  const mergedOpts = { ...DEFAULT_SOLVER_OPTIONS, ...(opts || {}) };

  try {
    const parsed = parseFEN(problem);
    const bbs = parsed.bitboards;
    const color = parsed.sideToMove;

    // collect piece notations for the side to move (single-letter piece keys)
    const pieceKeys: string[] = [];
    for (const k of bbs.keys()) {
      if (!k) continue;
      if (!/^[A-Za-z]$/.test(k)) continue;
      if (color === "w" && k === k.toUpperCase()) pieceKeys.push(k);
      if (color === "b" && k === k.toLowerCase()) pieceKeys.push(k);
    }

    const moves: string[] = [];

    for (const key of pieceKeys) {
      const pieceBB: Bitboard = (bbs.get(key) as Bitboard) || 0n;
      const srcIdxs = bitboardToIndexes(pieceBB);
      const generator = MoveGeneratorMap.get(key.toLowerCase());
      if (!generator) continue;

      for (const src of srcIdxs) {
        // build temp map where this notation contains only the single source bit
        const temp = new Map(bbs);
        temp.set(key, 1n << BigInt(src));

        const destBB = generator(temp as any, color as "w" | "b");
        const destIdxs = bitboardToIndexes(destBB as Bitboard);
        for (const d of destIdxs) {
          const move = `${key}-${indexToSquare(src)}-${indexToSquare(d)}`;
          moves.push(move);
        }
      }
    }

    const timeMs = Date.now() - start;

    const result: SolverResult = {
      id: problem.id,
      solved: false,
      depthSearched: moves.length > 0 ? 1 : 0,
      timeMs,
      nodes: moves.length,
      bestLine: moves.length > 0 ? [moves[0]] : undefined,
      score: undefined,
      mateIn: null,
      raw: { moves: moves.slice(0, 200) },
    };

    return result;
  }
  catch (err: any) {
    return {
      id: problem.id,
      solved: false,
      depthSearched: 0,
      timeMs: Date.now() - start,
      nodes: 0,
      error: err?.message || String(err),
    } as SolverResult;
  }
}

export default { solve };
