import { describe, expect, it } from "vitest";
import { parseHalfMove } from "./moveParser";

describe("parseHalfMove", () => {
  it("separates fairy effects from the primary move", () => {
    const move = parseHalfMove(2, "w", "r", "Kh2*g2[bKg2->e8]Se4-f6");

    expect(move?.from).toBe("h2");
    expect(move?.to).toBe("g2");
    expect(move?.extraMoves).toEqual(["[bKg2->e8]"]);
  });

  it("separates multiple bracketed extra moves", () => {
    const move = parseHalfMove(2, "w", "l", "Ke1-g1[Rh1-f1][bKg2->e8]");

    expect(move?.extraMoves).toEqual(["[Rh1-f1]", "[bKg2->e8]"]);
  });
});
