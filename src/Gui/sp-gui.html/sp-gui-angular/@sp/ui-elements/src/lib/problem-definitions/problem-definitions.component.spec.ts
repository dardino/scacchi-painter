import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { SortableListComponent } from "../sortable-list/sortable-list.component";
import { ThirdPartyImports } from "../thirdPartyImports";
import { ProblemDefinitionsComponent } from "./problem-definitions.component";

describe("ProblemDefinitionsComponent", () => {
  let component: ProblemDefinitionsComponent;
  let fixture: ComponentFixture<ProblemDefinitionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemDefinitionsComponent, SortableListComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemDefinitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
