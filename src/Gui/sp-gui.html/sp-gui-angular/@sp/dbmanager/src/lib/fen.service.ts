import { Injectable } from "@angular/core";
import { IPiece, rowToPieces, fenToChessBoard } from "./helpers";

@Injectable({
  providedIn: "root",
})
export class FenService {
  FenToChessBoard(fen: string) {
    return fenToChessBoard(fen);
  }

}
