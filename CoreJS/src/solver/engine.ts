import { Bitboard } from "../board/board.types";
import { MoveGeneratorMap } from "../pieces/piece.helpers";
import { parseFEN } from "./parse";
import { parsePopeye } from "./popeye";
import { DEFAULT_SOLVER_OPTIONS, ProblemInput, SolverOptions, SolverResult, stipulationToMaxDepth } from "./types";
import { search } from "./search";

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
    // If a Popeye snippet is provided, prefer its FEN/stipulation when missing
    const popeyeInfo = problem.popeye ? parsePopeye(problem) : {};
    const mergedProblem: ProblemInput = { ...problem };
    if (popeyeInfo.fen && !mergedProblem.fen) mergedProblem.fen = popeyeInfo.fen as string;
    if (popeyeInfo.stipulation && !mergedProblem.stipulation) mergedProblem.stipulation = popeyeInfo.stipulation as string;

    const parsed = parseFEN(mergedProblem);
    const bbs = parsed.bitboards;
    const color = parsed.sideToMove;

    const maxDepthUsed = mergedOpts.maxDepth ?? stipulationToMaxDepth(mergedProblem.stipulation);

    // delegate to search implementation (iterative deepening + negamax)
    const s = await search(bbs, color as 'w'|'b', maxDepthUsed, mergedOpts.timeLimitMs ?? 30_000);
    const res: SolverResult = {
      id: problem.id,
      solved: !!s.bestLine && s.bestLine.length > 0,
      depthSearched: maxDepthUsed,
      timeMs: s.timeMs,
      nodes: s.nodes,
      bestLine: s.bestLine,
      score: s.score,
      mateIn: s.mateIn,
      raw: { ...s }
    };

    return res;
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
