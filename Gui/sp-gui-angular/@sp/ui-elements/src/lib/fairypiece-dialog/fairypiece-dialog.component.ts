import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FairyPieceAttributesDB, FairyPiecesCodes, FairyPiecesDB } from "@sp/dbmanager/src/lib/models/fairesDB";
import { IPieceV4 } from "@sp/dbmanager/src/lib/SPX.v4";
import { SquareLocation } from "@sp/dbmanager/src/public-api";

export interface FairypieceDialogInput {
  cell: SquareLocation;
  originalPiece: IPieceV4 | null;
}
export type FairypieceDialogResponse = {
  updatedPiece: IPieceV4 | null;
  cell: SquareLocation;
  originalPiece: IPieceV4 | null;
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

  allFairyTypes = Object.entries(FairyPiecesDB).map(([code, description]) => ({ code, description }));
  allFairyAttributes = FairyPieceAttributesDB;

  selectedFairyCode = signal<FairyPiecesCodes | null>(null);
  selectedFairyAttribute = signal<string | null>(null);

  constructor() {
    this.selectedFairyCode.set(this.data.originalPiece?.fairyCode ?? null);
    this.selectedFairyAttribute.set(this.data.originalPiece?.fairyAttributes?.[0] ?? null);
  }

  getUpdatedPiece(mode: "apply" | "remove"): FairypieceDialogResponse {
    const selectedFairyCode = mode === "apply" ? this.selectedFairyCode() : null;
    const selectedFairyAttribute = mode === "apply" ? this.selectedFairyAttribute() : null;
    const fairyCode = selectedFairyCode ?? null;
    return {
      updatedPiece: {
        // default values for a new piece
        appearance: "q",
        color: "White",
        column: this.data.cell.column,
        rotation: "UpsideDown",
        traverse: this.data.cell.traverse,
        // spread the original piece properties after the default values to override them if they exist
        ...this.data.originalPiece,
        // apply the selected fairy piece attributes and codes
        fairyAttributes: selectedFairyAttribute ? [selectedFairyAttribute] : [],
        fairyCode: fairyCode,
        fairyParams: [],
      } satisfies IPieceV4,
      cell: this.data.cell,
      originalPiece: this.data.originalPiece,
    };
  }
}
