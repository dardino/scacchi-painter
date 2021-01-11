import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { TwinDialogComponent } from "./twin-dialog.component";

describe("TwinDialogComponent", () => {
  let component: TwinDialogComponent;
  let fixture: ComponentFixture<TwinDialogComponent>;

  beforeEach(waitForAsync(() => {
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
