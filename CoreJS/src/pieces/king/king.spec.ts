import { describe, expect, it } from "vitest";
import { BB_BLACK, BB_WHITE, getBBfromSquare, SquareNames } from "../../main";
import { BlackKingNotation, KingMoveGenerator, WhiteKingNotation } from "./king";

type Bitboard = bigint;

describe("KingMoveGenerator", () => {
  const makeBbs = (whiteKings: Bitboard, blackKings: Bitboard, whitePieces: Bitboard = 0n, blackPieces: Bitboard = 0n) =>
    new Map([
      [WhiteKingNotation, whiteKings],
      [BlackKingNotation, blackKings],
      [BB_WHITE, whitePieces],
      [BB_BLACK, blackPieces],
    ]);

  it("generates all adjacent moves for center king (white)", () => {
    const e4 = getBBfromSquare("e4");
    const bbs = makeBbs(e4, 0n);
    const moves = KingMoveGenerator(bbs, "w");
    const expectedSquares = ([
      "d3", "d4", "d5", "e3", "e5", "f3", "f4", "f5"
    ] as SquareNames[]).map(getBBfromSquare).reduce((a, b) => a | b, 0n as Bitboard);
    expect(moves & expectedSquares).toBe(expectedSquares);
  });

  it("does not include own pieces", () => {
    const e4 = getBBfromSquare("e4");
    const e5 = getBBfromSquare("e5");
    const bbs = makeBbs(e4, 0n, e5, 0n);
    const moves = KingMoveGenerator(bbs, "w");
    expect(moves & e5).toBeFalsy();
  });

  it("can capture enemy pieces", () => {
    const e4 = getBBfromSquare("e4");
    const e5 = getBBfromSquare("e5");
    const bbs = makeBbs(e4, 0n, 0n, e5);
    const moves = KingMoveGenerator(bbs, "w");
    expect(moves & e5).toBeTruthy();
  });

  it("handles corner squares correctly (a1)", () => {
    const a1 = getBBfromSquare("a1");
    const b1 = getBBfromSquare("b1");
    const a2 = getBBfromSquare("a2");
    const b2 = getBBfromSquare("b2");
    const bbs = makeBbs(a1, 0n);
    const moves = KingMoveGenerator(bbs, "w");
    const expected = b1 | a2 | b2;
    expect(moves & expected).toBe(expected);
  });

  it("returns 0n if no kings of that color are present", () => {
    const bbs = makeBbs(0n, 0n);
    expect(KingMoveGenerator(bbs, "w")).toBe(0n);
    expect(KingMoveGenerator(bbs, "b")).toBe(0n);
  });
});
