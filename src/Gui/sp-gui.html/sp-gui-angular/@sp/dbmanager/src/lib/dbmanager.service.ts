import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AvaliableFileServices, FileSelected, FileService, FolderItemInfo, FolderSelected, RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";
import { Subject } from "rxjs";
import { IProblem, prettifyXml } from "./helpers";
import { Problem } from "./models/problem";
import { DropboxdbService, LocalDriveService, OneDriveService } from "./providers";

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
  private currentIndex = 1;
  private currentFile: FolderSelected | null = null;
  private workInProgress: Subject<boolean> = new Subject<boolean>();

  //#region public Properties
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
  get Count() {
    return this.All.length;
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
  //#endregion

  async addBlankPosition() {
    this.All.push(Problem.fromJson({}));
    this.currentIndex = this.All.length;
    await this.loadProblem();
    await this.saveToLocalStorage();
    return this.currentIndex;
  }

  async deleteProblem(problem: Problem) {
    const pIndex = this.All.indexOf(problem);
    await this.deleteProblemAtPosition(pIndex);
  }
  async deleteProblemByIndex(dbIndex: number) {
    await this.deleteProblemAtPosition(dbIndex);
  }

  async deleteCurrentProblem() {
    await this.deleteProblemAtPosition(this.currentIndex);
  }

  private async deleteProblemAtPosition(pIndex: number) {
    this.workInProgress.next(true);
    if (pIndex < this.All.length && pIndex > -1) this.All.splice(pIndex - 1, 1);
    if (this.All.length === 0) {
      //if deleted problem is the lastone in database then create a blank problem
      await this.addBlankPosition();
    } else {
      // if problem index is the same as current then move current problem to the previous if present
      if (pIndex === this.currentIndex) {
        this.currentIndex = Math.max(0, pIndex - 1);
      }
    }
    await this.loadProblem();
    await this.saveToLocalStorage();
    this.workInProgress.next(false);
    this.snackBar.open("Problem deleted!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 2000,
    });
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
    saveToRecentFiles(meta, source);
    this.snackBar.open("Load db completed!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 2000,
    });
    return result;
  }
  public async LoadFromService({ meta, source }: RecentFileInfo): Promise<Error | null> {
    this.workInProgress.next(true);
    this.currentFile = { meta, source };
    const file = await this.fileService?.getFileContent(meta);
    if (!file) {
      this.workInProgress.next(false);
      return new Error("Unable to load file content from service!");
    }
    try {
      return this.Load({ file, meta, source });
    } catch (err) {
      return err as Error;
    }
  }

  async Reload(id?: number) {
    this.workInProgress.next(true);
    this.reset();
    this.currentFile = await this.loadFromLocalStorage();
    this.currentIndex = id ?? this.currentIndex;
    await this.loadProblem();
    this.workInProgress.next(false);
    this.snackBar.open("Reload db completed!", undefined, {
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

  private async ToXML(): Promise<Document> {
    const problems = await Promise.all(this.All.map((f) => f.toSP2Xml()));
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      "<ScacchiPainterDatabase></ScacchiPainterDatabase>",
      "application/xml"
    );
    const root = doc.querySelector("ScacchiPainterDatabase") as Element;
    root.setAttribute("version", "0.1.0.2");
    root.setAttribute("name", "Scacchi Painter 2 Database");
    root.setAttribute("lastIndex", this.CurrentIndex.toFixed(1));
    problems.forEach((p) => root.appendChild(p));
    return doc;
  }

  private async createFile(): Promise<File> {
    const type = this.currentFile?.meta.fullPath.slice(-4) === ".sp2" ? "sp2" : "sp3";
    const filesp2 = await this.getDbFile("sp2");
    const filesp3 = await this.getDbFile("sp3");
    return type === "sp2" ? filesp2 : filesp3;
  }

  private async download(file: File): Promise<void> {
    const fileSaver = await import("file-saver");
    fileSaver.saveAs(file, this.FileName);
  }
  public async SaveTemporary() {
    await this.saveToLocalStorage();
  }
  public async GetFileContent(): Promise<File> {
    // first of all save the current problem into local storage
    await this.saveToLocalStorage();
    const file = await this.createFile();
    return file;
  }
  public async Save() {
    const file = await this.GetFileContent();
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
      this.currentIndex = obj.lastIndex ?? 1;
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
        xmlDoc.documentElement.getAttribute("lastIndex") ?? "1",
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
      (this.currentFile?.meta.fullPath.slice(-4) === ".sp2" ? "sp2" : "sp3");
    switch (version) {
      case "sp2":
        await this.loadFromXML(content);
        break;
      case "sp3":
        await this.loadFromJson(content);
        break;
      default:
        break;
    }
    await this.saveToLocalStorage();
    return null;
  }

  async GotoIndex(arg0: number) {
    if (arg0 > this.All.length || arg0 < 0) {
      return;
    }
    this.reset();
    this.currentIndex = arg0;
    await this.loadProblem();
    await this.saveToLocalStorage();
  }

  private async loadProblem() {
    this.currentProblem = this.All[this.currentIndex - 1];
    if (this.currentProblem == null) {
      return this.reset();
    }
  }

  private reset() {
    this.currentIndex = 1;
    this.currentProblem = null;
  }

  private async getDbFile(type: "sp2" | "sp3" = "sp3"): Promise<File> {
    if (type === "sp2") {
      const xmlDoc = await this.ToXML();
      const text =
        '<?xml version="1.0" encoding="utf-8"?>\r\n' + prettifyXml(xmlDoc);
      const fullpath = this.currentFile?.meta.fullPath ?? "temp.sp2";
      return new File([text], fullpath, { type: "application/octect-stream" });
    } else {
      const text = JSON.stringify(this.toJSON());
      const fullpath = this.currentFile?.meta.fullPath ?? "temp.sp3";
      return new File([text], fullpath, { type: "application/octect-stream" });
    }
  }
}

/**
 * Saves the given file metadata and source to the recent files list.
 * @param meta - The metadata of the file.
 * @param source - The source of the file.
 */
function saveToRecentFiles(meta: FolderItemInfo, source: AvaliableFileServices) {
  const recents = JSON.parse(localStorage.getItem("spx.recents") ?? "[]") as RecentFileInfo[];
  // remove old matching file
  const oldIndex = recents.findIndex(rec => rec.source === source && rec.meta.fullPath === meta.fullPath);
  if (oldIndex > -1) recents.splice(oldIndex, 1);
  // remove all unknown in the recent because 'unknown' is for "in memory" database
  const unknown = recents.findIndex(rec => rec.source === "unknown");
  if (unknown > -1) recents.splice(unknown, 1);
  // add current file to first
  recents.unshift({ meta, source });
  // save to recent
  localStorage.setItem("spx.recents", JSON.stringify(recents.slice(0, 10)));
}
