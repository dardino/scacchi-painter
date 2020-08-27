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
  colorStarter: "White" | "Black" = "White";

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
      source.getAttribute("CompleteStipulationDesc") ?? "#2";
    return p;
  }
  static fromJson(stipulation: Partial<IStipulation> | undefined): Stipulation {
    const p = new Stipulation();
    if (!stipulation) return p;
    p.problemType = stipulation.problemType ?? ProblemTypes.Direct;
    p.stipulationType = stipulation.stipulationType ?? StipulationTypes.Mate;
    p.maximum = stipulation.maximum ?? false;
    p.serie = stipulation.serie ?? false;
    p.moves = stipulation.moves ?? 2;
    p.completeStipulationDesc = stipulation.completeStipulationDesc ?? "#2";
    return p;
  }
  toJson(): Partial<IStipulation> {
    const json: Partial<IStipulation> = {};
    if (this.problemType !== ProblemTypes.Direct) json.problemType = this.problemType;
    if (this.stipulationType !== StipulationTypes.Mate) json.stipulationType = this.stipulationType;
    if (this.maximum === true) json.maximum = this.maximum;
    if (this.serie === true) json.serie = this.serie;
    if (this.moves !== 2) json.moves = this.moves;
    if (this.completeStipulationDesc !== "#2") json.completeStipulationDesc = this.completeStipulationDesc;
    return json;
  }

  private constructor() {}
}
