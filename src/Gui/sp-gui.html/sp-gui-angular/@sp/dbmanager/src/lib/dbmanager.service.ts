import { Injectable } from "@angular/core";
import { IPiece } from "./helpers";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Problem } from "./models/Problem";

@Injectable({
  providedIn: "root",
})
export class DbmanagerService {
  CurrentDB: Document | null;
  private currentIndex = 0;
  private fileName = "";
  public All: Element[] = [];

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
      this.All = Array.from(xmlDoc.querySelectorAll("SP_Item"));
      console.log(this.All);
      this.currentIndex = parseInt(
        this.CurrentDB.documentElement.getAttribute("lastIndex") ?? "0",
        10
      );
      this.count = this.All.length;
      this.loadProblem();
      this.fileName = fileName;
      return null;
    } catch (ex) {
      console.error(ex);
      return ex as Error;
    }
  }

  MovePrevious() {
    if (this.currentIndex <= 0) {
      return;
    }
    this.currentIndex--;
    this.loadProblem();
  }
  MoveNext() {
    if (this.currentIndex >= this.count - 1) {
      return;
    }
    this.currentIndex++;
    this.loadProblem();
  }
  GotoIndex(arg0: number) {
    if (arg0 >= this.count || arg0 < 0) {
      return;
    }
    this.currentIndex = arg0;
    console.log("goto: ", arg0);
    this.loadProblem();
  }
  getPage(page: number, pageSize: number): Element[] {
    return Array.from(this.CurrentDB?.querySelectorAll("SP_Item:nth-child(" + (page * pageSize + 1) + ")") ?? []).slice(0, pageSize);
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

    this.pieces = this.currentProblem.getPieces();
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
}
