import { describe, expect, it } from "vitest";
import { getCanvasLocation, getFFenFromPosition, GetLocationFromIndex } from "./helpers";
import { Problem } from "./models";
import { Columns, Traverse } from "./SPX.v4";

describe("Helpers", () => {
  it("GetLocationFromIndex", () => {
    const a8 = GetLocationFromIndex({ columns: 8, rows: 8 }, 0);
    expect(a8.column).toBe("ColA");
    expect(a8.traverse).toBe("Row8");

    const a1 = GetLocationFromIndex({ columns: 8, rows: 8 }, 56);
    expect(a1.column).toBe("ColA");
    expect(a1.traverse).toBe("Row1");

    const h1 = GetLocationFromIndex({ columns: 8, rows: 8 }, 63);
    expect(h1.column).toBe("ColH");
    expect(h1.traverse).toBe("Row1");

    const h8 = GetLocationFromIndex({ columns: 8, rows: 8 }, 7);
    expect(h8.column).toBe("ColH");
    expect(h8.traverse).toBe("Row8");
  });

  describe("Fen conversion", () => {
    it("should convert position to FEN correctly", () => {
      const position = Problem.fromJson({
        pieces: [
          { appearance: "q", color: "White", column: "ColA", traverse: "Row1" },
          { appearance: "k", color: "Black", column: "ColD", traverse: "Row5" },
        ],
      });
      const fen = getFFenFromPosition(position);
      expect(fen).toBe("8/8/8/3k4/8/8/8/Q7 w - - 0 1");
      // Add test logic here
    });
  });

  describe("getCanvasLocation", () => {
    it.each([
      { column: "ColA" as Columns, traverse: "Row1" as Traverse, expected: "a1" },
      { column: "ColH" as Columns, traverse: "Row8" as Traverse, expected: "h8" },
      { column: "ColA" as Columns, traverse: "Row8" as Traverse, expected: "a8" },
      { column: "ColH" as Columns, traverse: "Row1" as Traverse, expected: "h1" },
      { column: "ColD" as Columns, traverse: "Row4" as Traverse, expected: "d4" },
      { column: "ColK" as Columns, traverse: "Row11" as Traverse, expected: "k11" },
    ])("should return the correct canvas location for %#", ({ column, traverse, expected }) => {
      const location = getCanvasLocation(column, traverse);
      expect(location).toEqual(expected);
      // Add test logic here
    });
  });
});
