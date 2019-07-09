import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CbsComponent } from "../cbs/cbs.component";
import { ChessboardComponent } from "./chessboard.component";

describe("ChessboardComponent", () => {
  let component: ChessboardComponent;
  let fixture: ComponentFixture<ChessboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CbsComponent, ChessboardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChessboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("cells bust be 64", () => {
    expect(component.cells.length).toBe(64);
  });
});
