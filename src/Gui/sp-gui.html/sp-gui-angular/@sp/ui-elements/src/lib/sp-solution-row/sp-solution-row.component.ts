import { Component, Input } from "@angular/core";

@Component({
    selector: "lib-sp-solution-row",
    templateUrl: "./sp-solution-row.component.html",
    styleUrls: ["./sp-solution-row.component.less"],
    standalone: false
})
export class SpSolutionRowComponent {
  @Input()
  value: string;

}
