import { Injectable } from "@angular/core";
import { DbmanagerService } from "./dbmanager.service";
import { PieceRotation, SquareLocation } from "./helpers";
import { Piece } from "./models";
import { FairyPiecesCodes } from "./models/fairesDB";

@Injectable({
  providedIn: "root",
})
export class CurrentProblemService {
  constructor(private dbManager: DbmanagerService) {}
  AddPiece(piece: Piece) {}
  RemovePiece(piece: Piece) {}
  RemovePieceAt(location: SquareLocation) {}
  MovePiece(piece: Piece, to: SquareLocation, mode: "swap" | "replace" = "replace") {}
  RotatePiece(piece: Piece, angle: PieceRotation) {}
  SetFairyAttribute(piece: Piece, attribute: string) {}
  SetCellFairyAttribute(location: SquareLocation, attribute: string) {}
  SetAsFairyPiece(fairyCode: FairyPiecesCodes) {}
}
