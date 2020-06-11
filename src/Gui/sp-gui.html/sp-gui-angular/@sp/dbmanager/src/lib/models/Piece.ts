import { Piece as BP } from "canvas-chessboard";

import {
  IPiece,
  getAppearance,
  getFigurine,
  getColor,
  getColum,
  getFairyAttribute,
  getFairyCode,
  getRotation,
  getTraverse,
  getCanvasLocation,
  getCanvasRotation,
  SquareLocation,
  Columns,
  Traverse,
  getRotationSymbol,
  getCanvasColor,
} from "../helpers";

export class Piece implements IPiece {
  public appearance: IPiece["appearance"];
  public fairyCode: IPiece["fairyCode"];
  public color: IPiece["color"];
  public column: IPiece["column"];
  public traverse: IPiece["traverse"];
  public rotation: IPiece["rotation"];
  public fairyAttribute: IPiece["fairyAttribute"];

  static fromElement(source: Element): Piece {
    const p = new Piece();
    p.appearance = getAppearance(source);
    p.color = getColor(source);
    p.column = getColum(source) ?? Columns[0];
    p.fairyAttribute = getFairyAttribute(source);
    p.fairyCode = getFairyCode(source);
    p.rotation = getRotation(source);
    p.traverse = getTraverse(source) ?? Traverse[0];
    return p;
  }
  static fromPartial(
    data?: Partial<IPiece> | null,
    l?: SquareLocation
  ): Piece | null {
    if (data == null) return null;
    const p = new Piece();
    p.appearance = data.appearance ?? "";
    p.color = data.color ?? "White";
    p.column = data.column ?? l?.column ?? "ColA";
    p.fairyAttribute = data.fairyAttribute ?? "";
    p.fairyCode = data.fairyCode ?? "";
    p.rotation = data.rotation ?? "NoRotation";
    p.traverse = data.traverse ?? l?.traverse ?? "Row1";
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

  ToNotation() {
    const parts = [];
    parts.push(
      this.color === "White"
        ? this.appearance.toUpperCase()
        : this.color === "Black"
        ? this.appearance.toLowerCase()
        : "*" + this.appearance.toUpperCase()
    );
    if (this.rotation !== "NoRotation") {
      parts.push(getRotationSymbol(this.rotation));
    }
    return parts.join("");
  }

  private constructor() {
    this.appearance = "";
    this.fairyCode = "";
    this.color = "White";
    this.column = "ColA";
    this.traverse = "Row1";
    this.rotation = "NoRotation";
    this.fairyAttribute = "";
  }
}
