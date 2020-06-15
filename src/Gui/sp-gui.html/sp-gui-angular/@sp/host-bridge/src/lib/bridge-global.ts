import { Observable } from "rxjs";
import { Problem } from "../../../dbmanager/src/lib/models/problem";

export interface BridgeGlobal {
  saveFile(content: File): Promise<string>;
  closeApp?(): void;
  stopSolve(): void;
  runSolve(CurrentProblem: Problem, engine: string): Observable<string | EOF> | Error;
}

export interface EOF {
  exitCode: number;
  message: string;
}
