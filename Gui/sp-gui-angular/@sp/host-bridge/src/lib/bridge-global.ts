import type { HalfMoveInfo } from "@dardino-chess/core";
import { Observable } from "rxjs";
import type { Problem } from "../../../dbmanager/src/lib/models/problem";

export const NativePopeyeEngine = "Popeye" as const;
export const AsmPopeyeEngine = "Popeye (ASM)" as const;
export const SpCoreEngine = "SpCore" as const;

export type Engines = typeof NativePopeyeEngine | typeof AsmPopeyeEngine | typeof SpCoreEngine;

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
  availableEngines(): Engines[];
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
