import {
  BridgeGlobal,
  EOF,
} from "../../../sp-gui-angular/@sp/host-bridge/src/lib/bridge-global";
import { Problem } from "../../../sp-gui-angular/@sp/dbmanager/src/lib/models";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { ISolver } from "../solver/Solver";

export class Bridge implements BridgeGlobal {
  private solver$: Subject<string | EOF> = new BehaviorSubject<string | EOF>("");
  private interval: NodeJS.Timeout | null = null;
  constructor(public closeApp: () => void, private solvers: ISolver[]) {}
  
  runSolve(problem: Problem, engine: string): Observable<string | EOF> | Error {
    const solver = this.solvers.find((f) => f.key === engine);
    if (!solver) {
      return new Error(
        `engine <${engine}> not supported, available values are: ${this.solvers
          .map((f) => f.key)
          .join("; ")}!`
      );
    } else {
      this.solver$ = new BehaviorSubject<string | EOF>(`starting engine <${engine}>`);
      solver.start(problem, (msg) => {
        this.solver$.next(msg);
      }, (eof: EOF)=> {
        this.solver$.next(eof);
        this.solver$.unsubscribe();
      });
      return this.solver$.asObservable();
    }
  }
  stopSolve(): void {
    if (this.interval) clearInterval(this.interval);
    this.solvers.forEach((s) => s.running && s.stop());
    this.solver$.next("solution stopped!");
    this.solver$.unsubscribe();
  }
  saveFile(content: File): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
