import { describe, expect, it } from "vitest";
import { BB_BLACK, BB_WHITE, getBBfromSquare, SquareNames } from "../../main";
import { BishopMoveGenerator } from "./bishop";

type Bitboard = bigint;

describe("BishopMoveGenerator", () => {
  const makeBbs = (whiteBishops: Bitboard, blackBishops: Bitboard, whitePieces: Bitboard = 0n, blackPieces: Bitboard = 0n) =>
    new Map([
      [BishopMoveGenerator.pieceW, whiteBishops],
      [BishopMoveGenerator.pieceB, blackBishops],
      [BB_WHITE, whitePieces],
      [BB_BLACK, blackPieces],
    ]);

  it("generates diagonal moves for center bishop (e4)", () => {
    const e4 = getBBfromSquare("e4");
    const bbs = makeBbs(e4, 0n);
    const moves = BishopMoveGenerator(bbs, "w");
    const expected = (
      ["f5", "g6", "h7", "d5", "c6", "b7", "a8", "f3", "g2", "h1", "d3", "c2", "b1"] as SquareNames[]
    ).map(getBBfromSquare).reduce((a, b) => a | b, 0n as Bitboard);
    expect(moves & expected).toBe(expected);
  });

  it("does not include own pieces and stops before them", () => {
    const e4 = getBBfromSquare("e4");
    const g6 = getBBfromSquare("g6");
    const h7 = getBBfromSquare("h7");
    const bbs = makeBbs(e4, 0n, g6, 0n);
    const moves = BishopMoveGenerator(bbs, "w");
    expect(moves & g6).toBeFalsy();
    expect(moves & h7).toBeFalsy();
  });

  it("can capture enemy pieces and does not go beyond them", () => {
    const e4 = getBBfromSquare("e4");
    const g6 = getBBfromSquare("g6");
    const h7 = getBBfromSquare("h7");
    const bbs = makeBbs(e4, 0n, 0n, g6);
    const moves = BishopMoveGenerator(bbs, "w");
    expect(moves & g6).toBeTruthy();
    expect(moves & h7).toBeFalsy();
  });

  it("handles corner squares correctly (a1)", () => {
    const a1 = getBBfromSquare("a1");
    const expected = SquareNames("b2", "c3", "d4", "e5", "f6", "g7", "h8")
      .map(getBBfromSquare).reduce((a, b) => a | b, 0n as Bitboard);
    const bbs = makeBbs(a1, 0n);
    const moves = BishopMoveGenerator(bbs, "w");
    expect(moves & expected).toBe(expected);
  });

  it("returns 0n if no bishops of that color are present", () => {
    const bbs = makeBbs(0n, 0n);
    expect(BishopMoveGenerator(bbs, "w")).toBe(0n);
    expect(BishopMoveGenerator(bbs, "b")).toBe(0n);
  });
});
