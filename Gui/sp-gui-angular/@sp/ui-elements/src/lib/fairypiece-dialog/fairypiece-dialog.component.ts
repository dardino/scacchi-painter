import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FairyPiecesDB } from "@sp/dbmanager/src/lib/models/fairesDB";
import { IPiece } from "@sp/dbmanager/src/lib/SPX";
import { SquareLocation } from "@sp/dbmanager/src/public-api";

export interface FairypieceDialogInput {
  cell: SquareLocation;
  originalPiece: IPiece | null;
}
export interface FairypieceDialogResponse {
  updatedPiece: IPiece | null;
  cell: SquareLocation;
  originalPiece: IPiece | null;
}

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  selector: "lib-fairypiece-dialog",
  styleUrl: "./fairypiece-dialog.component.sass",
  templateUrl: "./fairypiece-dialog.component.html",
})
export class FairypieceDialogComponent {
  data = inject<FairypieceDialogInput>(MAT_DIALOG_DATA);

  fairyTypes = Object.entries(FairyPiecesDB).map(([code, description]) => ({ code, description }));

  selectedFairyType = signal<string | null>(null);

  constructor() {
    this.selectedFairyType.set(this.data.originalPiece?.fairyCode?.[0]?.code ?? null);
  }
}
