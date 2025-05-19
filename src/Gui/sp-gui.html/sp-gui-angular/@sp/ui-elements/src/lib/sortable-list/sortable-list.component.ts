import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "lib-sortable-list",
    templateUrl: "./sortable-list.component.html",
    styleUrls: ["./sortable-list.component.less"],
    standalone: false
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
