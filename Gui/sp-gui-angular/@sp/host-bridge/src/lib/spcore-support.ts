import { Problem } from "@sp/dbmanager/src/lib/models";
import { SolveModes } from "./bridge-global";

const DIRECT_MATE_PATTERN = /^#\d+$/;

export function getSpCoreUnsupportedFeatures(problem: Problem, mode: SolveModes): string[] {
  const unsupported: string[] = [];

  if (mode === "try") {
    unsupported.push("try mode");
  }

  if (!DIRECT_MATE_PATTERN.test(problem.stipulation.completeStipulationDesc.trim())) {
    unsupported.push(`stipulation ${problem.stipulation.completeStipulationDesc}`);
  }

  if (problem.conditions.some(condition => condition.trim() !== "")) {
    unsupported.push("conditions");
  }

  if (problem.twins.TwinList.some(twin => twin.TwinType !== "Diagram")) {
    unsupported.push("twins");
  }

  if (problem.pieces.some(piece => piece.color === "Neutral")) {
    unsupported.push("neutral pieces");
  }

  if (problem.pieces.some(piece => piece.isFairy())) {
    unsupported.push("fairy pieces");
  }

  return unsupported;
}

export function formatSpCoreUnsupportedMessage(unsupported: string[]): string {
  if (unsupported.length === 0) {
    return "";
  }

  const label = unsupported.length === 1 ? "feature" : "features";
  return `SpCore does not support this problem yet. Unsupported ${label}: ${unsupported.join(", ")}. Supported subset: direct mates #n on orthodox positions without twins, conditions, fairy pieces, neutral pieces, or try mode.`;
}
