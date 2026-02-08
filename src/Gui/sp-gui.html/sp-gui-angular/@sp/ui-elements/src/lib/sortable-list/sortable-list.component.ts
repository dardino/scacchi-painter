import { DragDropModule } from "@angular/cdk/drag-drop";

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";

@Component({
  selector: "lib-sortable-list",
  templateUrl: "./sortable-list.component.html",
  styleUrls: ["./sortable-list.component.scss"],
  imports: [
    MatListModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
  ],
  standalone: true,
})
export class SortableListComponent<T extends { toString: () => string }> {
  @Input()
  elements: T[];

  @Input()
  isDragDisabledForItem?: (item: T) => boolean;

  @Input()
  canBeDeleted?: (item: T) => boolean;

  @Output()
  deleteItem = new EventEmitter<T>();
}
