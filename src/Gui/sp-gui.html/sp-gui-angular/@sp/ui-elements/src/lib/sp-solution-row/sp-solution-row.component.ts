import { Component, Input } from "@angular/core";
import type { HalfMoveInfo } from "@dardino-chess/core";

@Component({
    selector: "lib-sp-solution-row",
    templateUrl: "./sp-solution-row.component.html",
    styleUrls: ["./sp-solution-row.component.less"],
    standalone: true,
})
export class SpSolutionRowComponent {
  @Input()
  value: HalfMoveInfo;

  @Input()
  hideNum: boolean;

  get numText() {
    return [
      this.value.num,
      this.value.part === "l" ? ".": "..."
    ].join("");
  }

  get moveText() {
    return [
      this.value.piece === "P" ? "" : this.value.piece,
      this.value.from,
      this.value.type,
      this.value.to,
      this.value.isPromotion ? "=" : "",
      this.value.promotedPiece,
      this.value.extraMoves.join(""),
      this.value.isCheck ? "+" : "",
      this.value.isCheckMate ? "#" : "",
      this.value.isStaleMate ? "=" : "",
      this.value.isTry ? "?" : "",
      this.value.refutes ? "!" : "",
    ].join("");
  }
}
