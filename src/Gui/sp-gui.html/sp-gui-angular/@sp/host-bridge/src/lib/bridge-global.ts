import type { HalfMoveInfo } from "@dardino-chess/core";
import { Observable } from "rxjs";
import type { Problem } from "../../../dbmanager/src/lib/models/problem";

export interface BridgeGlobal {
  openFile(): File | PromiseLike<File | null> | null;
  saveFile(content: File): string | Promise<string>;
  closeApp?(): void;
  stopSolve(): void;
  runSolve(
    CurrentProblem: Problem,
    engine: string,
    mode: SolveModes
  ): Observable<SolutionRow | EOF> | Error;
  supportsEngine(engine: string): boolean;
}

export interface EOF {
  exitCode: number;
  message: string;
}

export type SolveModes = "start" | "try";

export interface SolutionRow {
  rowtype: "log" | "data",
  raw: string,
  moveTree: HalfMoveInfo[];
}
