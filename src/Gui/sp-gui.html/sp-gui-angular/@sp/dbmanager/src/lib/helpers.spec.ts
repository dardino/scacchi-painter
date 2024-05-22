import { GetLocationFromIndex, GetSquareColor, countBits, getAllPiecesBitboard } from "./helpers";
import { Problem } from "./models/problem";

describe("Helpers", () => {
  it("GetLocationFromIndex", () => {
    const a8 = GetLocationFromIndex(0);
    expect(a8.column).toBe("ColA");
    expect(a8.traverse).toBe("Row8");

    const a1 = GetLocationFromIndex(56);
    expect(a1.column).toBe("ColA");
    expect(a1.traverse).toBe("Row1");

    const h1 = GetLocationFromIndex(63);
    expect(h1.column).toBe("ColH");
    expect(h1.traverse).toBe("Row1");

    const h8 = GetLocationFromIndex(7);
    expect(h8.column).toBe("ColH");
    expect(h8.traverse).toBe("Row8");
  });

  it("GetSquareColor", () => {
    const color0 = GetSquareColor({ column: "ColA", traverse: "Row1" });
    expect(color0).toBe("black");
    const color1 = GetSquareColor({ column: "ColH", traverse: "Row1" });
    expect(color1).toBe("white");
    const color2 = GetSquareColor({ column: "ColH", traverse: "Row2" });
    expect(color2).toBe("black");
    const color3 = GetSquareColor({ column: "ColH", traverse: "Row3" });
    expect(color3).toBe("white");
    const color4 = GetSquareColor({ column: "ColH", traverse: "Row4" });
    expect(color4).toBe("black");
  });

  it("GetSquareColor", () => {
    const color0 = GetSquareColor("ColA", "Row1");
    expect(color0).toBe("black");
    const color1 = GetSquareColor("ColH", "Row1");
    expect(color1).toBe("white");
    const color2 = GetSquareColor("ColH", "Row2");
    expect(color2).toBe("black");
    const color3 = GetSquareColor("ColH", "Row3");
    expect(color3).toBe("white");
    const color4 = GetSquareColor("ColH", "Row4");
    expect(color4).toBe("black");
  });


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
  describe("getAllPiecesBitboard", () => {
    it("should return the correct bitboard for the given position", () => {
      const position: Problem = Problem.fromJson({
        pieces: [
          { column: "ColA", traverse: "Row1", appearance: "b" },
          { column: "ColB", traverse: "Row2", appearance: "b" },
          { column: "ColC", traverse: "Row3", appearance: "b" },
        ]
      });

      const result = getAllPiecesBitboard(position);
      expect(result).toBe(BigInt(["0b", "00000001", "00000010", "00000100", "00000000", "00000000", "00000000", "00000000", "00000000"].join("")));
    });
  });
});
