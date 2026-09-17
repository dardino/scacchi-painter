/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Signal, signal } from "@angular/core";
import { FileSelected, FolderSelected, RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Observable, Subject } from "rxjs";
import { IDbManagerService } from "./dbmanager.service";
import { Piece, Problem } from "./models";

@Injectable({ providedIn: "root" })
export class MockDbmanagerService implements IDbManagerService {
  private all = signal<Problem[]>([]);
  All = this.all.asReadonly();
  SetData(problems: Problem[]): void {
    this.all.set(problems);
  }

  get wip$(): Signal<boolean> {
    return signal(false);
  }

  get FileName(): string | undefined {
    throw new Error("Method not implemented.");
  }

  get CurrentIndex(): number {
    throw new Error("Method not implemented.");
  }

  get Count(): number {
    throw new Error("Method not implemented.");
  }

  public CurrentProblem = signal<Problem | null>(null);

  get CurrentProblem$(): Observable<Problem | null> {
    return new Observable((subscriber) => {
      subscriber.next(this.CurrentProblem());
      return () => undefined;
    });
  }

  get Pieces(): Piece[] {
    throw new Error("Method not implemented.");
  }

  get CurrentFile(): Readonly<FolderSelected | null> {
    throw new Error("Method not implemented.");
  }

  addBlankPosition(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  deleteProblem(problem: Problem): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteProblemByIndex(dbIndex: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteCurrentProblem(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  Load({ file, meta, source }: FileSelected): Promise<Error | null> {
    throw new Error("Method not implemented.");
  }

  public LoadFromService({ meta, source }: RecentFileInfo): Promise<Error | null> {
    throw new Error("Method not implemented.");
  }

  Reload(id?: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  SetFileMeta(meta: Omit<FileSelected, "file">): void {
    throw new Error("Method not implemented.");
  }

  public SaveTemporary(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public GetFileContent(): Promise<File> {
    throw new Error("Method not implemented.");
  }

  public Save(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  GotoIndex(arg0: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  SetCurrentProblem(problem: Problem | null): Promise<void> {
    this.CurrentProblem.set(problem);
    return Promise.resolve();
  }

  constructor() {
    this.#load();
    // Initialization code if needed
  }

  async #load(): Promise<void> {
    const file2Load = join(__dirname, "..", "..", "..", "..", "..", "..", "docs", "db_schemas", "sp3-example-file.sp3");
    const buffer = await readFile(file2Load);
    const jsonText = buffer.toString("utf8");

    try {
      const parsed = JSON.parse(jsonText) as { problems?: Array<Record<string, unknown>> };
      const problems = (parsed.problems ?? []).map(problem => Problem.fromJson(problem as never));
      this.all.set(problems);
      this.CurrentProblem.set(problems[0] ?? null);
    }
    catch (error) {
      console.error("Unable to parse example SP3 database", error);
      this.all.set([]);
      this.CurrentProblem.set(null);
    }
  }
}

@Injectable({
  providedIn: "root",
})
export class MockHostBridgeService {
  #solver$ = new Subject<string>();
  get Solver$(): Observable<string> {
    return this.#solver$;
  }

  solveInProgress(): boolean {
    throw new Error("Method not implemented.");
  }

  stopSolve(): void {
    throw new Error("Method not implemented.");
  }

  startSolve(CurrentProblem: Problem): Error | undefined {
    throw new Error("Method not implemented.");
  }

  public saveFile(content: File): Promise<string | undefined> {
    throw new Error("Method not implemented.");
  }

  public get supportsClose(): boolean {
    throw new Error("Method not implemented.");
  }

  public closeApp(): void {
    throw new Error("Method not implemented.");
  }
}
