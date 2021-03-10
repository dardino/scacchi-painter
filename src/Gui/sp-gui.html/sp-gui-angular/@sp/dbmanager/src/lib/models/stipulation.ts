import {
  IStipulation,
  ProblemTypes,
  EndingTypes,
  XMLProblemTypesKeys,
  XMLStipulationTypes,
  getProblemType,
  getEndingType,
} from "../helpers";

export class Stipulation implements IStipulation {
  problemType: ProblemTypes = "-";
  stipulationType: EndingTypes = "#";
  maximum = false;
  serie = false;
  moves = 2;
  completeStipulationDesc = "#2";
  colorStarter: "White" | "Black" = "White";

  get simpleStipulationDesc(): string {
    const { problemType, stipulationType } = this;
    return (problemType === "-" ? "" : problemType) + stipulationType;
  }

  static fromElement(source: Element): Stipulation {
    const p = new Stipulation();
    p.problemType = getProblemType(source.getAttribute("ProblemType") as XMLProblemTypesKeys);
    p.moves = parseFloat(source.getAttribute("Moves") ?? "2");
    p.maximum = source.getAttribute("Maximum") === "true";
    p.serie = source.getAttribute("Serie") === "true";
    p.stipulationType = getEndingType(source.getAttribute("Stipulation") as XMLStipulationTypes);
    p.completeStipulationDesc =
      source.getAttribute("CompleteStipulationDesc") ?? "#2";
    return p;
  }
  static fromJson(stipulation: Partial<IStipulation> | undefined): Stipulation {
    const p = new Stipulation();
    if (!stipulation) return p;
    p.problemType = stipulation.problemType ?? "-";
    p.stipulationType = stipulation.stipulationType ?? "#";
    p.maximum = stipulation.maximum ?? false;
    p.serie = stipulation.serie ?? false;
    p.moves = stipulation.moves ?? 2;
    p.completeStipulationDesc = stipulation.completeStipulationDesc ?? "#2";
    return p;
  }
  toJson(): Partial<IStipulation> {
    const json: Partial<IStipulation> = {};
    if (this.problemType !== "-") json.problemType = this.problemType;
    if (this.stipulationType !== "#") {
      json.stipulationType = this.stipulationType;
    }
    if (this.maximum === true) json.maximum = this.maximum;
    if (this.serie === true) json.serie = this.serie;
    if (this.moves !== 2) json.moves = this.moves;
    if (this.completeStipulationDesc !== "#2") {
      json.completeStipulationDesc = this.completeStipulationDesc;
    }
    return json;
  }
  getXMLEndingType(): XMLStipulationTypes {
    switch (this.stipulationType) {
      case "#": return "Mate";
      case "=": return "Stalemate";
      default : return "Custom";
    }
  }
  getXMLProblemType(): XMLProblemTypesKeys {
    switch (this.problemType) {
      case "-":  return "Direct";
      case "H":  return "Help";
      case "S":  return "Self";
      case "HS": return "HelpSelf";
      case "R":  return "Custom";
      case "HR": return "Custom";
      default:   return "Direct";
    }
  }

  private constructor() {}
}
