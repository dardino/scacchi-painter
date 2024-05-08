import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { PieceSelectorComponent } from "./piece-selector.component";

describe("PieceSelectorComponent", () => {
  let component: PieceSelectorComponent;
  let fixture: ComponentFixture<PieceSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, DragDropModule],
      declarations: [PieceSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
