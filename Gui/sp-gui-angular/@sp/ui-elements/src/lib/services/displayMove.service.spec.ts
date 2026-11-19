import { describe, expect, it } from "vitest";
import { Piece } from "@sp/dbmanager/src/lib/models/piece";
import { Problem } from "@sp/dbmanager/src/lib/models/problem";
import { SquareLocations } from "@sp/dbmanager/src/lib/models/locations";
import { applyFairyEffect } from "./displayMove.service";

describe("applyFairyEffect", () => {
  it("rebirths a captured black king at the fairy-effect target", () => {
    const problem = Problem.fromJson({});
    problem.pieces.push(Piece.fromJson({
      appearance: "p",
      color: "White",
      ...SquareLocations.e8,
    }));

    expect(applyFairyEffect(problem, "[bKg2->e8]")).toBe(true);

    const reborn = problem.GetPieceAt(SquareLocations.e8.column, SquareLocations.e8.traverse);
    expect(reborn?.color).toBe("Black");
    expect(reborn?.appearance).toBe("k");
  });

  it("rebirths a fairy piece with its fairy data", () => {
    const problem = Problem.fromJson({});
    problem.pieces.push(Piece.fromJson({
      appearance: "n",
      color: "White",
      fairyCode: "am",
      fairyAttributes: ["Royal"],
      fairyParams: [],
      ...SquareLocations.a1,
    }));

    expect(applyFairyEffect(problem, "wAMg2->e1")).toBe(true);

    const reborn = problem.GetPieceAt(SquareLocations.e1.column, SquareLocations.e1.traverse);
    expect(reborn?.color).toBe("White");
    expect(reborn?.fairyCode).toBe("am");
  });

  it("ignores normal move notation", () => {
    const problem = Problem.fromJson({});
    expect(applyFairyEffect(problem, "Rh1-f1")).toBe(false);
  });
});
