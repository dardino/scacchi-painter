import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { BoardCellComponent } from "./board-cell/board-cell.component";
import { ChessboardComponent } from "./chessboard.component";

describe("ChessboardComponent", () => {
  let component: ChessboardComponent;
  let fixture: ComponentFixture<ChessboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChessboardComponent, BoardCellComponent],
      imports: [CommonModule, DragDropModule],
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
});
