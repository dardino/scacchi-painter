import { Injectable } from "@angular/core";
import { IProblem } from "./helpers";
import { Problem } from "./models/Problem";
import { FileSelected, FileService, FolderSelected } from "@sp/host-bridge/src/lib/fileService";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DropboxdbService, OneDriveService, LocalDriveService } from "./providers";

interface IDbSpX {
  lastIndex: number;
  name: string;
  problems: Array<Partial<IProblem>>;
  version: 3;
}

@Injectable({
  providedIn: "root",
})
export class DbmanagerService {
  private currentIndex = 0;
  private currentFile: FolderSelected | null = null;
  private workInProgress: Subject<boolean> = new Subject<boolean>();

  public All: Problem[] = [];
  get wip$() {
    return this.workInProgress.asObservable();
  }
  get FileName() {
    return this.currentFile?.meta.itemName;
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
  get CurrentFile(): Readonly<FolderSelected | null> {
    return this.currentFile;
  }

  constructor(
    private dropboxFS: DropboxdbService,
    private oneDriveFS: OneDriveService,
    private localDriveFS: LocalDriveService,
    private snackBar: MatSnackBar
  ) {}

  private get fileService(): FileService | null {
    switch (this.currentFile?.source) {
      case "dropbox":
        return this.dropboxFS;
      case "onedrive":
        return this.oneDriveFS;
      case "local":
        return this.localDriveFS;
      case "unknown":
      default:
        return null;
    }
  }

  //#region PUBLIC LOADS
  async Load({ file, meta, source }: FileSelected): Promise<Error | null> {
    this.workInProgress.next(true);
    this.reset();
    this.currentFile = { meta, source };
    const content = await file.text();
    const result = await this.loadFromContent(content);
    this.workInProgress.next(false);
    this.snackBar.open("Load db completed!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 2000,
    });
    return result;
  }
  async Reload(id?: number) {
    this.workInProgress.next(true);
    this.reset();
    this.currentFile = await this.loadFromLocalStorage();
    this.currentIndex = id ?? this.currentIndex;
    await this.loadProblem();
    this.workInProgress.next(false);
    this.snackBar.open("Load db completed!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 2000,
    });
  }
  SetFileMeta(meta: Omit<FileSelected, "file">) {
    this.currentFile = { ...meta };
  }
  //#endregion PUBLIC LOADS

  private async loadFromLocalStorage() {
    const spdb = localStorage.getItem("spdb") ?? null;
    const spdbInfo = localStorage.getItem("spdb_info") ?? null;
    if (spdb == null || spdbInfo == null) {
      return null;
    }
    await this.loadFromContent(spdb, "sp3");
    return JSON.parse(spdbInfo) as Pick<FileSelected, "meta" | "source">;
  }

  setCurrentProblem(problem: Problem) {
    this.currentProblem = problem;
  }

  private async saveToLocalStorage() {
    if (!this.currentFile) return;
    const text = JSON.stringify(this.toJSON());
    localStorage.setItem("spdb", text);
    localStorage.setItem("spdb_info", JSON.stringify(this.currentFile));
  }

  private toJSON(): IDbSpX {
    return {
      lastIndex: this.currentIndex,
      problems: this.All.map((p) => p.toJson()),
      name: "Scacchi Painter X Database",
      version: 3,
    };
  }

  private async ToXML(): Promise<XMLDocument> {
    const problems = await Promise.all(this.All.map((f) => f.toSP2Xml()));
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      "<ScacchiPainterDatabase></ScacchiPainterDatabase>",
      "text/xml"
    );
    const root = doc.querySelector("ScacchiPainterDatabase") as Element;
    root.setAttribute("version", "0.1.0.2");
    root.setAttribute("name", "Scacchi Painter 2 Database");
    root.setAttribute("lastIndex", this.CurrentIndex.toFixed(0));
    problems.forEach((p) => root.appendChild(p));
    return doc;
  }

  private async createFile(): Promise<File> {
    const type =
      this.currentFile?.meta.fullPath.substr(-4) === ".sp2" ? "sp2" : "sp3";
    const file = await this.getDbFile(type);
    return file;
  }

  private async download(file: File): Promise<void> {
    const fileSaver = await import("file-saver");
    fileSaver.saveAs(file, this.FileName);
  }

  public async Save() {
    this.workInProgress.next(true);
    // first of all save the current problem into local storage
    await this.saveToLocalStorage();
    const file = await this.createFile();
    const fs = this.fileService;
    const cf = this.currentFile;
    if (fs && cf) {
      const result = await fs.saveFileContent(file, cf.meta);
      if (!(result instanceof Error)) {
        this.currentFile = { meta: result, source: fs.sourceName };
        this.snackBar.open(
          `Save done in: <${this.currentFile.meta.fullPath}>`,
          undefined,
          {
            verticalPosition: "top",
            politeness: "assertive",
            duration: 1500,
          }
        );
      } else {
        this.snackBar.open("Unable to save: " + result.message, undefined, {
          verticalPosition: "top",
          politeness: "off",
          duration: 2000,
        });
      }
    } else {
      if (this.currentFile?.source === "local") {
        this.download(file);
      } else {
        this.workInProgress.next(false);
        return false;
      }
    }
    this.workInProgress.next(false);
    return true;
  }

  private async loadFromJson(jsonString: string): Promise<Error | null> {
    try {
      const obj = JSON.parse(jsonString) as IDbSpX;
      this.All = obj.problems.map((p) => Problem.fromJson(p));
      this.currentIndex = obj.lastIndex ?? 0;
      return null;
    } catch (err) {
      return err as Error;
    }
  }
  private async loadFromXML(xmlText: string) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      this.All = await Promise.all(
        Array.from(xmlDoc.querySelectorAll("SP_Item")).map((e) =>
          Problem.fromElement(e)
        )
      );
      this.currentIndex = parseInt(
        xmlDoc.documentElement.getAttribute("lastIndex") ?? "0",
        10
      );
      return null;
    } catch (ex) {
      console.error(ex);
      return ex as Error;
    }
  }

  private async loadFromContent(
    content: string,
    forceVersion?: "sp2" | "sp3"
  ): Promise<Error | null> {
    const version: "sp2" | "sp3" =
      forceVersion ??
      (this.currentFile?.meta.fullPath.substr(-4) === ".sp2" ? "sp2" : "sp3");
    switch (version) {
      case "sp2":
        await this.loadFromXML(content);
        break;
      case "sp3":
        await this.loadFromJson(content);
        break;
      default:
        return null;
    }
    this.count = this.All.length;
    await this.saveToLocalStorage();
    return null;
  }

  async GotoIndex(arg0: number) {
    if (arg0 >= this.count || arg0 < 0) {
      return;
    }
    this.currentIndex = arg0;
    await this.loadProblem();
    await this.saveToLocalStorage();
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
      const text =
        '<?xml version="1.0" encoding="utf-8"?>\r' +
        new XMLSerializer().serializeToString(xmlDoc.documentElement);
      const fullpath = this.currentFile?.meta.fullPath ?? "temp.sp2";
      return new File([text], fullpath, { type: "application/octect-stream" });
    } else {
      const text = JSON.stringify(this.toJSON());
      const fullpath = this.currentFile?.meta.fullPath ?? "temp.sp3";
      return new File([text], fullpath, { type: "application/octect-stream" });
    }
  }
}
