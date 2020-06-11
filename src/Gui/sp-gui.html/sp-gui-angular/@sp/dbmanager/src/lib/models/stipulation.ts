import {
  IStipulation,
  ProblemTypes,
  StipulationTypes,
  ProblemTypesKeys,
} from "../helpers";

export class Stipulation implements IStipulation {
  problemType: ProblemTypes = ProblemTypes.Direct;
  stipulationType: StipulationTypes = StipulationTypes.Mate;
  maximum = false;
  serie = false;
  moves = 2;
  completeStipulationDesc = "#2";

  static fromElement(source: Element): Stipulation {
    const p = new Stipulation();
    p.problemType =
      ProblemTypes[
        (source.getAttribute("ProblemType") as ProblemTypesKeys) ?? ""
      ];
    p.moves = parseFloat(source.getAttribute("Moves") ?? "2");
    p.maximum = source.getAttribute("Maximum") === "true";
    p.serie = source.getAttribute("Serie") === "true";
    p.completeStipulationDesc =
      source.getAttribute("CompleteStipulationDesc") ?? "";
    return p;
  }

  private constructor() {}
}
