/* eslint-disable @typescript-eslint/naming-convention */
import { popeyeTwinMapper } from "@sp/gui/src/webbridge";
import {
  ITwin,
  TwinModes,
  TwinModesKeys,
  TwinTypesKeys,
  createXmlElement
} from "../helpers";

export class Twin implements ITwin {
  TwinType: TwinTypesKeys;
  TwinModes: TwinModes;
  ValueA: string;
  ValueB: string;
  ValueC: string;

  public static fromElement(el: Element): Twin {
    const t = new Twin();
    t.TwinType = (el.getAttribute("TwinType") as TwinTypesKeys) ?? "Diagram";
    t.TwinModes =
      TwinModes[(el.getAttribute("TwinModes") as TwinModesKeys) ?? "Normal"];
    t.ValueA = el.getAttribute("ValueA") ?? "";
    t.ValueB = el.getAttribute("ValueB") ?? "";
    t.ValueC = el.getAttribute("ValueC") ?? "";
    return t;
  }

  public static get DIAGRAM() {
    const t = new Twin();
    t.TwinType = "Diagram";
    return t;
  }
  static fromJson(fromJson: Partial<ITwin>): Twin {
    const t = new Twin();
    t.TwinType = fromJson.TwinType ?? "Diagram";
    t.TwinModes = fromJson.TwinModes ?? TwinModes.Normal;
    t.ValueA = fromJson.ValueA ?? "";
    t.ValueB = fromJson.ValueB ?? "";
    t.ValueC = fromJson.ValueC ?? "";
    return t;
  }

  private constructor() {
    this.TwinType = "Diagram";
    this.TwinModes = TwinModes.Normal;
    this.ValueA = "";
    this.ValueB = "";
    this.ValueC = "";
  }
  public toString(): string {
    return popeyeTwinMapper[this.TwinType](this.ValueA, this.ValueB, this.ValueC);
  }
  toSP2Xml(): Element {
    const twin = createXmlElement("Twin");
    twin.setAttribute("TwinType", this.TwinType);
    twin.setAttribute("ValueA", this.ValueA);
    twin.setAttribute("ValueB", this.ValueB);
    twin.setAttribute("ValueC", this.ValueC);
    twin.setAttribute("TwinModes", this.TwinModes);
    return twin;
  }
  toJson(): ITwin {
    const twin: ITwin = {
      TwinType: this.TwinType,
      ValueA: this.ValueA,
      ValueB: this.ValueB,
      ValueC: this.ValueC,
      TwinModes: this.TwinModes,
    };
    return twin;
  }
}
