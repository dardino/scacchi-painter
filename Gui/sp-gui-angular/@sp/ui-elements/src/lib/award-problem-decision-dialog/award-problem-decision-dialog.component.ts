import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { ChessboardModule } from "@sp/chessboard/src/public-api";
import { Problem } from "@sp/dbmanager/src/lib/models";

export interface AwardProblemDecisionData {
  problem: Problem;
}

export type AwardProblemDecisionAction = "include" | "exclude" | "skip" | "interrupt";

export interface AwardProblemDecisionResult {
  action: AwardProblemDecisionAction;
}

@Component({
  selector: "lib-award-problem-decision-dialog",
  standalone: true,
  imports: [CommonModule, ChessboardModule, MatDialogModule, MatButtonModule],
  styleUrl: "./award-problem-decision-dialog.component.scss",
  templateUrl: "./award-problem-decision-dialog.component.html",
})
export class AwardProblemDecisionDialogComponent {
  private dialogRef = inject(MatDialogRef<AwardProblemDecisionDialogComponent, AwardProblemDecisionResult | null>);
  readonly data = inject<AwardProblemDecisionData>(MAT_DIALOG_DATA);

  get problem() {
    return this.data.problem;
  }

  choose(action: AwardProblemDecisionAction) {
    this.dialogRef.close({ action } satisfies AwardProblemDecisionResult);
  }
}
