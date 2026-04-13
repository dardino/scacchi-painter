import { ProblemInput, SolverOptions, SolverResult } from "./types";
import { solve as engineSolve } from "./engine";

export async function solve(problem: ProblemInput, opts?: SolverOptions): Promise<SolverResult> {
  return engineSolve(problem, opts);
}

export default { solve };
