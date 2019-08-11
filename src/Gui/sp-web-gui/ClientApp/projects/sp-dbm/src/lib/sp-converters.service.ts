import { Injectable } from "@angular/core";
import { Piece, PieceColors, Columns, Traverse, PieceRotation } from "./sp-dbm.service";
import { Figurine, BoardRank, BoardFile, BoardLocation, Piece as BP, Colors, Rotations } from "canvas-chessboard";

@Injectable({
  providedIn: "root"
})
export class SpConvertersService {
  constructor() {}
  public ConvertToBp(p: Partial<Piece>): BP {
    return {
      figurine: this.getFigurine(p.appearance),
      color: this.getColor(p.color),
      loc: this.getLocation(p.column, p.traverse),
      rot: this.getRotation(p.rotation)
    } as BP;
  }

  getRotation(rotation: PieceRotation): Rotations {
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

  getLocation(x: Columns, y: Traverse): BoardLocation {
    if (typeof x !== "number" || typeof y !== "number") return { col: BoardFile.A, row: BoardRank.R1 };
    return {
      col: this.getBoardFile(x),
      row: this.getBoardRank(y)
    };
  }
  getBoardFile(x: never): BoardFile {
    throw new Error("Method not implemented.");
  }
  getBoardRank(y: never): BoardRank {
    throw new Error("Method not implemented.");
  }

  private getColor(c: PieceColors): Colors {
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
      case "p":
      case "p":
      default:
        return Figurine.p;
    }
  }
}
