import {
  ITwin,
  TwinTypes,
  TwinModes,
  TwinTypesKeys,
  TwinModesKeys,
  createXmlElement,
} from "../helpers";

export class Twin implements ITwin {
  TwinType: TwinTypes;
  TwinModes: TwinModes;
  ValueA: string;
  ValueB: string;
  ValueC: string;

  public static fromElement(el: Element): Twin {
    const t = new Twin();
    t.TwinType =
      TwinTypes[(el.getAttribute("TwinType") as TwinTypesKeys) ?? "Diagram"];
    t.TwinModes =
      TwinModes[(el.getAttribute("TwinModes") as TwinModesKeys) ?? "Normal"];
    t.ValueA = el.getAttribute("ValueA") ?? "";
    t.ValueB = el.getAttribute("ValueB") ?? "";
    t.ValueC = el.getAttribute("ValueC") ?? "";
    return t;
  }
  static fromJson(fromJson: Partial<ITwin>): Twin {
    const t = new Twin();
    t.TwinType = fromJson.TwinType ?? TwinTypes.Diagram;
    t.TwinModes = fromJson.TwinModes ?? TwinModes.Normal;
    t.ValueA = fromJson.ValueA ?? "";
    t.ValueB = fromJson.ValueB ?? "";
    t.ValueC = fromJson.ValueC ?? "";
    return t;
  }

  private constructor() {
    this.TwinType = TwinTypes.Diagram;
    this.TwinModes = TwinModes.Normal;
    this.ValueA = "";
    this.ValueB = "";
    this.ValueC = "";
  }
  public toString(): string {
    return twinmapper[this.TwinType](this.ValueA, this.ValueB, this.ValueC);
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
}

const twinmapper = {
  [TwinTypes.Custom]: (...args: string[]) => args.join(" ").trim(),
  [TwinTypes.Diagram]: () => `Diagram`,
  [TwinTypes.MovePiece]: (...args: string[]) =>
    `${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.RemovePiece]: (...args: string[]) => `- ${args[0]}`.trim(),
  [TwinTypes.AddPiece]: (...args: string[]) =>
    `+ ${args[0]} ${args[1]} ${args[2]}`.trim(),
  [TwinTypes.Substitute]: (...args: string[]) =>
    `${args[0]} ==> ${args[1]}`.trim(),
  [TwinTypes.SwapPieces]: (...args: string[]) =>
    `${args[0]} <-> ${args[1]}`.trim(),
  [TwinTypes.Rotation90]: () => `Rotation 90°`.trim(),
  [TwinTypes.Rotation180]: () => `Rotation 180°`.trim(),
  [TwinTypes.Rotation270]: () => `Rotation 270°`.trim(),
  [TwinTypes.TraslateNormal]: (...args: string[]) =>
    `Traslate: ${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.TraslateToroidal]: (...args: string[]) =>
    `Toroidal Tr.: ${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.MirrorHorizontal]: () => `Horizz. Mirror`.trim(),
  [TwinTypes.MirrorVertical]: () => `Vert. Mirror`.trim(),
  [TwinTypes.ChangeProblemType]: (...args: string[]) =>
    `ChangeType: ${args[0]} ${args[1]} ${args[2]}"`.trim(),
  [TwinTypes.Duplex]: () => `Duplex`.trim(),
  [TwinTypes.AfterKey]: () => `After Key`.trim(),
  [TwinTypes.SwapColors]: () => `Swap colors`.trim(),
  [TwinTypes.Stipulation]: (...args: string[]) =>
    `Stipulation > ${args[0]}`.trim(),
} as const;
