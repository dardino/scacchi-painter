import { Injectable } from "@angular/core";
import { Piece, PieceRotation, PieceColors } from "./helpers";

const rotationsCodes: ["+ ", "+/", "+-", "+\\", "- ", "-/", "--", "-\\"] = ["+ ", "+/", "+-", "+\\", "- ", "-/", "--", "-\\"];

const RotationsCodeMap = {
  [rotationsCodes[0]]: PieceRotation.NoRotation,
  [rotationsCodes[1]]: PieceRotation.Clockwise45,
  [rotationsCodes[2]]: PieceRotation.Clockwise90,
  [rotationsCodes[3]]: PieceRotation.Clockwise135,
  [rotationsCodes[4]]: PieceRotation.UpsideDown,
  [rotationsCodes[5]]: PieceRotation.Counterclockwise135,
  [rotationsCodes[6]]: PieceRotation.Counterclockwise90,
  [rotationsCodes[7]]: PieceRotation.Counterclockwise45,
};

@Injectable({ providedIn: "root" })
export class SpFenService {
  constructor() {}

  private rowToPieces(row: string): Partial<Piece>[] {
    const fairies = row.match(/\{[a-z]*\}/);
    row = row.replace(/\{[a-z]*\}/g, "!");
    row = row.replace(/([QKRTBNPAET1qkrtbnpaet1])/g, "|$1");
    row = row.replace(/\*\|(.)/g, "|*$1");
    row = row.replace(/:0/g, rotationsCodes[0]);
    row = row.replace(/:1/g, rotationsCodes[1]);
    row = row.replace(/:2/g, rotationsCodes[2]);
    row = row.replace(/:3/g, rotationsCodes[3]);
    row = row.replace(/:4/g, rotationsCodes[4]);
    row = row.replace(/:5/g, rotationsCodes[5]);
    row = row.replace(/:6/g, rotationsCodes[6]);
    row = row.replace(/:7/g, rotationsCodes[7]);
    row = row.replace(/[8]/g, Array(9).join("|#"));
    row = row.replace(/[7]/g, Array(8).join("|#"));
    row = row.replace(/[6]/g, Array(7).join("|#"));
    row = row.replace(/[5]/g, Array(6).join("|#"));
    row = row.replace(/[4]/g, Array(5).join("|#"));
    row = row.replace(/[3]/g, Array(4).join("|#"));
    row = row.replace(/[2]/g, Array(3).join("|#"));
    row = row.replace(/[1]/g, "#");
    row = row.substr(1);
    const piecesStrings = row.split("|");
    const pieces: Partial<Piece>[] = [];
    let f = 0;
    for (let x = 0; x < piecesStrings.length; x++) {
      const c = piecesStrings[x];
      // empty cell
      if (c === "#") {
        pieces.push(null);
        continue;
      }
      const pieceName = c.substr(0, 1);
      let rotation: PieceRotation;
      let fairy = "";
      if (c.length >= 3) {
        rotation = RotationsCodeMap[c.substr(1, 2)];
        if (c.indexOf("!") > -1) {
          fairy = fairies[f];
          f++;
        }
      }

      pieces.push({
        appearance: pieceName,
        rotation: PieceRotation[rotation],
        fairyCode: fairy.replace(/[\{\}]/g, ""),
        color: pieceName.toLowerCase() === pieceName ? PieceColors.White : PieceColors.Black
      });
    }
    return pieces;
  }

  FenToChessBoard(fen: string) {
    const fenrows = fen.split("/");
    const cells = fenrows
      .map(f => this.rowToPieces(f))
      .reduce<{ index: number, data: Partial<Piece> }[]>((a, b, i, m) => a.concat(b.map(e => ({ index: i, data: e }))), []);
      return cells;
  }
}
