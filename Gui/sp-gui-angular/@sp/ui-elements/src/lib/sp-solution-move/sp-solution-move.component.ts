import { Component, computed, input } from "@angular/core";
import type { HalfMoveInfo } from "@dardino-chess/core";

@Component({
  selector: "lib-sp-solution-move",
  templateUrl: "./sp-solution-move.component.html",
  styleUrls: ["./sp-solution-move.component.scss"],
  standalone: true,
})
export class SpSolutionMoveComponent {
  value = input<HalfMoveInfo>();

  hideNum = input<boolean>();

  refutes = input<boolean>();

  numText = computed(() => {
    return [
      this.value()?.num,
      this.value()?.part === "l" ? "." : "...",
    ].join("");
  });

  moveText = computed(() => {
    const value = this.value();
    if (!value) return "";
    if (value.isCastling) {
      return [
        value.castlingLength,
        value.isCheck ? "+" : "",
        value.extraMoves.slice(1).join(","), // remove the first extra move as it is intrinsically part of the castling notation
        value.isCheckMate ? "#" : "",
        value.isStaleMate ? "=" : "",
        value.isTry ? "?" : "",
        value.refutes ? "!" : "",
        value.isKey ? "!" : "",
      ].join("");
    };
    return [
      value.piece === "P" ? "" : value.piece,
      value.from,
      value.type,
      value.to,
      value.isPromotion ? "=" : "",
      value.promotedPiece,
      value.extraMoves.join(","),
      value.isCheck ? "+" : "",
      value.isCheckMate ? "#" : "",
      value.isStaleMate ? "=" : "",
      value.isTry ? "?" : "",
      value.refutes ? "!" : "",
      value.isKey ? "!" : "",
    ].join("");
  });
}
