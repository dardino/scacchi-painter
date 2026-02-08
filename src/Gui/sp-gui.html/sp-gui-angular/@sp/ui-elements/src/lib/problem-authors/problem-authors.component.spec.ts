import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { AuthorCardComponent } from "../author-card/author-card.component";
import { ProblemAuthorsComponent } from "./problem-authors.component";

describe("ProblemAuthorsComponent", () => {
  let component: ProblemAuthorsComponent;
  let fixture: ComponentFixture<ProblemAuthorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProblemAuthorsComponent, AuthorCardComponent],
    });
    fixture = TestBed.createComponent(ProblemAuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
