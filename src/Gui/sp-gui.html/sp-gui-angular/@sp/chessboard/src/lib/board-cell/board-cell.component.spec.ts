import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { BoardCellComponent } from "./board-cell.component";

describe("BoardCellComponent", () => {
  let component: BoardCellComponent;
  let fixture: ComponentFixture<BoardCellComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, DragDropModule],
      declarations: [ BoardCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
