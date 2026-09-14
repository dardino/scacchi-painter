import { type PieceInfo as BP } from "@dardino/chess-board";

import {
  createXmlElement,
  getCanvasColor,
  getCanvasRotation,
  getFigurine,
  getRotationSymbol,
  notationCasingByColor,
  SquareLocation,
} from "../helpers";
import { SP2 } from "../SP2";
import { Columns, IPieceV4, PieceColors, Traverse } from "../SPX.v4";

export class Piece implements IPieceV4 {
  public appearance: IPieceV4["appearance"] | "";
  public fairyCode: IPieceV4["fairyCode"];
  public color: IPieceV4["color"];
  public column: IPieceV4["column"];
  public traverse: IPieceV4["traverse"];
  public rotation: IPieceV4["rotation"];
  public fairyAttributes: IPieceV4["fairyAttributes"];
  public fairyParams: IPieceV4["fairyParams"];

  static fromSP2Xml(source: Element): Piece {
    const p = new Piece();
    p.appearance = SP2.getAppearance(source);
    p.color = SP2.getColor(source);
    p.column = SP2.getColum(source) ?? Columns[0];
    p.fairyAttributes = SP2.getFairyAttribute(source);
    p.fairyCode = SP2.getFairyCodes(source)[0].code ?? null;
    p.fairyParams = SP2.getFairyCodes(source)[0].params ?? [];
    p.rotation = SP2.getRotation(source);
    p.traverse = SP2.getTraverse(source) ?? Traverse[0];
    return p;
  }

  static fromJson(fromJson: Partial<IPieceV4>): Piece {
    const p = new Piece();
    p.appearance = fromJson.appearance ?? "";
    p.color = fromJson.color ?? "White";
    p.column = fromJson.column ?? "ColA";
    p.fairyAttributes = fromJson.fairyAttributes ?? [];
    p.fairyCode = fromJson.fairyCode ?? null;
    p.fairyParams = fromJson.fairyParams ?? [];
    p.rotation = fromJson.rotation ?? "NoRotation";
    p.traverse = fromJson.traverse ?? "Row1";
    p.fairyParams = fromJson.fairyParams ?? [];
    return p;
  }

  static fromPartial(
    data?: Partial<IPieceV4> | null,
    l?: SquareLocation,
  ): Piece | null {
    if (data == null) return null;
    const p = new Piece();
    p.appearance = data.appearance ?? "";
    p.color = data.color ?? "White";
    p.column = data.column ?? l?.column ?? "ColA";
    p.fairyAttributes = data.fairyAttributes ?? [];
    p.fairyCode = data.fairyCode ?? null;
    p.fairyParams = data.fairyParams ?? [];
    p.rotation = data.rotation ?? "NoRotation";
    p.traverse = data.traverse ?? l?.traverse ?? "Row1";
    return p;
  }

  public toSP2Xml() {
    const p = createXmlElement("Piece");
    SP2.setAppearance(p, this.appearance);
    SP2.setColor(p, this.color);
    SP2.setColum(p, this.column);
    SP2.setTraverse(p, this.traverse);
    SP2.setRotation(p, this.rotation);
    SP2.setFairyAttribute(p, this.fairyAttributes);
    SP2.setFairyCode(p, this.fairyCode, this.fairyParams);
    return p;
  }

  public ConvertToCanvasPiece(): BP {
    return {
      type: getFigurine(this.appearance) ?? "q",
      color: getCanvasColor(this.color),
      rotation: getCanvasRotation(this.rotation),
    } satisfies BP;
  }

  public SetLocation(
    newCol: Columns = this.column,
    newRow: Traverse = this.traverse,
  ) {
    this.column = newCol;
    this.traverse = newRow;
  }

  GetLocation(): SquareLocation {
    return {
      column: this.column,
      traverse: this.traverse,
    };
  }

  ToNotation() {
    const parts = [];
    parts.push(notationCasingByColor[this.color](this.appearance));
    if (this.rotation !== "NoRotation") {
      parts.push(getRotationSymbol(this.rotation));
    }
    return parts.join("");
  }

  ToFairyNotation(): string {
    if (!this.isFairy()) return "";
    return `${this.fairyCode?.toUpperCase() ?? ""}${this.column[3].toLowerCase()}${this.traverse[3]}`;
  }

  isFairy() {
    return (
      (this.fairyCode ?? null) !== null
      || (this.fairyAttributes || []).length > 0
    );
  }

  toJson(): Partial<IPieceV4> {
    const json: Partial<IPieceV4> = {};
    if (this.appearance) json.appearance = this.appearance;
    if (this.color) json.color = this.color;
    if (this.column) json.column = this.column;
    if (this.fairyAttributes.length > 0) json.fairyAttributes = this.fairyAttributes;
    if (this.fairyCode !== null) json.fairyCode = this.fairyCode;
    if (this.rotation) json.rotation = this.rotation;
    if (this.traverse) json.traverse = this.traverse;
    return json;
  }

  cursor() {
    const cursorColorByPieceColor: Record<PieceColors, string> = {
      Black: "b",
      Neutral: "n",
      White: "w",
    };
    return `${cursorColorByPieceColor[this.color]}_${this.appearance}`;
  }

  ToShortDescription() {
    return this.isFairy() ? this.ToFairyNotation() : this.ToNotation();
  }

  ToLongDescription() {
    return `${this.color} ${this.ToShortDescription().toUpperCase()}`;
  }

  private constructor() {
    this.appearance = "";
    this.fairyCode = null;
    this.color = "White";
    this.column = "ColA";
    this.traverse = "Row1";
    this.rotation = "NoRotation";
    this.fairyAttributes = [];
    this.fairyParams = [];
  }
}
