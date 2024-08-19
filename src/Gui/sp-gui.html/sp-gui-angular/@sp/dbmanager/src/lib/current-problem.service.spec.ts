/* eslint-disable @typescript-eslint/no-unused-vars */
import { TestBed } from "@angular/core/testing";

import { Injectable } from "@angular/core";
import { FileSelected, FolderSelected, RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CurrentProblemService } from "./current-problem.service";
import { DbmanagerService } from "./dbmanager.service";
import { IPiece } from "./helpers";
import { Piece, Problem } from "./models";
import { SquareLocations } from "./models/locations";

@Injectable({
  providedIn: "root",
})
class MockHostBridgeService {
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

@Injectable({ providedIn: "root" })
class MockDbmanagerService {
  public All: Problem[];
  get wip$(): Observable<boolean> {
    throw new Error("Method not implemented.");
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

  private currentProblem$ = new BehaviorSubject(Problem.fromJson({}));
  get CurrentProblem() {
    return this.currentProblem$.getValue();
  }
  set CurrentProblem(val: Problem) {
    this.currentProblem$.next(val);
  }

  get CurrentProblem$(): Observable<Problem | null> {
    return this.currentProblem$.asObservable();
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

}

const WhiteQueen: Partial<IPiece> = {
  color: "White",
  appearance: "q",
};
const WhiteKing: Partial<IPiece> = {
  color: "White",
  appearance: "k",
};
const BlackRook: Partial<IPiece> = {
  color: "Black",
  appearance: "r",
};


describe("CurrentProblemService", () => {
  let service: CurrentProblemService;
  const dbmanager: MockDbmanagerService = new MockDbmanagerService();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DbmanagerService, useValue: dbmanager },
        { provide: HostBridgeService, useClass: MockHostBridgeService },
      ],
    });
    service = TestBed.inject(CurrentProblemService);
  });

  afterEach(() => {
    dbmanager.CurrentProblem = Problem.fromJson({});
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
  it("Add Piece At", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    let fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q7");
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteKing));
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/K7");
    expect(dbmanager.CurrentProblem?.pieces.length).toEqual(1);
  });

  it("Add 2 pieces", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteKing));
    const fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1K6/Q7");
  });

  it("Remove Piece At", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    expect(dbmanager.CurrentProblem?.pieces.length).toEqual(1);
    service.RemovePieceAt(SquareLocations.a1);
    const fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/8");
    expect(dbmanager.CurrentProblem?.pieces.length).toEqual(0);
  });

  it("Move Piece", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    let fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q7");

    service.MovePiece(SquareLocations.a1, SquareLocations.a2);
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/Q7/8");
  });

  it("Move Piece [swap]", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteKing));
    let fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1K6/Q7");

    service.MovePiece(SquareLocations.a1, SquareLocations.b2, "swap");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1Q6/K7");
  });

  it("Move Piece [replace]", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteKing));
    let fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1K6/Q7");

    service.MovePiece(SquareLocations.a1, SquareLocations.b2, "replace");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1Q6/8");
    expect(dbmanager.CurrentProblem?.pieces.length).toEqual(1);
  });

  it("RotatePiece", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));

    service.RotatePiece(SquareLocations.a1, "Clockwise45");
    let fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:17");

    service.RotatePiece(SquareLocations.a1, "Clockwise90");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:27");

    service.RotatePiece(SquareLocations.a1, "Clockwise135");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:37");

    service.RotatePiece(SquareLocations.a1, "UpsideDown");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:47");

    service.RotatePiece(SquareLocations.a1, "Counterclockwise135");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:57");

    service.RotatePiece(SquareLocations.a1, "Counterclockwise90");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:67");

    service.RotatePiece(SquareLocations.a1, "Counterclockwise45");
    fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:77");
  });

  it("SetFairyAttribute", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(BlackRook));

    service.SetAsFairyPiece(SquareLocations.a1, "gn");
    service.SetAsFairyPiece(SquareLocations.b2, "le");
    const fen = dbmanager.CurrentProblem?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1r6/Q7 [GNa1,LEb2]");
  });
  describe("RotateBoard [Right]", () => {
    it("a1 -> a8", () => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.RotateBoard("right");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("Q7/8/8/8/8/8/8/8");
    });
    it("a2 -> b8", () => {
      service.AddPieceAt(SquareLocations.a2, Piece.fromJson(WhiteQueen));
      service.RotateBoard("right");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("1Q6/8/8/8/8/8/8/8");
    });
    it("h5 -> e1", () => {
      service.AddPieceAt(SquareLocations.h5, Piece.fromJson(WhiteQueen));
      service.RotateBoard("right");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("8/8/8/8/8/8/8/4Q3");
    });
  });
  describe("RotateBoard [Left]", () => {
    it("a1 -> h1", () => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.RotateBoard("left");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("8/8/8/8/8/8/8/7Q");
    });
    it("b2 -> b7", () => {
      service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteQueen));
      service.RotateBoard("left");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("8/8/8/8/8/8/6Q1/8");
    });
    it("h5 -> d8", () => {
      service.AddPieceAt(SquareLocations.h5, Piece.fromJson(WhiteQueen));
      service.RotateBoard("left");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("3Q4/8/8/8/8/8/8/8");
    });
  });

  describe("FlipBoard", () => {
    it("X", () => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.a2, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.a3, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.e4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.f4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.g4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.f7, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.h8, Piece.fromJson(WhiteQueen));
      expect(dbmanager.CurrentProblem?.getCurrentFen()).toBe(
        "7Q/5Q2/8/8/4QQQ1/Q7/Q7/Q7"
      );
      service.FlipBoard("x");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("Q7/Q7/Q7/4QQQ1/8/8/5Q2/7Q");
    });
    it("Y", () => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.a2, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.a3, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.e4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.f4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.g4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.f7, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.h8, Piece.fromJson(WhiteQueen));
      expect(dbmanager.CurrentProblem?.getCurrentFen()).toBe(
        "7Q/5Q2/8/8/4QQQ1/Q7/Q7/Q7"
      );
      service.FlipBoard("y");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("Q7/2Q5/8/8/1QQQ4/7Q/7Q/7Q");
    });
  });
  describe("Clear Board", () => {
    beforeEach(() => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.c3, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.d4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.e5, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.f6, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.g7, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.h8, Piece.fromJson(WhiteQueen));
    });

    it("clear", () => {
      let fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).not.toBe("8/8/8/8/8/8/8/8");
      service.ClearBoard();
      fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("8/8/8/8/8/8/8/8");
    });

  });
  describe("Shift", () => {
    beforeEach(() => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.c3, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.d4, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.e5, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.f6, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.g7, Piece.fromJson(WhiteQueen));
      service.AddPieceAt(SquareLocations.h8, Piece.fromJson(WhiteQueen));
    });

    it("X", () => {
      service.ShiftBoard("x");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("8/7Q/6Q1/5Q2/4Q3/3Q4/2Q5/1Q6");
    });
    it("-X", () => {
      service.ShiftBoard("-x");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("6Q1/5Q2/4Q3/3Q4/2Q5/1Q6/Q7/8");
    });
    it("Y", () => {
      service.ShiftBoard("y");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("8/7Q/6Q1/5Q2/4Q3/3Q4/2Q5/1Q6");
    });
    it("-Y", () => {
      service.ShiftBoard("-y");
      const fen = dbmanager.CurrentProblem?.getCurrentFen();
      expect(fen).toBe("6Q1/5Q2/4Q3/3Q4/2Q5/1Q6/Q7/8");
    });
  });

});
