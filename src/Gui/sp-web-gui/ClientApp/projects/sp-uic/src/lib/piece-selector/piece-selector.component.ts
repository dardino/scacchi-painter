import { Component, OnInit } from "@angular/core";
import { Piece, PieceColors, PieceRotation } from "projects/sp-dbm/src/public-api";

@Component({
  selector: "lib-piece-selector",
  templateUrl: "./piece-selector.component.html",
  styleUrls: ["./piece-selector.component.styl"]
})
export class PieceSelectorComponent implements OnInit {
  private currentPiece: Piece | null = null;

  public Pieces: Array<Piece> = [
    { color: PieceColors.White, appearance: "k", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.White, appearance: "q", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.White, appearance: "r", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.White, appearance: "b", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.White, appearance: "n", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.White, appearance: "p", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.Black, appearance: "k", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.Black, appearance: "q", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.Black, appearance: "r", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.Black, appearance: "b", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.Black, appearance: "n", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" },
    { color: PieceColors.Black, appearance: "p", column: "ColA", traverse: "Row1", rotation: PieceRotation.NoRotation, fairyAttribute: "", fairyCode: "" }
  ];

  public GetKey(piece: Piece) {
    return this.Pieces.indexOf(piece);
  }

  public SelectPiece(piece: Piece) {
    if (this.currentPiece !== piece) this.currentPiece = piece;
    else this.currentPiece = null;
  }

  public get CurrentPiece() {
    return this.currentPiece;
  }

  constructor() {}

  ngOnInit() {}
}
