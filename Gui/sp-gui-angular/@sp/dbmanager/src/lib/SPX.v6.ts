import { HalfMoveInfo } from "@dardino-chess/core";
import { IDbSpX_V3 } from "./SPX.v3";
import { IDbSpX_V4 } from "./SPX.v4";
import { Awards, convertDbToV5, IDbSpX_V5, IProblemV5, isV5 } from "./SPX.v5";

export type IProblemV6 = IProblemV5 & {
  jsonSolutions: HalfMoveInfo[];
};

export interface IDbSpX_V6 {
  lastIndex: number;
  name: string;
  problems: Partial<IProblemV6>[];
  awards: Awards[];
  version: 6;
}

export interface FutureSp3Database {
  lastIndex: number;
  name: string;
  problems: Array<Partial<IProblemV6>>;
  awards: Awards[];
  version: number;
}

export class FutureSp3VersionError extends Error {
  constructor(
    public readonly fileVersion: number,
    public readonly supportedVersion: number = 6,
  ) {
    super(`SP3 file version ${fileVersion} is newer than the supported version ${supportedVersion}.`);
    this.name = "FutureSp3VersionError";
  }
}

export function isV6(obj: unknown): obj is IDbSpX_V6 {
  return "version" in (obj as Record<string, unknown>) && (obj as Record<string, unknown>).version === 6;
}

export function convertDbToV6(
  obj: IDbSpX_V6 | IDbSpX_V5 | IDbSpX_V4 | IDbSpX_V3,
): IDbSpX_V6 {
  if (isV6(obj)) {
    return {
      ...obj,
      problems: obj.problems.map(problem => ({
        ...problem,
        jsonSolutions: Array.isArray(problem.jsonSolutions) ? problem.jsonSolutions : [],
      })),
    };
  }

  const v5 = isV5(obj) ? obj : convertDbToV5(obj);
  return {
    ...v5,
    problems: v5.problems.map(problem => ({
      ...problem,
      jsonSolutions: Array.isArray(problem.jsonSolutions) ? problem.jsonSolutions : [],
    })),
    version: 6,
  };
}
