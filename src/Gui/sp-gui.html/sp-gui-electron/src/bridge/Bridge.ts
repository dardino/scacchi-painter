import { BridgeGlobal } from "../../../sp-gui-angular/@sp/host-bridge/src/lib/bridge-global";
import { Problem } from "../../../sp-gui-angular/@sp/dbmanager/src/lib/models";
import { Subject, Observable } from "rxjs";
import { ISolver } from "../solver/Solver";

export class Bridge implements BridgeGlobal {
  private solver$: Subject<string> = new Subject<string>();
  private interval: NodeJS.Timeout | null = null;
  constructor(public closeApp: () => void, private solver: ISolver) {}
  runSolve(problem: Problem): Observable<string> {
    this.solver$ = new Subject<string>();
    this.interval = setInterval(() => {
      this.solver$.next("sample solution output ... ");
    }, 2000);
    return this.solver$.asObservable();
  }
  stopSolve(): void {
    if (this.interval) clearInterval(this.interval);
    this.solver.stop();
    this.solver$.next("solution stopped!");
    this.solver$.unsubscribe();
  }
  saveFile(content: File): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
