/* eslint-disable @typescript-eslint/naming-convention */
import { ITwins, SequnceTypes, createXmlElement, notEmpty, TwinModes, TwinTypes } from "../helpers";
import { Twin } from "./twin";

export class Twins implements ITwins {
  TwinList: Twin[] = [Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: TwinTypes.Diagram })];
  TwinSequenceTypes: SequnceTypes = SequnceTypes.Normal;
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
    if (t.TwinList.length === 0) t.TwinList.push(Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: TwinTypes.Diagram }));
    return t;
  }
  static fromJson(twins: ITwins | null | undefined): Twins {
    const p = new Twins();
    if (twins == null) return p;
    if (twins.TwinSequenceTypes != null) {
      p.TwinSequenceTypes = twins.TwinSequenceTypes;
    }
    p.TwinList = (twins.TwinList || []).map(Twin.fromJson);
    if (p.TwinList.length === 0) p.TwinList.push(Twin.fromJson({ TwinModes: TwinModes.Normal, TwinType: TwinTypes.Diagram }));
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
