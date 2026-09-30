import { describe, expect, it } from "vitest";
import { Piece, Problem } from "../models";
import { SquareLocations } from "../models/locations";
import { FlipAxis, ProblemHelpers } from "./problem.helpers";

describe("Problem Helpers", () => {
  describe("Add Piece", () => {
    it("AddPiece a1 white queen to empty board", () => {
      const problem = Problem.fromJson({});
      expect(problem.pieces).toHaveLength(0);
      expect(problem.getCurrentFen()).toBe("8/8/8/8/8/8/8/8 w - - 0 1");
      ProblemHelpers.addPieceAt(problem, SquareLocations.a1, Piece.fromJson({ appearance: "q", color: "White" }));
      expect(problem.pieces).toHaveLength(1);
      expect(problem.getCurrentFen()).toBe("8/8/8/8/8/8/8/Q7 w - - 0 1");
    });
    it("AddPiece all white pieces to empty board to obtain initial position", () => {
      const problem = Problem.fromJson({});
      expect(problem.pieces).toHaveLength(0);
      expect(problem.getCurrentFen()).toBe("8/8/8/8/8/8/8/8 w - - 0 1");
      ProblemHelpers.addPieceAt(problem, SquareLocations.a1, Piece.fromJson({ appearance: "r", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.b1, Piece.fromJson({ appearance: "n", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.c1, Piece.fromJson({ appearance: "b", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.d1, Piece.fromJson({ appearance: "q", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.e1, Piece.fromJson({ appearance: "k", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.f1, Piece.fromJson({ appearance: "b", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.g1, Piece.fromJson({ appearance: "n", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.h1, Piece.fromJson({ appearance: "r", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.a2, Piece.fromJson({ appearance: "p", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.b2, Piece.fromJson({ appearance: "p", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.c2, Piece.fromJson({ appearance: "p", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.d2, Piece.fromJson({ appearance: "p", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.e2, Piece.fromJson({ appearance: "p", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.f2, Piece.fromJson({ appearance: "p", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.g2, Piece.fromJson({ appearance: "p", color: "White" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.h2, Piece.fromJson({ appearance: "p", color: "White" }));
      expect(problem.pieces).toHaveLength(16);
      expect(problem.getCurrentFen()).toBe("8/8/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1");
    });
    it("AddPiece all black pieces to empty board to obtain initial position", () => {
      const problem = Problem.fromJson({});
      expect(problem.pieces).toHaveLength(0);
      expect(problem.getCurrentFen()).toBe("8/8/8/8/8/8/8/8 w - - 0 1");
      ProblemHelpers.addPieceAt(problem, SquareLocations.a8, Piece.fromJson({ appearance: "r", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.b8, Piece.fromJson({ appearance: "n", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.c8, Piece.fromJson({ appearance: "b", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.d8, Piece.fromJson({ appearance: "q", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.e8, Piece.fromJson({ appearance: "k", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.f8, Piece.fromJson({ appearance: "b", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.g8, Piece.fromJson({ appearance: "n", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.h8, Piece.fromJson({ appearance: "r", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.a7, Piece.fromJson({ appearance: "p", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.b7, Piece.fromJson({ appearance: "p", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.c7, Piece.fromJson({ appearance: "p", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.d7, Piece.fromJson({ appearance: "p", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.e7, Piece.fromJson({ appearance: "p", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.f7, Piece.fromJson({ appearance: "p", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.g7, Piece.fromJson({ appearance: "p", color: "Black" }));
      ProblemHelpers.addPieceAt(problem, SquareLocations.h7, Piece.fromJson({ appearance: "p", color: "Black" }));
      expect(problem.pieces).toHaveLength(16);
      expect(problem.getCurrentFen()).toBe("rnbqkbnr/pppppppp/8/8/8/8/8/8 w - - 0 1");
    });
  });

  describe("FlipAxis", () => {
    it.each([
      { axis: "x" as FlipAxis, expectedFen: "4K2R/4P3/2B1p3/6P1/8/8/8/r3k2r w - - 0 1" },
      { axis: "y" as FlipAxis, expectedFen: "r2k3r/8/8/8/1P6/3p1B2/3P4/R2K4 w - - 0 1" },
      { axis: "\\" as FlipAxis, expectedFen: "r7/8/5B2/8/k4pPK/8/4P3/r6R w - - 0 1" },
      { axis: "/" as FlipAxis, expectedFen: "R6r/3P4/8/KPp4k/8/2B5/8/7r w - - 0 1" },
    ])("should flip the board along the specified axis %s", ({ axis, expectedFen }) => {
      // initial fen: r3k2r/8/8/8/6P1/2B1p3/4P3/4K2R
      const problem = Problem.fromFen("r3k2r/8/8/8/6P1/2B1p3/4P3/4K2R w - - 0 1");
      ProblemHelpers.flipBoard(problem, axis);
      expect(problem.getCurrentFen()).toBe(expectedFen);
    });
  });
});
