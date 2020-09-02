import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TwinDialogComponent } from "./twin-dialog.component";

describe("TwinDialogComponent", () => {
  let component: TwinDialogComponent;
  let fixture: ComponentFixture<TwinDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TwinDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwinDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
