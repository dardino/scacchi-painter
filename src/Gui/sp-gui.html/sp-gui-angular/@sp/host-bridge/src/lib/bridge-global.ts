import { Observable } from "rxjs";
import { Problem } from "../../../dbmanager/src/lib/models/Problem";

export interface BridgeGlobal {
  openFile(): File | PromiseLike<File | null> | null;
  saveFile(content: File): string | Promise<string>;
  closeApp?(): void;
  stopSolve(): void;
  runSolve(
    CurrentProblem: Problem,
    engine: string
  ): Observable<string | EOF> | Error;
  supportsEngine(engine: string): boolean;
}

export interface EOF {
  exitCode: number;
  message: string;
}
