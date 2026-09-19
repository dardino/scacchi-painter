import { createXmlElement } from "../helpers";
import { ITwins, SequenceTypes, TwinModes } from "../SPX.v4";
import { Twin } from "./twin";

export class Twins implements ITwins {
  static #normalizeTwinsList(t: Twins) {
    if (t.HasDiagram) {
      // Remove all "Diagram" twins, then re-add a single "Diagram" twin at the beginning
      t.TwinList = t.TwinList.filter(tw => tw.TwinType !== "Diagram");
      t.TwinList.unshift(Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: "Diagram" }));
    }
    if (t.TwinList.length <= 1 && !t.HasDiagram) {
      // Ensure there is at least one "Diagram" twin at the beginning but only if twins list is too short
      // If tiwns length is already sufficient, we don't need to add another "Diagram" twin
      // because it will be considered as Zero-Position
      t.TwinList.unshift(Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: "Diagram" }));
    }
  }

  public static fromElement(el: Element | null): Twins {
    const t = new Twins();
    if (el == null) return t;
    t.TwinSequenceTypes
      = SequenceTypes[
        (el.getAttribute("TwinSequenceTypes") as keyof typeof SequenceTypes)
        || "Normal"
      ];
    t.TwinList = Array.from(el.querySelectorAll("Twin")).map(Twin.fromElement);
    Twins.#normalizeTwinsList(t);
    return t;
  }

  static fromJson(twins: ITwins | null | undefined): Twins {
    const p = new Twins();
    if (twins == null) return p;
    if (twins.TwinSequenceTypes != null) {
      p.TwinSequenceTypes = twins.TwinSequenceTypes;
    }
    p.TwinList = (twins.TwinList ?? []).map(Twin.fromJson);
    Twins.#normalizeTwinsList(p);
    return p;
  }

  TwinList: Twin[] = [Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: "Diagram" })];
  TwinSequenceTypes: SequenceTypes = SequenceTypes.Normal;
  get HasDiagram(): boolean {
    return (this.TwinList ?? []).some(tw => tw.TwinType === "Diagram");
  }

  get HasZeroPosition(): boolean {
    return !this.HasDiagram && this.TwinList.length > 1;
  }

  private constructor() {}
  toJson(): Partial<ITwins> {
    const p: Partial<ITwins> = {};
    if (this.TwinSequenceTypes !== SequenceTypes.Normal) p.TwinSequenceTypes = this.TwinSequenceTypes;
    if (this.TwinList.length > 0) p.TwinList = this.TwinList.map(t => t.toJson());
    return p;
  }

  toSP2Xml(): Element {
    const twins = createXmlElement("Twins");
    twins.setAttribute("TwinSequenceTypes", this.TwinSequenceTypes);
    this.TwinList.forEach((t) => {
      twins.appendChild(t.toSP2Xml());
    });
    return twins;
  }
}
