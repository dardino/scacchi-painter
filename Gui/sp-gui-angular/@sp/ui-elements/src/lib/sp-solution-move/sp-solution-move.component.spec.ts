import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { SpSolutionMoveComponent } from "./sp-solution-move.component";
import { HalfMoveInfo } from "@dardino-chess/core";

describe("SpSolutionMoveComponent", () => {
  let component: SpSolutionMoveComponent;
  let fixture: ComponentFixture<SpSolutionMoveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpSolutionMoveComponent],
    });
    fixture = TestBed.createComponent(SpSolutionMoveComponent);
    component = fixture.componentInstance;
    // Initialize required input property
    component.value = {
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
    } as HalfMoveInfo;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
