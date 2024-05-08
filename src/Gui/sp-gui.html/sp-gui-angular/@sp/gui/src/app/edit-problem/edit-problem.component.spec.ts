import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RouterModule } from "@angular/router";
import { ThirdPartyModules } from "../modules";
import { EditProblemComponent } from "./edit-problem.component";

describe("EditProblemComponent", () => {
  let component: EditProblemComponent;
  let fixture: ComponentFixture<EditProblemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [...ThirdPartyModules, RouterModule.forRoot([])],
      declarations: [ EditProblemComponent ],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
