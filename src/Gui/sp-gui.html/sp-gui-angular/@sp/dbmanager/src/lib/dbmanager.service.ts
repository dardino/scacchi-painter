import { Injectable } from "@angular/core";
import { IPiece } from "./helpers";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Problem } from "./models/problem";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DbmanagerService {
  CurrentDB: Document | null;
  private currentIndex = 0;
  private fileName = "";
  private solveOut$: Subject<string>;
  public All: Problem[] = [];

  get FileName() {
    return this.fileName;
  }
  get CurrentIndex() {
    return this.currentIndex;
  }
  private count = 1;
  get Count() {
    return this.count;
  }
  private currentProblem: Problem | null = null;
  get CurrentProblem() {
    return this.currentProblem;
  }
  private pieces: IPiece[] = [];
  get Pieces() {
    return this.pieces;
  }

  constructor(private bridge: HostBridgeService) {}

  LoadFromLocalStorage() {
    const db = localStorage.getItem("spdb");
    const fileName = localStorage.getItem("spdb_fname") ?? "temp.sp2";
    if (!db) {
      return;
    }
    this.reset();
    this.LoadFromText(db, fileName);
  }
  SaveToLocalStorage(text: string, fileName: string) {
    localStorage.setItem("spdb", text);
    localStorage.setItem("spdb_fname", fileName);
  }

  SaveToHost() {
    const file = this.getDbFile();
    this.bridge.saveFile(file);
  }

  LoadFromText(xmlText: string, fileName: string): Error | null {
    try {
      // tentativo 1: controllo se è un SP2
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      this.CurrentDB = xmlDoc;
      this.currentIndex = parseInt(
        this.CurrentDB.documentElement.getAttribute("lastIndex") ?? "0",
        10
      );
      this.All = Array.from(xmlDoc.querySelectorAll("SP_Item")).map((e) =>
        Problem.fromElement(e)
      );
      this.count = this.All.length;
      this.loadProblem();
      console.log("filename:", fileName);
      this.fileName = fileName;
      return null;
    } catch (ex) {
      console.error(ex);
      return ex as Error;
    }
  }

  GotoIndex(arg0: number) {
    if (arg0 >= this.count || arg0 < 0) {
      return;
    }
    this.currentIndex = arg0;
    console.log("goto: ", arg0);
    this.loadProblem();
  }

  private loadProblem() {
    if (this.CurrentDB == null) {
      return;
    }
    const el =
      this.CurrentDB?.querySelector(
        "SP_Item:nth-child(" + (this.currentIndex + 1) + ")"
      ) ?? null;
    this.currentProblem = el ? Problem.fromElement(el) : null;
    if (this.currentProblem == null) {
      return this.reset();
    }

    this.pieces = this.currentProblem.pieces;
  }

  private reset() {
    this.currentIndex = 0;
    this.currentProblem = null;
    this.pieces = [];
  }

  private getDbFile(): File {
    const text = this.CurrentDB?.documentElement.outerHTML ?? "";
    return new File([text], "test.sp2", { type: "text/xml" });
  }

  public startSolving(): Observable<string> | Error {
    if (!this.CurrentProblem) return new Error("unable to solve a null problem!");
    this.solveOut$ = new Subject();
    this.bridge.runSolve(this.CurrentProblem);
    return this.solveOut$.asObservable();
  }

  public stopSolving(): void {
    this.bridge.stopSolve();
    this.solveOut$.next("*** stopped by user ***");
    this.solveOut$.unsubscribe();
  }
}
