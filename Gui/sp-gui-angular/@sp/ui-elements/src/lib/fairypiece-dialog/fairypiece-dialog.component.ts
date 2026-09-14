import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FairyPiecesCodes, FairyPiecesDB } from "@sp/dbmanager/src/lib/models/fairesDB";
import { IPiece } from "@sp/dbmanager/src/lib/SPX";
import { SquareLocation } from "@sp/dbmanager/src/public-api";

export interface FairypieceDialogInput {
  cell: SquareLocation;
  originalPiece: IPiece | null;
}
export type FairypieceDialogResponse = {
  updatedPiece: IPiece | null;
  cell: SquareLocation;
  originalPiece: IPiece | null;
} | null;

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

  selectedFairyType = signal<FairyPiecesCodes | null>(null);

  constructor() {
    this.selectedFairyType.set(this.data.originalPiece?.fairyCode?.[0]?.code ?? null);
  }

  getUpdatedPiece(): FairypieceDialogResponse {
    const selectedFairyType = this.selectedFairyType();
    if (!selectedFairyType) return null;
    return {
      updatedPiece: this.data.originalPiece
        ? {
            ...this.data.originalPiece,
            fairyCode: [{
              code: selectedFairyType, params: [],
            }],
          }
        : {
          fairyCode: [{ code: selectedFairyType, params: [] }],
          appearance: "q",
          color: "White",
          column: this.data.cell.column,
          fairyAttribute: "",
          rotation: "UpsideDown",
          traverse: this.data.cell.traverse,
        } satisfies IPiece,
      cell: this.data.cell,
      originalPiece: this.data.originalPiece,
    };
  }
}
