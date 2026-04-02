/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBBfromSquare } from "../bitboards/bitboard.helpers";
import { Files, Ranks } from "../main";
import { Piece, PieceArray } from "../pieces/piece.types";
import { countBits, GetBitboardFromIndex, GetBitboardMapFromPieces, GetIndexFromLocation, GetLocationFromIndex } from "./bitboard.helpers";

describe("countBits", () => {
  it("should return 0 for 0", () => {
    const result = countBits(BigInt(0));
    expect(result).toBe(0);
  });

  it("should return 1 for 1", () => {
    const result = countBits(BigInt(1));
    expect(result).toBe(1);
  });

  it("should return 1 for 2", () => {
    const result = countBits(BigInt(2));
    expect(result).toBe(1);
  });

  it("should return 2 for 3", () => {
    const result = countBits(BigInt(3));
    expect(result).toBe(2);
  });

  it("should return 3 for 7", () => {
    const result = countBits(BigInt(7));
    expect(result).toBe(3);
  });

  it("should return 4 for 15", () => {
    const result = countBits(BigInt(15));
    expect(result).toBe(4);
  });

  it("should return 5 for 31", () => {
    const result = countBits(BigInt(31));
    expect(result).toBe(5);
  });

  it("should return 6 for 2729", () => {
    const result = countBits(BigInt(2729));
    expect(result).toBe(6);
  });
});

describe("GetLocationFromIndex", () => {
  it.each([
    // Row 1
    { index: 0, expected: { column: "ColA", traverse: "Row1" } },
    { index: 1, expected: { column: "ColB", traverse: "Row1" } },
    { index: 2, expected: { column: "ColC", traverse: "Row1" } },
    { index: 3, expected: { column: "ColD", traverse: "Row1" } },
    { index: 4, expected: { column: "ColE", traverse: "Row1" } },
    { index: 5, expected: { column: "ColF", traverse: "Row1" } },
    { index: 6, expected: { column: "ColG", traverse: "Row1" } },
    { index: 7, expected: { column: "ColH", traverse: "Row1" } },
    // Row 2
    { index: 8, expected: { column: "ColA", traverse: "Row2" } },
    { index: 9, expected: { column: "ColB", traverse: "Row2" } },
    { index: 10, expected: { column: "ColC", traverse: "Row2" } },
    { index: 11, expected: { column: "ColD", traverse: "Row2" } },
    { index: 12, expected: { column: "ColE", traverse: "Row2" } },
    { index: 13, expected: { column: "ColF", traverse: "Row2" } },
    { index: 14, expected: { column: "ColG", traverse: "Row2" } },
    { index: 15, expected: { column: "ColH", traverse: "Row2" } },
    // Row 8
    { index: 56, expected: { column: "ColA", traverse: "Row8" } },
    { index: 57, expected: { column: "ColB", traverse: "Row8" } },
    { index: 58, expected: { column: "ColC", traverse: "Row8" } },
    { index: 59, expected: { column: "ColD", traverse: "Row8" } },
    { index: 60, expected: { column: "ColE", traverse: "Row8" } },
    { index: 61, expected: { column: "ColF", traverse: "Row8" } },
    { index: 62, expected: { column: "ColG", traverse: "Row8" } },
    { index: 63, expected: { column: "ColH", traverse: "Row8" } },
  ])("should return $expected for index $index", ({ index, expected }) => {
    const result = GetLocationFromIndex(index);
    expect(result).toEqual(expected);
  });
});

