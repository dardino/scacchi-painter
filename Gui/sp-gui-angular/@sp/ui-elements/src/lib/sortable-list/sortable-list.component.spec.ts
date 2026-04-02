/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { SortableListComponent } from "./sortable-list.component";

describe("SortableListComponent", () => {
  let component: SortableListComponent<any>;
  let fixture: ComponentFixture<SortableListComponent<any>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SortableListComponent],
    });
    fixture = TestBed.createComponent(SortableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
