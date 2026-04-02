import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { AuthorCardComponent } from "../author-card/author-card.component";
import { ProblemAuthorsComponent } from "../problem-authors/problem-authors.component";
import { ProblemDefinitionsComponent } from "../problem-definitions/problem-definitions.component";
import { ProblemPublicationComponent } from "../problem-publication/problem-publication.component";
import { SortableListComponent } from "../sortable-list/sortable-list.component";
import { ProblemInfoComponent } from "./problem-info.component";

describe("ProblemInfoComponent", () => {
  let component: ProblemInfoComponent;
  let fixture: ComponentFixture<ProblemInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ProblemInfoComponent,
        ProblemPublicationComponent,
        ProblemAuthorsComponent,
        ProblemDefinitionsComponent,
        SortableListComponent,
        AuthorCardComponent,
      ],
    });
    fixture = TestBed.createComponent(ProblemInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
