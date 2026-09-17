import { TestBed } from "@angular/core/testing";

import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CurrentProblemService } from "./current-problem.service";
import { MockDbmanagerService, MockHostBridgeService } from "./db.mocks";
import { DbmanagerService, IDbManagerService } from "./dbmanager.service";
import { Piece } from "./models";
import { SquareLocations } from "./models/locations";
import { IPieceV4 } from "./SPX.v4";

const WhiteQueen: Partial<IPieceV4> = {
  color: "White",
  appearance: "q",
};
const WhiteKing: Partial<IPieceV4> = {
  color: "White",
  appearance: "k",
};
const BlackRook: Partial<IPieceV4> = {
  color: "Black",
  appearance: "r",
};

describe("CurrentProblemService", () => {
  let service: CurrentProblemService;
  const dbmanager: IDbManagerService = new MockDbmanagerService();

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
    dbmanager.SetCurrentProblem(null);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
  it("Add Piece At", async () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    let fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q7");
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteKing));
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/K7");
    expect(service.Problem()?.pieces.length).toEqual(1);
  });

  it("Add 2 pieces", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteKing));
    const fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1K6/Q7");
  });

  it("Remove Piece At", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    expect(service.Problem()?.pieces.length).toEqual(1);
    service.RemovePieceAt(SquareLocations.a1);
    const fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/8");
    expect(service.Problem()?.pieces.length).toEqual(0);
  });

  it("Move Piece", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    let fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q7");

    service.MovePiece(SquareLocations.a1, SquareLocations.a2);
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/Q7/8");
  });

  it("Move Piece [swap]", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteKing));
    let fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1K6/Q7");

    service.MovePiece(SquareLocations.a1, SquareLocations.b2, "swap");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1Q6/K7");
  });

  it("Move Piece [replace]", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteKing));
    let fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1K6/Q7");

    service.MovePiece(SquareLocations.a1, SquareLocations.b2, "replace");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1Q6/8");
    expect(service.Problem()?.pieces.length).toEqual(1);
  });

  it("RotatePiece", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));

    service.RotatePiece(SquareLocations.a1, "Clockwise45");
    let fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:17");

    service.RotatePiece(SquareLocations.a1, "Clockwise90");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:27");

    service.RotatePiece(SquareLocations.a1, "Clockwise135");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:37");

    service.RotatePiece(SquareLocations.a1, "UpsideDown");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:47");

    service.RotatePiece(SquareLocations.a1, "Counterclockwise135");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:57");

    service.RotatePiece(SquareLocations.a1, "Counterclockwise90");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:67");

    service.RotatePiece(SquareLocations.a1, "Counterclockwise45");
    fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/8/Q:77");
  });

  it("SetFairyAttribute", () => {
    service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
    service.AddPieceAt(SquareLocations.b2, Piece.fromJson(BlackRook));

    service.SetAsFairyPiece(SquareLocations.a1, [], "gn");
    service.SetAsFairyPiece(SquareLocations.b2, [], "le");
    const fen = service.Problem()?.getCurrentFen();
    expect(fen).toBe("8/8/8/8/8/8/1r6/Q7 [GNa1,LEb2]");
  });
  describe("RotateBoard [Right]", () => {
    it("a1 -> a8", () => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.RotateBoard("right");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("Q7/8/8/8/8/8/8/8");
    });
    it("a2 -> b8", () => {
      service.AddPieceAt(SquareLocations.a2, Piece.fromJson(WhiteQueen));
      service.RotateBoard("right");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("1Q6/8/8/8/8/8/8/8");
    });
    it("h5 -> e1", () => {
      service.AddPieceAt(SquareLocations.h5, Piece.fromJson(WhiteQueen));
      service.RotateBoard("right");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("8/8/8/8/8/8/8/4Q3");
    });
  });
  describe("RotateBoard [Left]", () => {
    it("a1 -> h1", () => {
      service.AddPieceAt(SquareLocations.a1, Piece.fromJson(WhiteQueen));
      service.RotateBoard("left");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("8/8/8/8/8/8/8/7Q");
    });
    it("b2 -> b7", () => {
      service.AddPieceAt(SquareLocations.b2, Piece.fromJson(WhiteQueen));
      service.RotateBoard("left");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("8/8/8/8/8/8/6Q1/8");
    });
    it("h5 -> d8", () => {
      service.AddPieceAt(SquareLocations.h5, Piece.fromJson(WhiteQueen));
      service.RotateBoard("left");
      const fen = service.Problem()?.getCurrentFen();
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
      expect(service.Problem()?.getCurrentFen()).toBe(
        "7Q/5Q2/8/8/4QQQ1/Q7/Q7/Q7",
      );
      service.FlipBoard("x");
      const fen = service.Problem()?.getCurrentFen();
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
      expect(service.Problem()?.getCurrentFen()).toBe(
        "7Q/5Q2/8/8/4QQQ1/Q7/Q7/Q7",
      );
      service.FlipBoard("y");
      const fen = service.Problem()?.getCurrentFen();
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
      let fen = service.Problem()?.getCurrentFen();
      expect(fen).not.toBe("8/8/8/8/8/8/8/8");
      service.ClearBoard();
      fen = service.Problem()?.getCurrentFen();
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
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("8/7Q/6Q1/5Q2/4Q3/3Q4/2Q5/1Q6");
    });
    it("-X", () => {
      service.ShiftBoard("-x");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("6Q1/5Q2/4Q3/3Q4/2Q5/1Q6/Q7/8");
    });
    it("Y", () => {
      service.ShiftBoard("y");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("8/7Q/6Q1/5Q2/4Q3/3Q4/2Q5/1Q6");
    });
    it("-Y", () => {
      service.ShiftBoard("-y");
      const fen = service.Problem()?.getCurrentFen();
      expect(fen).toBe("6Q1/5Q2/4Q3/3Q4/2Q5/1Q6/Q7/8");
    });
  });
});
