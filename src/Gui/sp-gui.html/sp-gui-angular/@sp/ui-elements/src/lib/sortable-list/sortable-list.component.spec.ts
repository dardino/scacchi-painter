import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { SortableListComponent } from "./sortable-list.component";

describe("SortableListComponent", () => {
  let component: SortableListComponent<any>;
  let fixture: ComponentFixture<SortableListComponent<any>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SortableListComponent],
      imports: [...ThirdPartyImports]
    });
    fixture = TestBed.createComponent(SortableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
