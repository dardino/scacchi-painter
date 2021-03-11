import { Injectable } from "@angular/core";
import { IProblem } from "./helpers";
import { Problem } from "./models/Problem";
import { FileSelected, FileService } from "@sp/host-bridge/src/lib/fileService";
import { DropboxdbService } from "./dropboxdb.service";

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
  private currentFile: Omit<FileSelected, "file"> | null = null;

  public All: Problem[] = [];

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

  constructor(private dropboxFS: DropboxdbService) {}

  private get fileService(): FileService | null {
    switch (this.currentFile?.source) {
      case "dropbox":
        return this.dropboxFS;
      default:
        return null;
    }
  }

  //#region PUBLIC LOADS
  async Load({ file, meta, source }: FileSelected): Promise<Error | null> {
    this.reset();
    this.currentFile = { meta, source };
    const content = await file.text();
    return await this.loadFromContent(content);
  }
  async Reload(id: number) {
    this.reset();
    this.currentFile = await this.loadFromLocalStorage();
    this.currentIndex = id;
    this.loadProblem();
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

  public async Save() {
    const type =
      this.currentFile?.meta.fullPath.substr(-4) === ".sp2" ? "sp2" : "sp3";
    const file = await this.getDbFile(type);
    const fs = this.fileService;
    const cf = this.currentFile;
    if (fs && cf) {
      const result = await fs.saveFileContent(file, cf.meta);
      if (result instanceof Error) return;
      this.currentFile = { meta: result, source: fs.sourceName };
    }
  }
  private async loadFromJson(jsonString: string): Promise<Error | null> {
    try {
      const obj = JSON.parse(jsonString) as IDbSpX;
      this.All = obj.problems.map((p) => Problem.fromJson(p));
      this.currentIndex = obj.lastIndex ?? 0;
      return null;
    } catch (err) {
      return err;
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
      return new File([text], fullpath, { type: "application/xml" });
    } else {
      const text = JSON.stringify(this.toJSON());
      const fullpath = this.currentFile?.meta.fullPath ?? "temp.sp3";
      return new File([text], fullpath, { type: "application/json" });
    }
  }
}
