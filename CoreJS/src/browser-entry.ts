import { parseFEN } from './solver/parse';
import { parsePopeye } from './solver/popeye';
import { search } from './solver/search';
import { ProblemInput, SolverOptions, SolverResult } from './solver/types';

export async function solve(problem: ProblemInput, opts?: SolverOptions): Promise<SolverResult> {
  const popeyeInfo = problem.popeye ? parsePopeye(problem) : {} as any;
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
