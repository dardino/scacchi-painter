import { ITwins, SequnceTypes } from "../helpers";
import { Twin } from "./twin";

export class Twins implements ITwins {
  Twins: Twin[] = [];
  TwinSequenceTypes: SequnceTypes = SequnceTypes.Normal;
  public static fromElement(el: Element | null): Twins {
    const t = new Twins();
    if (el == null) return t;

    t.TwinSequenceTypes =
      SequnceTypes[
        (el.getAttribute("TwinSequenceTypes") as keyof typeof SequnceTypes) ||
          "Normal"
      ];
    t.Twins = Array.from(el.querySelectorAll("Twin")).map((w) =>
      Twin.fromElement(w)
    );
    return t;
  }
  private constructor() {}
}
