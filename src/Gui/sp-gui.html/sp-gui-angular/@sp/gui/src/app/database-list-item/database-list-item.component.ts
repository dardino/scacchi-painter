import { Component, EventEmitter, Output, computed, input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { ChessboardModule } from "@sp/chessboard/src/public-api";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";

@Component({
  selector: "app-database-list-item",
  templateUrl: "./database-list-item.component.html",
  styleUrls: ["./database-list-item.component.scss"],
  standalone: true,
  imports: [
    ChessboardModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
  ],
})
export class DatabaseListItemComponent {
  problem = input<Problem>(null!);
  dbIndex = input<number>(0);

  @Output() delete = new EventEmitter<number>(true);

  hasTwins = computed(() => {
    const twinsNoDiagram = this.problem()?.twins?.TwinList.filter(twin => twin.TwinType !== "Diagram") ?? [];
    return !!twinsNoDiagram.length;
  });

  twins = computed(() => {
    const twinsNoDiagram = this.problem()?.twins?.TwinList.filter(twin => twin.TwinType !== "Diagram") ?? [];
    if (!twinsNoDiagram.length) return [];
    return [Twin.DIAGRAM].concat(twinsNoDiagram).map((twin, index) => `${index + 1}) ${twin.toString()}`);
  });

  hasAuthors = computed(() => (this.problem()?.authors?.length ?? 0) > 0);
  hasCondition = computed(() => (this.problem()?.conditions?.length ?? 0) > 0);
  conditions = computed(() => this.problem()?.conditions ?? []);
  authors = computed(() => this.problem()?.authors.map(author => author.nameAndSurname).join(", "));
  stipulation = computed(() => `${this.problem()?.stipulation.completeStipulationDesc}`);
  pieceCounter = computed(() => `${this.problem()?.getPieceCounter() ?? "0+0"}`);
  solutionHTML = computed(() => this.problem()?.htmlSolution);

  removeItem() {
    this.delete.emit(this.dbIndex());
  }
}
