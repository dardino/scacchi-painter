import { NgModule } from "@angular/core";
import { PieceSelectorComponent } from "./piece-selector/piece-selector.component";
import { BoardCellComponent } from "./board-cell/board-cell.component";
import { ChessboardComponent } from "./chessboard.component";
import { ChessboardAnimationService } from "./chessboard-animation.service";

@NgModule({
  declarations: [],
  providers: [ChessboardAnimationService],
  imports: [PieceSelectorComponent, BoardCellComponent, ChessboardComponent],
  exports: [PieceSelectorComponent, BoardCellComponent, ChessboardComponent],
})
export class ChessboardModule {}
