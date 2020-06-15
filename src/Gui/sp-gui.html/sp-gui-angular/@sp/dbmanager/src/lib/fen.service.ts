import { Injectable } from "@angular/core";
import { PieceRotation, IPiece } from "./helpers";
import { Figurine } from "canvas-chessboard/modules/es2018/canvasChessBoard";
const RotationsCodes = [
  "+ ",
  "+/",
  "+-",
  "+\\",
  "- ",
  "-/",
  "--",
  "-\\",
] as const;
type RotationsCodes = typeof RotationsCodes[number];

const RotationsCodeMap: {
  [key in RotationsCodes]: PieceRotation;
} = {
  "+ ": "NoRotation",
  "+/": "Clockwise45",
  "+-": "Clockwise90",
  "+\\": "Clockwise135",
  "- ": "UpsideDown",
  "-/": "Counterclockwise135",
  "--": "Counterclockwise90",
  "-\\": "Counterclockwise45",
};

@Injectable({
  providedIn: "root",
})
export class FenService {
  private rowToPieces(row: string): Array<Partial<IPiece> | null> {
    const fairies = row.match(/\{[a-z]*\}/);
    row = row.replace(/\{[a-z]*\}/g, "!");
    row = row.replace(/([QKRTBNPAETqkrtbnpaet]|^1)/g, "|$1");
    row = row.replace(/([^:|])1/g, "$1|1");
    row = row.replace(/\*\|(.)/g, "|*$1");
    row = row.replace(/:0/g, RotationsCodes[0]);
    row = row.replace(/:1/g, RotationsCodes[1]);
    row = row.replace(/:2/g, RotationsCodes[2]);
    row = row.replace(/:3/g, RotationsCodes[3]);
    row = row.replace(/:4/g, RotationsCodes[4]);
    row = row.replace(/:5/g, RotationsCodes[5]);
    row = row.replace(/:6/g, RotationsCodes[6]);
    row = row.replace(/:7/g, RotationsCodes[7]);
    row = row.replace(/[8]/g, Array(9).join("|#"));
    row = row.replace(/[7]/g, Array(8).join("|#"));
    row = row.replace(/[6]/g, Array(7).join("|#"));
    row = row.replace(/[5]/g, Array(6).join("|#"));
    row = row.replace(/[4]/g, Array(5).join("|#"));
    row = row.replace(/[3]/g, Array(4).join("|#"));
    row = row.replace(/[2]/g, Array(3).join("|#"));
    row = row.replace(/[1]/g, "#");
    row = row.trim().substr(1);
    const piecesStrings = row.split("|");
    const pieces: Array<Partial<IPiece> | null> = [];
    let f = 0;
    for (const c of piecesStrings) {
      // empty cell
      if (c === "#") {
        pieces.push(null);
        continue;
      }
      const isNeutral = c[0] === "*";
      const pieceName = (isNeutral ? c.substr(1, 1) : c.substr(0, 1)) as Figurine;
      const pieceRotation = c.substr(1, 2) as RotationsCodes;
      let rotation: PieceRotation = "NoRotation";
      let fairy = "";
      if (c.length >= 3) {
        rotation = RotationsCodeMap[pieceRotation];
        if (c.indexOf("!") > -1) {
          fairy = fairies?.[f] ?? "";
          f++;
        }
      }

      pieces.push({
        appearance: pieceName,
        rotation,
        fairyCode: fairy.replace(/[\{\}]/g, ""),
        color: isNeutral ? "Neutral" : pieceName.toLowerCase() !== pieceName ? "White" : "Black",
      });
    }

    return pieces;
  }

  FenToChessBoard(fen: string) {
    const fenrows = fen.split("/");
    const cells = fenrows
      .map((f) => this.rowToPieces(f))
      .reduce<Array<{ index: number; data: Partial<IPiece> | null }>>(
        (a, b, i, m) => a.concat(b.map((e) => ({ index: i, data: e }))),
        []
      );
    return cells;
  }

}
