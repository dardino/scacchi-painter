import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Output, computed, input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { ChessboardModule } from "@sp/chessboard/src/public-api";
import { Problem } from "@sp/dbmanager/src/lib/models";

export type HideActions = {
  delete: boolean;
  edit: boolean;
};

@Component({
  selector: "lib-database-list-item",
  templateUrl: "./database-list-item.component.html",
  styleUrls: ["./database-list-item.component.scss"],
  standalone: true,
  imports: [
    DatePipe,
    ChessboardModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
  ],
})
export class DatabaseListItemComponent {
  problem = input<Problem>(null!);
  dbIndex = input<number>(0);
  hideActions = input<HideActions>({ delete: false, edit: false });

  @Output() delete = new EventEmitter<number>(true);

  isDeleteHidden = computed(() => this.hideActions().delete);
  isEditHidden = computed(() => this.hideActions().edit);

  hasTwins = computed(() => {
    const twins = this.problem()?.twins;
    const twinsNoDiagram = twins?.TwinList?.filter(twin => twin.TwinType !== "Diagram") ?? [];
    return !!twinsNoDiagram.length;
  });

  hasZeroPosition = computed(() => this.problem()?.twins?.HasZeroPosition ?? false);
  twins = computed(() => {
    const problemTwins = this.problem()?.twins;
    if (!problemTwins?.TwinList) {
      return [];
    }
    // If the only one twin is a diagram then return an empty array (Diagram is implicit)
    if (problemTwins.HasDiagram && problemTwins.TwinList.length === 1) return [];
    return problemTwins.TwinList.map(twin => `${twin?.toString?.() ?? ""}`);
  });

  hasAuthors = computed(() => (this.problem()?.authors?.length ?? 0) > 0);
  hasCondition = computed(() => (this.problem()?.conditions?.length ?? 0) > 0);
  conditions = computed(() => this.problem()?.conditions ?? []);
  authors = computed(() => this.problem()?.authors?.map(author => author.nameAndSurname).join(", ") ?? "");
  stipulation = computed(() => `${this.problem()?.stipulation?.completeStipulationDesc ?? ""}`);

  pieceCounter = computed(() => {
    const problem = this.problem();
    return typeof problem?.getPieceCounter === "function" ? `${problem.getPieceCounter()}` : "0+0";
  });

  solutionHTML = computed(() => this.problem()?.htmlSolution);
  date = computed(() => new Date(this.problem()?.date ?? "1970-01-01T00:00:00.000Z"));
  personalID = computed(() => this.problem()?.personalID ?? "");
  kingPosition = computed(() => this.problem()?.kingPositions ?? "");

  removeItem() {
    this.delete.emit(this.dbIndex());
  }
}
