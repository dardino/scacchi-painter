import { NgModule } from "@angular/core";
import { ChessboardComponent } from "./chessboard.component";
import { PieceSelectorComponent } from "./piece-selector/piece-selector.component";
import { BoardCellComponent } from "./board-cell/board-cell.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    ChessboardComponent,
    PieceSelectorComponent,
    BoardCellComponent,
  ],
  imports: [CommonModule],
  exports: [ChessboardComponent, PieceSelectorComponent],
})
export class ChessboardModule {}
