import { describe, expect, it } from "vitest";
import { BB_BLACK, BB_WHITE, getBBfromSquare } from "../../main";
import { BlackKnightNotation, KnightMoveGenerator, WhiteKnightNotation } from "./knight";

type Bitboard = bigint;

describe("KnightMoveGenerator", () => {
  const makeBbs = (whiteKnights: Bitboard, blackKnights: Bitboard, whitePieces: Bitboard = 0n, blackPieces: Bitboard = 0n) =>
    new Map([
      [WhiteKnightNotation, whiteKnights],
      [BlackKnightNotation, blackKnights],
      [BB_WHITE, whitePieces],
      [BB_BLACK, blackPieces],
    ]);

  it("generates correct moves for knight in center (e4)", () => {
    const e4 = getBBfromSquare("e4");
    const bbs = makeBbs(e4, 0n);
    const moves = KnightMoveGenerator(bbs, "w");
    const expectedSquares = ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"].map(getBBfromSquare).reduce((a, b) => a | b, 0n as Bitboard);
    expect(moves & expectedSquares).toBe(expectedSquares);
  });

  it("does not include own pieces", () => {
    const e4 = getBBfromSquare("e4");
    const f6 = getBBfromSquare("f6");
    const bbs = makeBbs(e4, 0n, f6, 0n);
    const moves = KnightMoveGenerator(bbs, "w");
    expect(moves & f6).toBeFalsy();
  });

  it("can capture enemy pieces", () => {
    const e4 = getBBfromSquare("e4");
    const f6 = getBBfromSquare("f6");
    const bbs = makeBbs(e4, 0n, 0n, f6);
    const moves = KnightMoveGenerator(bbs, "w");
    expect(moves & f6).toBeTruthy();
  });

  it("handles corner squares correctly (a1)", () => {
    const a1 = getBBfromSquare("a1");
    const b3 = getBBfromSquare("b3");
    const c2 = getBBfromSquare("c2");
    const bbs = makeBbs(a1, 0n);
    const moves = KnightMoveGenerator(bbs, "w");
    const expected = b3 | c2;
    expect(moves & expected).toBe(expected);
  });

  it("returns 0n if no knights of that color are present", () => {
    const bbs = makeBbs(0n, 0n);
    expect(KnightMoveGenerator(bbs, "w")).toBe(0n);
    expect(KnightMoveGenerator(bbs, "b")).toBe(0n);
  });
});
