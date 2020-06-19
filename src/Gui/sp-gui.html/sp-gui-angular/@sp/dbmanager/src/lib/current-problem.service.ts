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
  AddPieceAt(location: SquareLocation, piece: Piece) {}
  RemovePieceAt(location: SquareLocation) {}
  MovePiece(from: SquareLocation, to: SquareLocation, mode: "swap" | "replace" = "replace") {}
  RotatePiece(location: SquareLocation, angle: PieceRotation) {}
  SetFairyAttribute(location: SquareLocation, attribute: string) {}
  SetCellFairyAttribute(location: SquareLocation, attribute: string) {}
  SetAsFairyPiece(location: SquareLocation, fairyCode: FairyPiecesCodes) {}
  RotateBoard(angle: "left" | "right") {}
  FlipBoard(axis: "x" | "y") {}
  ShiftBoard(axis: "x" | "y" | "-x" | "-y") {}
  ClearBoard() {}
  Reload(snapshotID?: number) {}
  Snapshot() {}
}
