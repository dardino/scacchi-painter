import { Injectable } from "@angular/core";
import { fenToChessBoard } from "./helpers";

@Injectable({
  providedIn: "root",
})
export class FenService {
  FenToChessBoard(fen: string) {
    return fenToChessBoard(fen);
  }
}
