import { Injectable } from "@angular/core";
import { IPiece, IProblem } from "./helpers";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Problem } from "./models/problem";
import { Observable, Subject, BehaviorSubject } from "rxjs";

interface IDbSpX {
  lastIndex: number;
  name: string;
  problems: Array<Partial<IProblem>>;
}

@Injectable({
  providedIn: "root",
})
export class DbmanagerService {
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
  get Pieces() {
    return this.currentProblem?.pieces ?? [];
  }

  constructor(private bridge: HostBridgeService) {}

  setCurrentProblem(problem: Problem) {
    this.currentProblem = problem;
  }

  async LoadFromLocalStorage() {
    const db = localStorage.getItem("spdb");
    const dbtype = localStorage.getItem("spdb_type") as "sp2" | "sp3";
    const fileName = localStorage.getItem("spdb_fname") ?? "temp.sp2";
    if (!db) {
      return;
    }
    this.reset();
    if (dbtype === "sp3") await this.LoadFromJson(db, fileName);
    else await this.LoadFromText(db, fileName);
  }
  async SaveToLocalStorage(
    text?: string,
    fileName?: string,
    type: "sp2" | "sp3" = "sp3"
  ) {
    if (text == null) {
      if (type === "sp2") {
        const xmlDoc = await this.ToXML();
        text = new XMLSerializer().serializeToString(xmlDoc.documentElement);
      } else {
        text = JSON.stringify(this.toJSON());
      }
    }
    localStorage.setItem("spdb", text);
    localStorage.setItem("spdb_type", type);
    localStorage.setItem("spdb_fname", fileName ?? this.fileName);
  }

  toJSON(): IDbSpX {
    return {
      lastIndex: this.currentIndex,
      problems: this.All.map((p) => p.toJson()),
      name: "Scacchi Painter X Database",
    };
  }

  private async ToXML(): Promise<XMLDocument> {
    const problems = await Promise.all(this.All.map((f) => f.toSP2Xml()));
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<ScacchiPainterDatabase></ScacchiPainterDatabase>`,
      "text/xml"
    );
    const root = doc.querySelector("ScacchiPainterDatabase") as Element;
    root.setAttribute("version", "0.1.0.2");
    root.setAttribute("name", "Scacchi Painter 2 Database");
    root.setAttribute("lastIndex", this.CurrentIndex.toFixed(0));
    problems.forEach((p) => root.appendChild(p));
    return doc;
  }

  async SaveToHost(type?: "sp2" | "sp3") {
    if (!type) type = this.fileName.substr(-4) === ".sp2" ? "sp2" : "sp3";
    const file = await this.getDbFile(type);
    this.bridge.saveFile(file, type);
  }
  async LoadFromJson(jsonString: string, fName: string): Promise<Error | null> {
    try {
      const obj = JSON.parse(jsonString) as IDbSpX;
      this.fileName = fName;
      this.All = obj.problems.map(p => Problem.fromJson(p));
      this.currentIndex = obj.lastIndex;
      return null;
    } catch (err) {
      return err;
    }
  }
  async LoadFromText(xmlText: string, fileName: string): Promise<Error | null> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      this.currentIndex = parseInt(
        xmlDoc.documentElement.getAttribute("lastIndex") ?? "0",
        10
      );
      this.All = await Promise.all(
        Array.from(xmlDoc.querySelectorAll("SP_Item")).map((e) =>
          Problem.fromElement(e)
        )
      );
      this.count = this.All.length;
      await this.loadProblem();
      this.fileName = fileName;
      return null;
    } catch (ex) {
      console.error(ex);
      return ex as Error;
    }
  }

  async GotoIndex(arg0: number) {
    if (arg0 >= this.count || arg0 < 0) {
      return;
    }
    this.currentIndex = arg0;
    await this.loadProblem();
  }

  private async loadProblem() {
    this.currentProblem = this.All[this.currentIndex];
    if (this.currentProblem == null) {
      return this.reset();
    }
  }

  private reset() {
    this.currentIndex = 0;
    this.currentProblem = null;
  }

  private async getDbFile(type: "sp2" | "sp3" = "sp3"): Promise<File> {
    if (type === "sp2") {
      const xmlDoc = await this.ToXML();
      const text = `<?xml version="1.0" encoding="utf-8"?>\r` + new XMLSerializer().serializeToString(xmlDoc.documentElement);
      return new File([text], this.fileName, { type: "application/xml" });
    } else {
      const text = JSON.stringify(this.toJSON());
      return new File([text], this.fileName, { type: "application/json" });
    }
  }

  public startSolving(): Observable<string> | Error {
    if (!this.currentProblem) {
      return new Error("unable to solve a null problem!");
    }
    this.solveOut$ = new Subject();
    this.bridge.startSolve(this.currentProblem);
    return this.solveOut$.asObservable();
  }

  public stopSolving(): void {
    this.bridge.stopSolve();
    this.solveOut$.next("*** stopped by user ***");
    this.solveOut$.unsubscribe();
  }
}
