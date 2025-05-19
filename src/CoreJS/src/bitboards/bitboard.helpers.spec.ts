import { countBits } from "./bitboard.helpers";

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

// describe("getAllPiecesBitboard", () => {
//   it("should return the correct bitboard for the given position", () => {
//     const result = getAllPiecesBitboard(position);
//     expect(result).toBe(BigInt(["0b", "00000001", "00000010", "00000100", "00000000", "00000000", "00000000", "00000000", "00000000"].join("")));
//   });
// });
