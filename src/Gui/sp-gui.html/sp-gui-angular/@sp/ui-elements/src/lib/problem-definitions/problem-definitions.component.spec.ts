import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { SortableListComponent } from "../sortable-list/sortable-list.component";
import { ProblemDefinitionsComponent } from "./problem-definitions.component";

describe("ProblemDefinitionsComponent", () => {
  let component: ProblemDefinitionsComponent;
  let fixture: ComponentFixture<ProblemDefinitionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ProblemDefinitionsComponent, SortableListComponent ],
    });
    fixture = TestBed.createComponent(ProblemDefinitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
