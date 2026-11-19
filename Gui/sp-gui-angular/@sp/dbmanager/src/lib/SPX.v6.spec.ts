import { describe, expect, it } from "vitest";
import { convertDbToV6, isV6 } from "./SPX.v6";

describe("SP3 format version 6", () => {
  it("preserves move explorer data", () => {
    const move = {
      color: "w" as const,
      num: 1,
      part: "l" as const,
      from: "e2" as const,
      to: "e4" as const,
      type: "-" as const,
      isPromotion: false,
      promotedPiece: "",
      isCheck: false,
      isCheckMate: false,
      isStaleMate: false,
      isTry: false,
      refutes: false,
      isKey: false,
      extraMoves: ["[bKg2->e8]"],
      piece: "P",
      threat: false,
      zugzwang: false,
      fromTwin: "b",
      isCastling: false,
      castlingLength: "" as const,
    };

    const converted = convertDbToV6({
      version: 6,
      lastIndex: 1,
      name: "Test",
      awards: [],
      problems: [{ jsonSolutions: [move] }],
    });

    expect(isV6(converted)).toBe(true);
    expect(converted.problems[0].jsonSolutions).toEqual([move]);
  });

  it("migrates v5 without move explorer data", () => {
    const converted = convertDbToV6({
      version: 5,
      lastIndex: 1,
      name: "Legacy",
      awards: [],
      problems: [{}],
    });

    expect(converted.version).toBe(6);
    expect(converted.problems[0].jsonSolutions).toEqual([]);
  });

  it("migrates v4 and initializes move explorer data", () => {
    const converted = convertDbToV6({
      version: 4,
      lastIndex: 1,
      name: "Legacy",
      problems: [{}],
    });

    expect(converted.version).toBe(6);
    expect(converted.problems[0].jsonSolutions).toEqual([]);
  });
});
