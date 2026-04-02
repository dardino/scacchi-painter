import { BB_BLACK, BB_WHITE, getBBfromSquare } from "../../main";
import { BlackPawnNotation, PawnMoveGenerator, StartingBlackPawnBitboard, StartingWhitePawnBitboard, WhitePawnNotation } from "./pawn";

type Bitboard = bigint;

describe("PawnMoveGenerator", () => {
  const makeBbs = (whitePawns: Bitboard, blackPawns: Bitboard, whitePieces: Bitboard = 0n, blackPieces: Bitboard = 0n) =>
    new Map([
      [WhitePawnNotation, whitePawns],
      [BlackPawnNotation, blackPawns],
      [BB_WHITE, whitePieces],
      [BB_BLACK, blackPieces],
    ]);

  it("generates single and double moves for white pawns in starting position", () => {
    const bbs = makeBbs(StartingWhitePawnBitboard, 0n);
    const moves = PawnMoveGenerator(bbs, "w");
    // White pawns can move one or two squares forward from the starting position
    // 0x0000000000FF0000n: one step forward, 0x00000000FF000000n: two steps forward
    expect(moves & 0x00000000_00FF0000n).toBeTruthy();
    expect(moves & 0x00000000_FF000000n).toBeTruthy();
  });

  it("generates single and double moves for black pawns in starting position", () => {
    const bbs = makeBbs(0n, StartingBlackPawnBitboard);
    const moves = PawnMoveGenerator(bbs, "b");
    // Black pawns can move one or two squares forward from the starting position
    // 0x0000FF0000000000n: one step forward, 0x000000FF00000000n: two steps forward
    expect(moves & 0x000000FF_00000000n).toBeTruthy();
    expect(moves & 0x0000FF00_00000000n).toBeTruthy();
  });

  it("does not generate double move for pawns not in starting position", () => {
    // Move a white pawn to e4 (from e2)
    const e4 = getBBfromSquare("e4");
    const e5 = getBBfromSquare("e5");
    const e6 = getBBfromSquare("e6");
    const bbs = makeBbs(e4, 0n);
    const moves = PawnMoveGenerator(bbs, "w");
    // Only single move possible
    expect(moves & e5).toBeTruthy();
    expect(moves & e6).toBeFalsy();
  });

  it("generates capture moves for white pawns", () => {
    // White pawn on d4, black piece on c5 and e5
    const d4 = getBBfromSquare("d4");
    const c5 = getBBfromSquare("c5");
    const e5 = getBBfromSquare("e5");
    const bbs = makeBbs(d4, 0n, 0n, c5 | e5);
    const moves = PawnMoveGenerator(bbs, "w");
    // Should be able to capture both c5 and e5
    expect(moves & c5).toBeTruthy();
    expect(moves & e5).toBeTruthy();
  });

  it("generates capture moves for black pawns", () => {
    // Black pawn on d5, white piece on c4 and e4
    const d5 = getBBfromSquare("d5");
    const c4 = getBBfromSquare("c4");
    const e4 = getBBfromSquare("e4");
    const bbs = makeBbs(0n, d5, c4 | e4, 0n);
    const moves = PawnMoveGenerator(bbs, "b");
    // Should be able to capture both c4 and e4
    expect(moves & c4).toBeTruthy();
    expect(moves & e4).toBeTruthy();
  });

  it("handles en passant for white", () => {
    // Black pawn moves from e7 to e5, white pawn on d5
    const d5 = getBBfromSquare("d5");
    const bbs = makeBbs(d5, getBBfromSquare("e5"), 0n, getBBfromSquare("e5"));
    const moves = PawnMoveGenerator(bbs, "w", "p-e7-e5");
    // White pawn should be able to capture en passant on e6
    const enPassantSquare = getBBfromSquare("e6");
    expect(moves & enPassantSquare).toBeTruthy();
  });

  it("handles en passant for black", () => {
    // White pawn moves from d2 to d4, black pawn on e4
    const e4 = getBBfromSquare("e4");
    const bbs = makeBbs(getBBfromSquare("d4"), e4, getBBfromSquare("d4"), 0n);
    const moves = PawnMoveGenerator(bbs, "b", "P-d2-d4");
    // Black pawn should be able to capture en passant on d3
    const enPassantSquare = getBBfromSquare("d3");
    expect(moves & enPassantSquare).toBeTruthy();
  });

  it("returns 0n if no pawns of that color are present", () => {
    const bbs = makeBbs(0n, 0n);
    expect(PawnMoveGenerator(bbs, "w")).toBe(0n);
    expect(PawnMoveGenerator(bbs, "b")).toBe(0n);
  });
});
