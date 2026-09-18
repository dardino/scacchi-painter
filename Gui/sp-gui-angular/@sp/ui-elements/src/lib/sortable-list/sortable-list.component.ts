import { DragDropModule } from "@angular/cdk/drag-drop";

import { Component, EventEmitter, input, Input, Output } from "@angular/core";
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
  elements = input<T[]>([]);

  @Input()
  isDragDisabledForItem?: (item: T) => boolean;

  canBeDeleted = input<(item: T) => boolean>(() => false);

  @Output()
  deleteItem = new EventEmitter<T>();
}
