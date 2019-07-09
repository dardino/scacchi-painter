import { NgModule } from "@angular/core";
import { CbsComponent } from "./cbs/cbs.component";
import { ChessboardComponent } from "./chessboard/chessboard.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [CbsComponent, ChessboardComponent],
  imports: [CommonModule],
  exports: [CbsComponent, ChessboardComponent]
})
export class SpUicModule {}
