import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AuthorCardComponent } from "../author-card/author-card.component";
import { ProblemAuthorsComponent } from "../problem-authors/problem-authors.component";
import { ProblemDefinitionsComponent } from "../problem-definitions/problem-definitions.component";
import { ProblemPublicationComponent } from "../problem-publication/problem-publication.component";
import { SortableListComponent } from "../sortable-list/sortable-list.component";
import { ProblemInfoComponent } from "./problem-info.component";

describe("ProblemInfoComponent", () => {
  let component: ProblemInfoComponent;
  let fixture: ComponentFixture<ProblemInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProblemInfoComponent,
        ProblemPublicationComponent,
        ProblemAuthorsComponent,
        ProblemDefinitionsComponent,
        SortableListComponent,
        AuthorCardComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
