import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AuthorCardComponent } from "../author-card/author-card.component";
import { ThirdPartyImports } from "../thirdPartyImports";
import { ProblemAuthorsComponent } from "./problem-authors.component";

describe("ProblemAuthorsComponent", () => {
  let component: ProblemAuthorsComponent;
  let fixture: ComponentFixture<ProblemAuthorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemAuthorsComponent, AuthorCardComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemAuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
