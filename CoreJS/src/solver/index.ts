import { ProblemInput, SolverOptions, SolverResult } from "./types";

export async function solve(problem: ProblemInput, opts?: SolverOptions): Promise<SolverResult> {
  // Use the Node-specific engine when running under Node.js (server/CLI).
  // For browser builds, dynamically import only the pure-TS search implementation
  // to avoid bundling Node builtins (child_process, fs, etc.).
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  if (isNode) {
    // Use a non-literal specifier so bundlers don't resolve the Node-only module for browser builds
    const enginePath = '../' + 'engine.node';
    const { solve: engineSolve } = await import(enginePath as any);
    return engineSolve(problem, opts);
  }

  // Browser-friendly fallback: parse FEN and call the in-memory `search` implementation.
  const { parseFEN } = await import('./parse');
  const { search } = await import('./search');

  const popeyeInfo = problem.popeye ? await (await import('./popeye')).parsePopeye(problem) : {} as any;
  const mergedProblem: any = { ...problem };
  if (popeyeInfo.fen && !mergedProblem.fen) mergedProblem.fen = popeyeInfo.fen as string;
  if (popeyeInfo.stipulation && !mergedProblem.stipulation) mergedProblem.stipulation = popeyeInfo.stipulation as string;

  const parsed = parseFEN(mergedProblem);
  const bbs = parsed.bitboards;
  const color = parsed.sideToMove as 'w' | 'b';
  const maxDepth = (opts && opts.maxDepth) ? opts.maxDepth : 8;

  const s = await search(bbs, color, maxDepth, opts?.timeLimitMs ?? 30000);
  const res: SolverResult = {
    id: problem.id,
    solved: !!s.bestLine && s.bestLine.length > 0,
    depthSearched: maxDepth,
    timeMs: s.timeMs,
    nodes: s.nodes,
    bestLine: s.bestLine,
    score: s.score,
    mateIn: s.mateIn,
    raw: { ...s }
  };
  return res;
}

// No default export — `solve` is exported as a named export above
