import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { TwinTypes } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "app-database-list-item",
  templateUrl: "./database-list-item.component.html",
  styleUrls: ["./database-list-item.component.less"]
})
export class DatabaseListItemComponent {
  @Input() problem: Problem;
  @Input() dbIndex: number;

  @Output() delete = new EventEmitter<number>(true);

  get hasTwins() {
    const twinsNoDiagram = this.problem?.twins?.TwinList.filter(twin => twin.TwinType !== TwinTypes.Diagram) ?? [];
    return !!twinsNoDiagram.length;
  }
  get twins() {
    const twinsNoDiagram = this.problem?.twins?.TwinList.filter(twin => twin.TwinType !== TwinTypes.Diagram) ?? [];
    if (!twinsNoDiagram.length) return [];
    return [Twin.DIAGRAM].concat(twinsNoDiagram).map((twin, index) => `${index+1}) ${twin.toString()}`);
  }
  get authors() {
    return this.problem?.authors.map((author) => author.nameAndSurname).join(", ");
  }
  get stipulation() {
    return `${this.problem?.stipulation.completeStipulationDesc}`;
  }
  get pieceCounter() {
    return `${this.problem?.getPieceCounter() ?? "0+0"}`;
  }

  removeItem() {
    this.delete.emit(this.dbIndex);
  }
}
