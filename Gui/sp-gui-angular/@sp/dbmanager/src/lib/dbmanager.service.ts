import { computed, inject, Injectable, Signal, signal } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LogService } from "@sp/gui/src/app/services/log.service";
import { AvaliableFileServices, FileSelected, FileService, FolderItemInfo, FolderSelected, RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";
import { prettifyXml } from "./helpers";
import { Problem } from "./models/problem";
import { DropboxdbService, GoogleDriveService, LocalDriveService, OneDriveService } from "./providers";
import { IDbSpX_V3, isV3 } from "./SPX.v3";
import { IDbSpX_V4, isV4 } from "./SPX.v4";
import { Awards, convertDbToV5, IDbSpX_V5, isV5 } from "./SPX.v5";

export interface IDbManagerService {
  CurrentProblem: Signal<Problem | null>;
  All: Signal<Problem[]>;
  Awards: Signal<Awards[]>;
  SetCurrentProblem(problem: Problem | null): Promise<void>;
  SetData(problems: Problem[]): void;
  SetAwards(awards: Awards[]): void;
  SaveTemporary(): Promise<void>;
}

@Injectable({
  providedIn: "root",
})
export class DbmanagerService implements IDbManagerService {
  SetData(problems: Problem[]): void {
    this.#database.set(problems);
  }

  SetAwards(awards: Awards[]): void {
    this.#awards.set(awards);
  }

  #dropboxFS = inject(DropboxdbService);
  #oneDriveFS = inject(OneDriveService);
  #googleDriveFS = inject(GoogleDriveService);
  #localDriveFS = inject(LocalDriveService);
  #snackBar = inject(MatSnackBar);
  #logger = inject(LogService);

  /** @description Current problem index is 1 based */
  #currentIndex = signal(1);
  #currentFile = signal<FolderSelected | null>(null);
  #workInProgress = signal(false);
  #database = signal<Problem[]>([]);
  #awards = signal<Awards[]>([]);

  // #region public Properties
  All = this.#database.asReadonly();
  Awards = this.#awards.asReadonly();
  wip = computed(() => this.#workInProgress());
  FileName = computed(() => this.#currentFile()?.meta.itemName);
  CurrentIndex = computed(() => this.#currentIndex());
  Count = computed(() => this.#database().length);

  #currentProblem = signal<Problem | null>(null);
  CurrentProblem: Signal<Problem | null> = this.#currentProblem.asReadonly();
  Pieces = computed(() => this.CurrentProblem()?.pieces ?? []);

  get CurrentFile() {
    return this.#currentFile;
  }
  // #endregion

  async addBlankPosition() {
    this.#database.set([...this.#database(), Problem.fromJson({})]);
    this.#currentIndex.set(this.#database().length);
    await this.loadProblem();
    await this.saveToLocalStorage();
    return this.#currentIndex;
  }

  async deleteProblem(problem: Problem) {
    const pIndex = this.#database().indexOf(problem);
    await this.deleteProblemAtIndex(pIndex);
  }

  async deleteProblemByIndex(index: number) {
    await this.deleteProblemAtIndex(index);
  }

  async deleteCurrentProblem() {
    await this.deleteProblemAtIndex(this.#currentIndex() - 1);
  }

  private async deleteProblemAtIndex(pIndex: number) {
    this.#workInProgress.set(true);
    const oldArray = this.#database();
    // delete only if index is valid
    if (pIndex >= oldArray.length || pIndex < 0) {
      this.#workInProgress.set(false);
      return;
    }

    // delete the problem at the specified index
    oldArray.splice(pIndex, 1);

    // if deleted problem is the last one in database then create a blank problem
    if (oldArray.length === 0) {
      oldArray.push(Problem.fromJson({}));
      this.#database.set(oldArray);
      this.#currentIndex.set(1);
    }
    else {
      this.#database.set(oldArray);
      // if problem index is the same as current then move current problem to the previous if present
      if (pIndex === this.#currentIndex() - 1) {
        this.#currentIndex.set(Math.max(0, pIndex - 1) + 1);
      }
    }
    // update the All signal with the modified array
    await this.loadProblem();
    await this.saveToLocalStorage();
    this.#workInProgress.set(false);
    this.#snackBar.open("Problem deleted!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 2000,
    });
  }

  private get fileService(): FileService<AvaliableFileServices> | null {
    switch (this.#currentFile()?.source) {
      case "dropbox":
        return this.#dropboxFS;
      case "onedrive":
        return this.#oneDriveFS;
      case "googledrive":
        return this.#googleDriveFS;
      case "local":
        return this.#localDriveFS;
      case "unknown":
      default:
        return null;
    }
  }

  // #region PUBLIC LOADS
  async Load({ file, meta, source }: FileSelected): Promise<Error | null> {
    this.#workInProgress.set(true);
    try {
      this.reset();
      this.#currentFile.set({ meta, source });
      const content = await file.text();
      const result = await this.loadFromContent(content);
      saveToRecentFiles(meta, source);
      this.#snackBar.open("Load db completed!", undefined, {
        verticalPosition: "top",
        politeness: "assertive",
        duration: 2000,
      });
      return result;
    }
    catch (err) {
      return err as Error;
    }
    finally {
      this.#workInProgress.set(false);
    }
  }

  public async LoadFromService({ meta, source }: RecentFileInfo): Promise<Error | null> {
    this.#workInProgress.set(true);
    try {
      this.#currentFile.set({ meta, source });
      if (source == "unknown") {
        return null;
      }
      const file = await this.fileService?.getFileContent(meta);
      if (!file) {
        return new Error("Unable to load file content from service!");
      }
      // Load gestisce completamente il loader
      return await this.Load({ file, meta, source });
    }
    catch (err) {
      return err as Error;
    }
    finally {
      this.#workInProgress.set(false);
    }
  }

  /**
   * Reload current position by id that is 1-based
   * @param id
   */
  async Reload(/** this parameter is 1 based */ id?: number) {
    this.#workInProgress.set(true);
    this.reset();
    const file = await this.loadFromLocalStorage();
    this.#currentFile.set(file);
    this.#currentIndex.set(id ?? this.#currentIndex());
    await this.loadProblem();
    this.#workInProgress.set(false);
    this.#snackBar.open("Reload db completed!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 2000,
    });
  }

  SetFileMeta(meta: Omit<FileSelected, "file">) {
    this.#currentFile.set({ ...meta });
  }
  // #endregion PUBLIC LOADS

  private async loadFromLocalStorage() {
    const spdb = localStorage.getItem("spdb") ?? null;
    const spdbInfo = localStorage.getItem("spdb_info") ?? null;
    if (spdb == null || spdbInfo == null) {
      return null;
    }
    await this.loadFromContent(spdb, "sp3");
    let parsed: Pick<FileSelected, "meta" | "source">;
    try {
      parsed = JSON.parse(spdbInfo) as Pick<FileSelected, "meta" | "source">;
    }
    catch {
      return null;
    }
    return parsed;
  }

  private async saveToLocalStorage() {
    this.#database.update((all) => {
      const currentProblem = this.CurrentProblem();
      const currentIndex = this.#currentIndex();
      if (currentProblem && currentIndex > 0 && currentIndex <= all.length) {
        all[currentIndex - 1] = currentProblem;
      }
      return all.slice();
    });
    const jsonObj = this.toJSON();
    const text = JSON.stringify(jsonObj);
    localStorage.setItem("spdb", text);
    if (!this.#currentFile()) return;
    localStorage.setItem("spdb_info", JSON.stringify(this.#currentFile()));
  }

  private toJSON(): IDbSpX_V5 {
    return {
      lastIndex: this.#currentIndex(),
      problems: this.#database().map(p => p.toJson()),
      awards: this.#awards(),
      name: "Scacchi Painter X Database",
      version: 5,
    };
  }

  private async ToXML(): Promise<Document> {
    const problems = await Promise.all(this.#database().map(f => f.toSP2Xml()));
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      "<ScacchiPainterDatabase></ScacchiPainterDatabase>",
      "application/xml",
    );
    const root = doc.querySelector("ScacchiPainterDatabase") as Element;
    root.setAttribute("version", "0.1.0.2");
    root.setAttribute("name", "Scacchi Painter 2 Database");
    root.setAttribute("lastIndex", this.#currentIndex().toFixed(0));
    problems.forEach(p => root.appendChild(p));
    return doc;
  }

  private async createFile(): Promise<File> {
    const type = this.#currentFile()?.meta.fullPath.slice(-4) === ".sp2" ? "sp2" : "sp3";
    if (type === "sp2") {
      const filesp2 = await this.getDbFile("sp2");
      return filesp2;
    }
    else {
      const filesp3 = await this.getDbFile("sp3");
      return filesp3;
    }
  }

  private async download(file: File): Promise<void> {
    const fileSaver = await import("file-saver");
    fileSaver.saveAs(file, this.FileName());
  }

  public async SetCurrentProblem(problem: Problem | null) {
    this.#currentProblem.set(problem?.clone() ?? null);
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
    await this.saveToLocalStorage();
    const file = await this.GetFileContent();
    const fs = this.fileService;
    const cf = this.#currentFile();
    if (fs && cf) {
      const result = await fs.saveFileContent(file, cf.meta);
      if (!(result instanceof Error)) {
        this.#currentFile.set({ meta: result, source: fs.sourceName });
        this.#snackBar.open(
          `Save done in: <${cf.meta.fullPath}>`,
          undefined,
          {
            verticalPosition: "top",
            politeness: "assertive",
            duration: 1500,
          },
        );
      }
      else {
        this.#logger.error("Unable to save file" + JSON.stringify(result));
        this.#snackBar.open("Unable to save: " + result.message, undefined, {
          verticalPosition: "top",
          politeness: "off",
          duration: 2000,
        });
      }
    }
    else {
      if (this.#currentFile()?.source === "local") {
        this.download(file);
      }
      else {
        this.#workInProgress.set(false);
        return false;
      }
    }
    this.#workInProgress.set(false);
    return true;
  }

  private async loadFromJson(jsonString: string): Promise<Error | null> {
    try {
      const raw = JSON.parse(jsonString) as IDbSpX_V5 | IDbSpX_V4 | IDbSpX_V3;
      if (!isV3(raw) && !isV4(raw) && !isV5(raw)) {
        throw new Error("Unsupported file version!");
      }

      const obj = convertDbToV5(raw);

      this.#database.set(obj.problems.map(p => Problem.fromJson(p)));
      this.#awards.set(obj.awards ?? []);
      this.#currentIndex.set(obj.lastIndex ?? 1);
      return null;
    }
    catch (err) {
      return err as Error;
    }
  }

  private async loadFromXML(xmlText: string) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      this.#database.set(await Promise.all(
        Array.from(xmlDoc.querySelectorAll("SP_Item")).map(e =>
          Problem.fromElement(e),
        ),
      ));
      this.#currentIndex.set(parseInt(
        xmlDoc.documentElement.getAttribute("lastIndex") ?? "1",
        10,
      ));
      return null;
    }
    catch (ex) {
      console.error(ex);
      return ex as Error;
    }
  }

  private async loadFromContent(
    content: string,
    forceVersion?: "sp2" | "sp3",
  ): Promise<Error | null> {
    const version: "sp2" | "sp3"
      = forceVersion
        ?? (this.#currentFile()?.meta.fullPath.slice(-4) === ".sp2" ? "sp2" : "sp3");
    switch (version) {
      case "sp2":
        await this.loadFromXML(content);
        break;
      case "sp3":
      default:
        await this.loadFromJson(content);
        break;
    }
    await this.saveToLocalStorage();
    return null;
  }

  /**
   * Sposta al problema con indice arg0 (1-based)
   * @param arg0
   * @returns
   */
  async GotoIndex(arg0: number) {
    if (arg0 > this.#database().length || arg0 <= 0) {
      return;
    }
    this.reset();
    this.#currentIndex.set(arg0);
    await this.loadProblem();
    await this.saveToLocalStorage();
  }

  private async loadProblem() {
    const realIndex = this.#currentIndex() - 1;
    if (realIndex < 0 || realIndex >= this.#database().length) {
      return this.reset();
    }
    const newP = this.#database()[realIndex];
    this.SetCurrentProblem(newP);
  }

  private reset() {
    this.#currentIndex.set(1);
    this.SetCurrentProblem(null);
  }

  private async getDbFile(type: "sp2" | "sp3" = "sp3"): Promise<File> {
    if (type === "sp2") {
      const xmlDoc = await this.ToXML();
      const text
        = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n" + prettifyXml(xmlDoc);
      const fullpath = this.#currentFile()?.meta.fullPath ?? "temp.sp2";
      return new File([text], fullpath, { type: "application/octect-stream" });
    }
    else {
      const text = JSON.stringify(this.toJSON());
      const fullpath = this.#currentFile()?.meta.fullPath ?? "temp.sp3";
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
  const recents = getRecentFiles();
  // remove old matching file
  const oldIndex = recents.findIndex(rec => rec.source === source && rec.meta.fullPath === meta.fullPath);
  if (oldIndex > -1) recents.splice(oldIndex, 1);
  // remove all unknown in the recent because 'unknown' is for "in memory" database
  const unknown = recents.findIndex(rec => rec.source === "unknown");
  if (unknown > -1) recents.splice(unknown, 1);
  // add current file to first
  recents.unshift({ meta, source });
  // save to recent
  saveRecentFiles(recents);
}

export function saveRecentFiles(recents: RecentFileInfo[]) {
  localStorage.setItem("spx:recents", JSON.stringify(recents.slice(0, 10)));
}
export function getRecentFiles(): RecentFileInfo[] {
  return JSON.parse(localStorage.getItem("spx:recents") ?? localStorage.getItem("spx.recents") ?? "[]") as RecentFileInfo[];
}
