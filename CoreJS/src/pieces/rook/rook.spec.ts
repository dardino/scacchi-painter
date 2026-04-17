import { describe, expect, it } from "vitest";
import { BB_BLACK, BB_WHITE, getBBfromSquare, SquareNames } from "../../main";
import { RookMoveGenerator } from "./rook";

type Bitboard = bigint;

describe("RookMoveGenerator", () => {
  const makeBbs = (whiteRooks: Bitboard, blackRooks: Bitboard, whitePieces: Bitboard = 0n, blackPieces: Bitboard = 0n) =>
    new Map([
      [RookMoveGenerator.pieceW, whiteRooks],
      [RookMoveGenerator.pieceB, blackRooks],
      [BB_WHITE, whitePieces],
      [BB_BLACK, blackPieces],
    ]);

  it("generates orthogonal moves for center rook (e4)", () => {
    const e4 = getBBfromSquare("e4");
    const bbs = makeBbs(e4, 0n);
    const moves = RookMoveGenerator(bbs, "w");
    const expected = ([
      "e1",
      "e2",
      "e3",
      "e5",
      "e6",
      "e7",
      "e8",
      "a4",
      "b4",
      "c4",
      "d4",
      "f4",
      "g4",
      "h4",
    ] as SquareNames[]).map(getBBfromSquare).reduce((a, b) => a | b, 0n);
    expect(moves & expected).toBe(expected);
  });

  it("does not include own pieces and stops before them", () => {
    const e4 = getBBfromSquare("e4");
    const e6 = getBBfromSquare("e6");
    const e7 = getBBfromSquare("e7");
    const bbs = makeBbs(e4, 0n, e6, 0n);
    const moves = RookMoveGenerator(bbs, "w");
    expect(moves & e6).toBeFalsy();
    // squares beyond e6 should not be available
    expect(moves & e7).toBeFalsy();
  });

  it("can capture enemy pieces and does not go beyond them", () => {
    const e4 = getBBfromSquare("e4");
    const e6 = getBBfromSquare("e6");
    const e7 = getBBfromSquare("e7");
    const bbs = makeBbs(e4, 0n, 0n, e6);
    const moves = RookMoveGenerator(bbs, "w");
    expect(moves & e6).toBeTruthy();
    expect(moves & e7).toBeFalsy();
  });

  it("handles corner squares (a1)", () => {
    const a1 = getBBfromSquare("a1");
    const expected = SquareNames("b1", "c1", "d1", "e1", "f1", "g1", "h1", "a2", "a3", "a4", "a5", "a6", "a7", "a8")
      .map(getBBfromSquare).reduce((a, b) => a | b, 0n as Bitboard);
    const bbs = makeBbs(a1, 0n);
    const moves = RookMoveGenerator(bbs, "w");
    expect(moves & expected).toBe(expected);
  });

  it("returns 0n if no rooks of that color are present", () => {
    const bbs = makeBbs(0n, 0n);
    expect(RookMoveGenerator(bbs, "w")).toBe(0n);
    expect(RookMoveGenerator(bbs, "b")).toBe(0n);
  });
});