describe("GetIndexFromLocation", () => {
  it.each([
    { column: "ColA", traverse: "Row1", expected: 0 } as const,
    { column: "ColB", traverse: "Row1", expected: 1 } as const,
    { column: "ColC", traverse: "Row1", expected: 2 } as const,
    { column: "ColD", traverse: "Row1", expected: 3 } as const,
    { column: "ColE", traverse: "Row1", expected: 4 } as const,
    { column: "ColF", traverse: "Row1", expected: 5 } as const,
    { column: "ColG", traverse: "Row1", expected: 6 } as const,
    { column: "ColH", traverse: "Row1", expected: 7 } as const,
    { column: "ColA", traverse: "Row2", expected: 8 } as const,
    { column: "ColB", traverse: "Row2", expected: 9 } as const,
    { column: "ColC", traverse: "Row2", expected: 10 } as const,
    { column: "ColD", traverse: "Row2", expected: 11 } as const,
    { column: "ColE", traverse: "Row2", expected: 12 } as const,
    { column: "ColF", traverse: "Row2", expected: 13 } as const,
    { column: "ColG", traverse: "Row2", expected: 14 } as const,
    { column: "ColH", traverse: "Row2", expected: 15 } as const,
    { column: "ColA", traverse: "Row8", expected: 56 } as const,
    { column: "ColB", traverse: "Row8", expected: 57 } as const,
    { column: "ColC", traverse: "Row8", expected: 58 } as const,
    { column: "ColD", traverse: "Row8", expected: 59 } as const,
    { column: "ColE", traverse: "Row8", expected: 60 } as const,
    { column: "ColF", traverse: "Row8", expected: 61 } as const,
    { column: "ColG", traverse: "Row8", expected: 62 } as const,
    { column: "ColH", traverse: "Row8", expected: 63 } as const,
  ])("should return $expected for column $column and traverse $traverse", ({ column, traverse, expected }) => {
    const result = GetIndexFromLocation(column, traverse);
    expect(result).toBe(expected);
  });

  // Test for invalid column
  it("should throw an error for invalid column", () => {
    expect(() => GetIndexFromLocation("ColX" as Files, "Row1" as Ranks)).toThrow("Invalid column or traverse: ColX, Row1");
  });
});

describe("GetBitboardMapFromPieces", () => {
  it("should return an empty map for an empty array", () => {
    const result = GetBitboardMapFromPieces([]);
    expect(result.size).toBe(0);
  });

  it("should map a single piece to the correct bitboard", () => {
    const pieces: PieceArray = [
      { notation: "P", position: "a1" } as Piece,
    ];
    const result = GetBitboardMapFromPieces(pieces);
    // a1 is index 56
    expect(result.get("P")).toBe(GetBitboardFromIndex(GetIndexFromLocation("ColA", "Row1")));
  });

  it("should combine bitboards for pieces with the same notation", () => {
    const pieces: PieceArray = [
      { notation: "P", position: "a1" } as Piece,
      { notation: "P", position: "b2" } as Piece,
    ];
    const result = GetBitboardMapFromPieces(pieces);
    // a1 is index 56, b2 is index 49
    const expected = GetBitboardFromIndex(GetIndexFromLocation("ColA", "Row1"))
      | GetBitboardFromIndex(GetIndexFromLocation("ColB", "Row2"));
    expect(result.get("P")).toBe(expected);
  });

  it("should map multiple notations correctly", () => {
    const pieces: PieceArray = [
      { notation: "P", position: "a1" } as Piece,
      { notation: "N", position: "h8" } as Piece,
    ];
    const result = GetBitboardMapFromPieces(pieces);
    expect(result.get("P")).toBe(GetBitboardFromIndex(0));
    expect(result.get("N")).toBe(GetBitboardFromIndex(63));
  });

  it("should throw for invalid piece positions", () => {
    const pieces: PieceArray = [
      { notation: "P", position: "z9" } as unknown as Piece,
    ];
    expect(() => GetBitboardMapFromPieces(pieces)).toThrow();
  });
});

describe("getBBfromSquare", () => {
  it("returns correct bitboard for a1 (least significant bit)", () => {
    const bb = getBBfromSquare("a1");
    expect(bb).toBe(1n);
  });

  it("returns correct bitboard for h1", () => {
    const bb = getBBfromSquare("h1");
    expect(bb).toBe(128n);
  });

  it("returns correct bitboard for a8 (most significant bit in file A)", () => {
    const bb = getBBfromSquare("a8");
    expect(bb).toBe(1n << 56n);
  });

  it("returns correct bitboard for h8 (most significant bit)", () => {
    const bb = getBBfromSquare("h8");
    expect(bb).toBe(1n << 63n);
  });

  it("returns correct bitboard for d4", () => {
    const bb = getBBfromSquare("d4");
    // d = 3 (zero-based), row 4 = (4-1)*8 = 24, so index = 24+3 = 27
    expect(bb).toBe(1n << 27n);
  });

  it("throws error for invalid column", () => {
    expect(() => getBBfromSquare("i1" as any)).toThrow("Invalid square name: i1");
  });

  it("throws error for invalid row", () => {
    expect(() => getBBfromSquare("a9" as any)).toThrow("Invalid square name: a9");
  });

  it("throws error for completely invalid square", () => {
    expect(() => getBBfromSquare("z0" as any)).toThrow("Invalid square name: z0");
  });
});
