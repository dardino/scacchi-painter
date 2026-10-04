import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { DatabaseListItemComponent } from "@sp/ui-elements/src/lib/database-list-item/database-list-item.component";

export interface ProblemComparisonDialogData {
  problems: [Problem, Problem];
}

@Component({
  selector: "lib-problem-comparison-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, DatabaseListItemComponent],
  styleUrl: "./problem-comparison-dialog.component.scss",
  templateUrl: "./problem-comparison-dialog.component.html",
})
export class ProblemComparisonDialogComponent {
  private dialogRef = inject(MatDialogRef<ProblemComparisonDialogComponent, string | null>);
  readonly data = inject<ProblemComparisonDialogData>(MAT_DIALOG_DATA);

  orderedProblems = signal<[Problem, Problem]>([...this.data.problems]);
  topProblem = computed(() => this.orderedProblems()[0]);
  bottomProblem = computed(() => this.orderedProblems()[1]);

  swap() {
    const [top, bottom] = this.orderedProblems();
    this.orderedProblems.set([bottom, top]);
  }

  confirm() {
    this.dialogRef.close(this.topProblem()?.uuid ?? null);
  }

  breakComparison() {
    this.dialogRef.close(null);
  }
}
