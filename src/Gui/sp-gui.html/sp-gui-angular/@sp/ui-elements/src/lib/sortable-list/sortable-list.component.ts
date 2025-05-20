import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";

@Component({
  selector: "lib-sortable-list",
  templateUrl: "./sortable-list.component.html",
  styleUrls: ["./sortable-list.component.less"],
  imports: [
    MatListModule,
    CommonModule,
    DragDropModule,
    MatIconModule
  ],
  standalone: true
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
