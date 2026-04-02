import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { ToolbarPieceComponent } from "./toolbar-piece.component";

describe("ToolbarPieceComponent", () => {
  let component: ToolbarPieceComponent;
  let fixture: ComponentFixture<ToolbarPieceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToolbarPieceComponent],
    });
    fixture = TestBed.createComponent(ToolbarPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
