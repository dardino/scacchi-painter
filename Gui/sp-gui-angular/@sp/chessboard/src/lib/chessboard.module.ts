import { NgModule } from "@angular/core";
import { ChessboardAnimationService } from "./chessboard-animation.service";
import { ChessboardComponent } from "./chessboard.component";
import { PieceSelectorComponent } from "./piece-selector/piece-selector.component";

@NgModule({
  declarations: [],
  providers: [ChessboardAnimationService],
  imports: [PieceSelectorComponent, ChessboardComponent],
  exports: [PieceSelectorComponent, ChessboardComponent],
})
export class ChessboardModule {}
