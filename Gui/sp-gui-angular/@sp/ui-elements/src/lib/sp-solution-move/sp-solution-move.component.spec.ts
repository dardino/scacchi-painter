import { ComponentFixture, TestBed } from "@angular/core/testing";

import { inputBinding } from "@angular/core";
import type { HalfMoveInfo } from "@dardino-chess/core";
import { beforeEach, describe, expect, it } from "vitest";
import { SpSolutionMoveComponent } from "./sp-solution-move.component";

describe("SpSolutionMoveComponent", () => {
  let component: SpSolutionMoveComponent;
  let fixture: ComponentFixture<SpSolutionMoveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpSolutionMoveComponent],
    });
    fixture = TestBed.createComponent(SpSolutionMoveComponent, {
      bindings: [
        inputBinding("value", () => ({
          num: 1,
          part: "l",
          piece: "K",
          from: "e1",
          type: "-",
          to: "e2",
          isPromotion: false,
          promotedPiece: "",
          extraMoves: [],
          isCheck: false,
          isCheckMate: false,
          isStaleMate: false,
          isTry: false,
          refutes: false,
          isKey: false,
          threat: false,
          zugzwang: false,
          color: "w",
          isCastling: false,
          castlingLength: "",
          fromTwin: "",
        } as HalfMoveInfo)),
      ],
    });
    component = fixture.componentInstance;
    // Initialize required input property
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
