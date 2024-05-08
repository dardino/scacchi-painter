/* eslint-disable @typescript-eslint/naming-convention */
import { ITwins, SequnceTypes, TwinModes, createXmlElement } from "../helpers";
import { Twin } from "./twin";

export class Twins implements ITwins {
  TwinList: Twin[] = [Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: "Diagram" })];
  TwinSequenceTypes: SequnceTypes = SequnceTypes.Normal;
  get HasDiagram(): boolean {
    return (this.TwinList ?? []).some(tw => tw.TwinType === "Diagram");
  }
  get ZeroPosition(): boolean {
    return !this.HasDiagram && this.TwinList.length > 1;
  }
  private constructor() {}
  public static fromElement(el: Element | null): Twins {
    const t = new Twins();
    if (el == null) return t;
    t.TwinSequenceTypes =
      SequnceTypes[
        (el.getAttribute("TwinSequenceTypes") as keyof typeof SequnceTypes) ||
          "Normal"
      ];
    t.TwinList = Array.from(el.querySelectorAll("Twin")).map(Twin.fromElement);
    // cleanup if there are too many "Diagram"
    if (t.TwinList.filter(tw => tw.TwinType === "Diagram").length > 1) {
      t.TwinList = t.TwinList.filter(tw => tw.TwinType !== "Diagram");
    }
    if (t.TwinList.length <= 1 || !t.HasDiagram) {
      t.TwinList.unshift(Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: "Diagram" }));
    }
    return t;
  }
  static fromJson(twins: ITwins | null | undefined): Twins {
    const p = new Twins();
    if (twins == null) return p;
    if (twins.TwinSequenceTypes != null) {
      p.TwinSequenceTypes = twins.TwinSequenceTypes;
    }
    p.TwinList = (twins.TwinList ?? []).map(Twin.fromJson);
    // cleanup if there are too many "Diagram"
    if (p.TwinList.filter(tw => tw.TwinType === "Diagram").length > 1) {
      p.TwinList = p.TwinList.filter(tw => tw.TwinType !== "Diagram");
    }
    if (p.TwinList.length <= 1 || !p.HasDiagram) {
      p.TwinList.unshift(Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: "Diagram" }));
    }
    return p;
  }
  toJson(): Partial<ITwins> {
    const p: Partial<ITwins> = {};
    if (this.TwinSequenceTypes !== SequnceTypes.Normal) p.TwinSequenceTypes = this.TwinSequenceTypes;
    if (this.TwinList.length > 0) p.TwinList = this.TwinList.map(t => t.toJson());
    return p;
  }
  toSP2Xml(): Element {
    const twins = createXmlElement("Twins");
    twins.setAttribute("TwinSequenceTypes", this.TwinSequenceTypes);
    this.TwinList.forEach(t => {
      twins.appendChild(t.toSP2Xml());
    });
    return twins;
  }
}
