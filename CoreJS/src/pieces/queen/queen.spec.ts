import { describe, expect, it } from "vitest";
import { BB_BLACK, BB_WHITE, getBBfromSquare, SquareNames } from "../../main";
import { QueenMoveGenerator } from "./queen";

type Bitboard = bigint;

describe("QueenMoveGenerator", () => {
  const makeBbs = (whiteQueens: Bitboard, blackQueens: Bitboard, whitePieces: Bitboard = 0n, blackPieces: Bitboard = 0n) =>
    new Map([
      [QueenMoveGenerator.pieceW, whiteQueens],
      [QueenMoveGenerator.pieceB, blackQueens],
      [BB_WHITE, whitePieces],
      [BB_BLACK, blackPieces],
    ]);

  it("generates combined rook+bishop moves for center queen (d4)", () => {
    const d4 = getBBfromSquare("d4");
    const bbs = makeBbs(d4, 0n);
    const moves = QueenMoveGenerator(bbs, "w");
    const expected = SquareNames(
      // rook-like
      "d1",
      "d2",
      "d3",
      "d5",
      "d6",
      "d7",
      "d8",
      "a4",
      "b4",
      "c4",
      "e4",
      "f4",
      "g4",
      "h4",
      // bishop-like
      "e5",
      "f6",
      "g7",
      "h8",
      "c5",
      "b6",
      "a7",
      "e3",
      "f2",
      "g1",
      "c3",
      "b2",
      "a1",
    ).map(getBBfromSquare).reduce((a, b) => a | b, 0n);
    expect(moves & expected).toBe(expected);
  });

  it("does not include own pieces and stops before them", () => {
    const d4 = getBBfromSquare("d4");
    const d6 = getBBfromSquare("d6");
    const bbs = makeBbs(d4, 0n, d6, 0n);
    const moves = QueenMoveGenerator(bbs, "w");
    expect(moves & d6).toBeFalsy();
  });

  it("can capture enemy pieces and does not go beyond them", () => {
    const d4 = getBBfromSquare("d4");
    const d6 = getBBfromSquare("d6");
    const d7 = getBBfromSquare("d7");
    const bbs = makeBbs(d4, 0n, 0n, d6);
    const moves = QueenMoveGenerator(bbs, "w");
    expect(moves & d6).toBeTruthy();
    expect(moves & d7).toBeFalsy();
  });

  it("returns 0n if no queens of that color are present", () => {
    const bbs = makeBbs(0n, 0n);
    expect(QueenMoveGenerator(bbs, "w")).toBe(0n);
    expect(QueenMoveGenerator(bbs, "b")).toBe(0n);
  });
});
