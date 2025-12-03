import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { BoardCellComponent } from "./board-cell.component";

describe("BoardCellComponent", () => {
  let component: BoardCellComponent;
  let fixture: ComponentFixture<BoardCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardCellComponent, CommonModule, DragDropModule],
    });
    fixture = TestBed.createComponent(BoardCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
