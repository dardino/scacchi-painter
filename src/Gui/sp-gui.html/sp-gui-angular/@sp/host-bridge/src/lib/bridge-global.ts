import { Observable } from "rxjs";
import { Problem } from "../../../dbmanager/src/lib/models/problem";

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


export type SolutionMove = {
  moveN: number,
  notice: string,
  piece: string,
  move: string,
  extras: SolutionMove[],
  continuation: "threat" | "zugzwang" | "";
};
export type SolutionRow = { rowtype: "log" | "data", raw: string }
