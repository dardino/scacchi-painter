import { Problem } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { describe, expect, it } from "vitest";
import { formatSpCoreUnsupportedMessage, getSpCoreUnsupportedFeatures } from "./spcore-support";

describe("getSpCoreUnsupportedFeatures", () => {
  it("returns no issues for an orthodox directmate", () => {
    const problem = Problem.fromFen("8/8/8/8/8/8/8/4K3");

    expect(getSpCoreUnsupportedFeatures(problem, "start")).toEqual([]);
  });

  it("reports the unsupported features present in the problem", () => {
    const problem = Problem.fromFen("8/8/8/8/8/8/8/4K3");
    problem.stipulation.completeStipulationDesc = "h#2.5";
    problem.conditions = ["Circe"];
    problem.twins.TwinList.push({
      ...problem.twins.TwinList[0],
      TwinType: "Duplex",
    } as Twin);
    problem.pieces[0].color = "Neutral";
    problem.pieces[0].fairyCode = [{ code: "am", params: [] }];

    expect(getSpCoreUnsupportedFeatures(problem, "try")).toEqual([
      "try mode",
      "stipulation h#2.5",
      "conditions",
      "twins",
      "neutral pieces",
      "fairy pieces",
    ]);
  });
});

describe("formatSpCoreUnsupportedMessage", () => {
  it("formats a clear user-facing message", () => {
    expect(formatSpCoreUnsupportedMessage(["conditions", "twins"]))
      .toContain("Unsupported features: conditions, twins");
  });
});
