import { ITwins, SequnceTypes } from "../helpers";
import { Twin } from "./twin";

export class Twins implements ITwins {
  TwinList: Twin[] = [];
  TwinSequenceTypes: SequnceTypes = SequnceTypes.Normal;
  public static fromElement(el: Element | null): Twins {
    const t = new Twins();
    if (el == null) return t;

    t.TwinSequenceTypes =
      SequnceTypes[
        (el.getAttribute("TwinSequenceTypes") as keyof typeof SequnceTypes) ||
          "Normal"
      ];
    t.TwinList = Array.from(el.querySelectorAll("Twin")).map(Twin.fromElement);
    return t;
  }
  static fromJson(twins: ITwins | null | undefined): Twins {
    const p = new Twins();
    if (twins == null) return p;
    if (twins.TwinSequenceTypes != null) {
      p.TwinSequenceTypes = twins.TwinSequenceTypes;
    }
    p.TwinList = (twins.TwinList || []).map(Twin.fromJson);
    return p;
  }
  toJson(): Partial<ITwins> {
    const p: Partial<ITwins> = {};
    return p;
  }
  private constructor() {}
}
