import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { ThirdPartyImports } from "../thirdPartyImports";
import { DbsourceComponent } from "./dbsource.component";

describe("DbsourceComponent", () => {
  let component: DbsourceComponent;
  let fixture: ComponentFixture<DbsourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbsourceComponent, ...ThirdPartyImports],
    });
    fixture = TestBed.createComponent(DbsourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
