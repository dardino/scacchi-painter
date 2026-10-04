import { HalfMoveInfo } from "@dardino-chess/core";
import { IDbSpX_V3, convertProblemV3ToV4, isV3 } from "./SPX.v3";
import { IDbSpX_V4, IProblemV4, isV4, verifyProblemV4 } from "./SPX.v4";

export interface AwardsProblem {
  problemID: IProblemV5["uuid"];
  rankInAward: number; // -1 se non ancora valutato
}
export interface Awards {
  awardsTitle: string;
  awardsDescription: string;
  awardsDate: string;
  awardsJudge: string;
  awardsProblems: AwardsProblem[];
}
export type IProblemV5 = IProblemV4 & {
  uuid: `${string}-${string}-${string}-${string}-${string}`;
  jsonSolutions: HalfMoveInfo[];
};

export interface IDbSpX_V5 {
  lastIndex: number;
  name: string;
  problems: Partial<IProblemV5>[];
  awards: Awards[];
  version: 5;
}

export function isV5(obj: unknown): obj is IDbSpX_V5 {
  return "version" in (obj as Record<string, unknown>) && (obj as Record<string, unknown>).version === 5;
}

function makeProblemV5(problem: Partial<IProblemV4>, index: number): Partial<IProblemV5> {
  return {
    ...problem,
    uuid: `p-${index}-${crypto.randomUUID()}`,
    jsonSolutions: [],
  } as Partial<IProblemV5>;
}

export function convertDbToV5(obj: IDbSpX_V5 | IDbSpX_V4 | IDbSpX_V3): IDbSpX_V5 {
  if (isV5(obj)) {
    return obj;
  }

  const v4 = isV4(obj)
    ? verifyProblemV4(obj)
    : isV3(obj)
      ? {
          ...obj,
          problems: obj.problems.map(problem => convertProblemV3ToV4(problem)),
          version: 4 as const,
        }
      : {
          lastIndex: 0,
          name: "",
          problems: [],
          version: 4 as const,
        };

  return {
    ...v4,
    problems: v4.problems.map((problem, index) => makeProblemV5(problem as Partial<IProblemV5>, index)),
    awards: [],
    version: 5,
  };
}
