import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { PieceSelectorComponent } from "./piece-selector.component";

describe("PieceSelectorComponent", () => {
  let component: PieceSelectorComponent;
  let fixture: ComponentFixture<PieceSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PieceSelectorComponent, CommonModule, DragDropModule],
    });
    fixture = TestBed.createComponent(PieceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
