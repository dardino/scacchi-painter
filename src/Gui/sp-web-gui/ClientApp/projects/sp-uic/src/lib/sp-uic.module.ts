import { NgModule } from "@angular/core";
import { CbsComponent } from "./cbs/cbs.component";
import { ChessboardComponent } from "./chessboard/chessboard.component";
import { CommonModule } from "@angular/common";
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { MatIconModule, MatButtonModule } from "@angular/material";
import { PieceSelectorComponent } from "./piece-selector/piece-selector.component";

@NgModule({
  declarations: [CbsComponent, ChessboardComponent, ToolbarComponent, PieceSelectorComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule],
  exports: [CbsComponent, ChessboardComponent, ToolbarComponent, PieceSelectorComponent]
})
export class SpUicModule {}
