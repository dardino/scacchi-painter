import { Piece as BP } from "canvas-chessboard/modules/es2018/canvasChessBoard";

import {
  Columns,
  createXmlElement,
  getCanvasColor,
  getCanvasLocation,
  getCanvasRotation,
  getFigurine,
  getRotationSymbol,
  IPiece,
  notationCasingByColor,
  PieceColors,
  SquareLocation,
  Traverse,
} from "../helpers";
import { SP2 } from "../SP2";

export class Piece implements IPiece {
  public appearance: IPiece["appearance"] | "";
  public fairyCode: IPiece["fairyCode"];
  public color: IPiece["color"];
  public column: IPiece["column"];
  public traverse: IPiece["traverse"];
  public rotation: IPiece["rotation"];
  public fairyAttribute: IPiece["fairyAttribute"];

  static fromSP2Xml(source: Element): Piece {
    const p = new Piece();
    p.appearance = SP2.getAppearance(source);
    p.color = SP2.getColor(source);
    p.column = SP2.getColum(source) ?? Columns[0];
    p.fairyAttribute = SP2.getFairyAttribute(source);
    p.fairyCode = SP2.getFairyCodes(source);
    p.rotation = SP2.getRotation(source);
    p.traverse = SP2.getTraverse(source) ?? Traverse[0];
    return p;
  }

  static fromJson(fromJson: Partial<IPiece>): Piece {
    const p = new Piece();
    p.appearance = fromJson.appearance ?? "";
    p.color = fromJson.color ?? "White";
    p.column = fromJson.column ?? "ColA";
    p.fairyAttribute = fromJson.fairyAttribute ?? "";
    p.fairyCode = fromJson.fairyCode ?? [];
    p.rotation = fromJson.rotation ?? "NoRotation";
    p.traverse = fromJson.traverse ?? "Row1";
    return p;
  }

  static fromPartial(
    data?: Partial<IPiece> | null,
    l?: SquareLocation,
  ): Piece | null {
    if (data == null) return null;
    const p = new Piece();
    p.appearance = data.appearance ?? "";
    p.color = data.color ?? "White";
    p.column = data.column ?? l?.column ?? "ColA";
    p.fairyAttribute = data.fairyAttribute ?? "";
    p.fairyCode = data.fairyCode ?? [];
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
    SP2.setFairyAttribute(p, this.fairyAttribute);
    SP2.setFairyCode(p, this.fairyCode);
    return p;
  }

  public ConvertToCanvasPiece(): BP {
    return {
      figurine: getFigurine(this.appearance),
      color: getCanvasColor(this.color),
      loc: getCanvasLocation(this.column, this.traverse),
      rot: getCanvasRotation(this.rotation),
    } as BP;
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
    return `${this.fairyCode
      .map(c => c.code.toUpperCase())
      .join("/")}${this.column[3].toLowerCase()}${this.traverse[3]}`;
  }

  isFairy() {
    return (
      (this.fairyCode ?? []).length > 0
      || (this.fairyAttribute || "None") !== "None"
    );
  }

  toJson(): Partial<IPiece> {
    const json: Partial<IPiece> = {};
    if (this.appearance) json.appearance = this.appearance;
    if (this.color) json.color = this.color;
    if (this.column) json.column = this.column;
    if (this.fairyAttribute) json.fairyAttribute = this.fairyAttribute;
    if (this.fairyCode) json.fairyCode = this.fairyCode;
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
    this.fairyCode = [];
    this.color = "White";
    this.column = "ColA";
    this.traverse = "Row1";
    this.rotation = "NoRotation";
    this.fairyAttribute = "";
  }
}
