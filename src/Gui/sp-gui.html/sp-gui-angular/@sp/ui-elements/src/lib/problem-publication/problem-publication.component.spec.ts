import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { ProblemPublicationComponent } from "./problem-publication.component";

describe("ProblemPublicationComponent", () => {
  let component: ProblemPublicationComponent;
  let fixture: ComponentFixture<ProblemPublicationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemPublicationComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
