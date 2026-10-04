import { DatePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Awards } from "@sp/dbmanager/src/lib/SPX.v5";

export interface VerdictDialogData {
  mode: "view" | "create" | "edit";
  award: Awards;
}

@Component({
  selector: "lib-verdict-dialog",
  templateUrl: "./verdict-dialog.component.html",
  styleUrl: "./verdict-dialog.component.scss",
  imports: [DatePipe, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  standalone: true,
})
export class VerdictDialogComponent {
  dialogRef = inject<MatDialogRef<VerdictDialogComponent, Awards | null>>(MatDialogRef);
  data = inject<VerdictDialogData>(MAT_DIALOG_DATA);

  readonly isCreateMode = this.data?.mode === "create";
  readonly isEditableMode = this.data?.mode === "create" || this.data?.mode === "edit";
  draft: Awards = {
    ...this.data?.award,
    awardsTitle: this.data?.award?.awardsTitle ?? "",
    awardsDescription: this.data?.award?.awardsDescription ?? "",
    awardsDate: this.data?.award?.awardsDate ?? new Date().toISOString().slice(0, 10),
    awardsJudge: this.data?.award?.awardsJudge ?? "",
    awardsProblems: [...(this.data?.award?.awardsProblems ?? [])],
  };

  close() {
    this.dialogRef.close(null);
  }

  save() {
    const award: Awards = {
      ...this.draft,
      awardsTitle: this.draft.awardsTitle.trim(),
      awardsDescription: this.draft.awardsDescription.trim(),
      awardsJudge: this.draft.awardsJudge.trim(),
      awardsDate: this.draft.awardsDate || new Date().toISOString().slice(0, 10),
      awardsProblems: [...(this.draft.awardsProblems ?? [])],
    };

    this.dialogRef.close(award);
  }
}
