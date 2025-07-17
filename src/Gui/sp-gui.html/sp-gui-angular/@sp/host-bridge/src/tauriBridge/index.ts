// When using the Tauri API npm package:
import { parsePopeyeRow } from '@ph/moveParser';
import { problemToPopeye } from '@ph/problemToPopeye';
import { Problem } from '@sp/dbmanager/src/lib/models';
import { invoke } from '@tauri-apps/api/core';
import { Event, listen } from '@tauri-apps/api/event';
import { BehaviorSubject, Observable } from 'rxjs';
import { BridgeGlobal, Engines, EOF, SolutionRow, SolveModes } from '../lib/bridge-global';

class TauriBridge implements BridgeGlobal {

  constructor() {
    listen('popeye-update', (event: Event<string>) => {
      this.processData(event.payload ?? "");
    });
  }

  private processData(data: string) {
    const mov = parsePopeyeRow(data);
    const halfMoves = mov.flatMap((m) => m[1]).filter(move => !!move);
    this.solver$.next({ raw: data, rowtype: mov.length ? "data" : "log", moveTree: halfMoves });
    if (data.indexOf("solution finished") > -1) {
      this.endSolve({ exitCode: 0, message: `program exited with code: 0` });
    }
  }

  private endSolve(reason: EOF) {
    this.solver$.next(reason);
    setTimeout(() => this.solver$.unsubscribe(), 500);
  }

  openFile(): File | PromiseLike<File | null> | null {
    alert('openFile not implemented');
    throw new Error('Method not implemented.');
  }
  saveFile(_content: File): string | Promise<string> {
    alert('saveFile not implemented');
    throw new Error('Method not implemented.');
  }
  closeApp?(): void {
    invoke('close_app');
  }
  stopSolve(): void {
    this.endSolve({ exitCode: -1, message: "solution stopped!" });
  }
  private solver$: BehaviorSubject<SolutionRow | EOF>;
  runSolve(CurrentProblem: Problem, engine: Engines, mode: SolveModes): Observable<SolutionRow | EOF> | Error {
    if (engine !== "Popeye") {
      return new Error("Engine not found!");
    }

    this.solver$ = new BehaviorSubject<SolutionRow | EOF>(
      {
        raw: `starting engine <${engine}>`,
        rowtype: "log",
        moveTree: [],
      }
    );

    const problem = problemToPopeye(CurrentProblem, mode).join("\n");
    this.startSolve(problem);

    return this.solver$.asObservable();
  }
  private startSolve(problem: string) {
    // Log del comando inviato all'host
    problem.split("\n").forEach((row) => {
      setTimeout(() => {
        this.solver$.next({ raw: row, rowtype: "log", moveTree: [] });
      }, 1);
    });
    invoke('run_popeye', { name: problem }).then((result) => {
      this.endSolve({ exitCode: 0, message: `program exited with code: 0 ${result}` });
    })
  }
  supportsEngine(engine: Engines): boolean {
    return engine === "Popeye";
  }
}

window.Bridge = new TauriBridge();
