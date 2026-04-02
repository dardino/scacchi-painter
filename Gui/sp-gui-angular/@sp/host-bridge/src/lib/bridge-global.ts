import type { HalfMoveInfo } from "@dardino-chess/core";
import { Observable } from "rxjs";
import type { Problem } from "../../../dbmanager/src/lib/models/problem";
export type Engines = "Popeye" | "SpCore";
export interface BridgeGlobal {
  openFile(): File | PromiseLike<File | null> | null;
  saveFile(content: File): string | Promise<string>;
  closeApp?(): void;
  stopSolve(): void;
  runSolve(
    CurrentProblem: Problem,
    engine: Engines,
    mode: SolveModes
  ): Observable<SolutionRow | EOF> | Error;
  supportsEngine(engine: Engines): boolean;
}

export interface EOF {
  exitCode: number;
  message: string;
}

export type SolveModes = "start" | "try";

export interface SolutionRow {
  rowtype: "log" | "data";
  raw: string;
  moveTree: HalfMoveInfo[];
}
