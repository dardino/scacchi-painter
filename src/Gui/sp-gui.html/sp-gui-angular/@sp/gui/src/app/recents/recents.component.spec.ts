import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RecentsComponent } from "./recents.component";

describe("RecentsComponent", () => {
  let component: RecentsComponent;
  let fixture: ComponentFixture<RecentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
