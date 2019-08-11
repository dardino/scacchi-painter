import { Injectable } from "@angular/core";
import { Piece, PieceColors, Columns, Traverse, PieceRotation, SquareLocation, FairyAttributes } from "./helpers";
import { Figurine, BoardRank, BoardFile, BoardLocation, Piece as BP, Colors, Rotations } from "canvas-chessboard";

@Injectable({ providedIn: "root" })
export class SpConvertersService {
  constructor() {}
  public ConvertToBp(p: Partial<Piece>, l: SquareLocation): BP {
    return {
      figurine: this.getFigurine(p.appearance),
      color: this.getColor(p.color),
      loc: this.getLocation(p.column || l.column, p.traverse || l.traverse),
      rot: this.getRotation(p.rotation)
    } as BP;
  }
  public ConvertToPiece(f: Element): Piece {
    return {
      appearance: this.getAppearance(f),
      color: this.getColor(f),
      column: this.getColum(f),
      fairyAttribute: this.getFairyAttribute(f),
      fairyCode: this.getFairyCode(f),
      rotation: this.getRotation(f),
      traverse: this.getTraverse(f)
    };
  }
  getTraverse(f: Element): Traverse {
    if (f instanceof Element) {
      return Traverse[Math.max(Traverse.indexOf((f.getAttribute("Traverse") as Traverse) || "Row1"), 0)];
    }
  }
  getFairyCode(f: Element): string {
    return "";
  }
  getFairyAttribute(f: Element): string {
    if (f instanceof Element) {
      return FairyAttributes[f.getAttribute("FairyAttribute")] || 0;
    }
  }
  getColum(f: Element): Columns {
    if (f instanceof Element) {
      return Columns[Math.max(Columns.indexOf((f.getAttribute("Column") as Columns) || "ColA"), 0)];
    }
  }

  private getAppearance(f: Element): string {
    if (f instanceof Element) {
      const pieceName = f.getAttribute("Type");
      switch (pieceName) {
        case "King":
          return "k";
        case "Queen":
          return "q";
        case "Rook":
        /* @deprecated */ case "Rock":
          return "r";
        case "Horse":
          return "n";
        case "Bishop":
          return "b";
        case "Pawn":
          return "p";
        default:
          return "";
      }
    }
  }

  private getRotation(el: Element): PieceRotation;
  private getRotation(rotation: PieceRotation): Rotations;
  private getRotation(rotation: PieceRotation | Element): RotType<typeof rotation> {
    if (rotation instanceof Element) {
      return PieceRotation[rotation.getAttribute("Rotation")] || PieceRotation.NoRotation;
    }

    switch (rotation) {
      case PieceRotation.NoRotation:
        return Rotations.NoRotation;
      case PieceRotation.Clockwise45:
        return Rotations.TopRight;
      case PieceRotation.Clockwise90:
        return Rotations.Right;
      case PieceRotation.Clockwise135:
        return Rotations.BottomRight;
      case PieceRotation.UpsideDown:
        return Rotations.UpsideDown;
      case PieceRotation.Counterclockwise135:
        return Rotations.BottomLeft;
      case PieceRotation.Counterclockwise90:
        return Rotations.Left;
      case PieceRotation.Counterclockwise45:
        return Rotations.TopLeft;
      default:
        return Rotations.NoRotation;
    }
  }

  private getLocation(x: Columns, y: Traverse): BoardLocation {
    if (typeof x !== "string" || typeof y !== "string") return { col: BoardFile.A, row: BoardRank.R1 };
    return {
      col: this.getBoardFile(x),
      row: this.getBoardRank(y)
    };
  }
  private getBoardFile(x: string | Columns): BoardFile {
    if (typeof x === "number") x = Columns[x];
    x = x.substr(3, 1); // extract col from "ColA";
    return BoardFile[x];
  }
  private getBoardRank(y: string | Traverse): BoardRank {
    if (typeof y === "number") y = Traverse[y];
    y = y.substr(3, 1); // extract row from "Row8";
    return BoardRank[`R${y}`];
  }

  private getColor(c: Element): PieceColors;
  private getColor(c: PieceColors): Colors;
  private getColor(c: PieceColors | Element): Colors | PieceColors {
    if (c instanceof Element) {
      return c.getAttribute("Color") as PieceColors;
    }
    switch (c) {
      case PieceColors.Black:
        return Colors.Black;
      case PieceColors.White:
        return Colors.White;
      default:
        return Colors.White;
    }
  }

  private getFigurine(appearance?: string): Figurine {
    switch (appearance) {
      case "K":
      case "k":
        return Figurine.k;
      case "Q":
      case "q":
        return Figurine.q;
      case "R":
      case "r":
        return Figurine.r;
      case "S":
      case "s":
      case "N":
      case "n":
        return Figurine.n;
      case "B":
      case "b":
        return Figurine.b;
      case "P":
      case "p":
        return Figurine.p;
      default:
        return null;
    }
  }
}

type RotType<T extends Element | PieceRotation> = T extends Element
  ? PieceRotation
  : T extends PieceRotation
  ? Rotations
  : never;
