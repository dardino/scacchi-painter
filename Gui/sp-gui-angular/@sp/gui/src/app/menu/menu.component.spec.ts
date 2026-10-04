import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RouterModule } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { beforeEach, describe, expect, it } from "vitest";
import { MenuComponent } from "./menu.component";

describe("MenuComponent", () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MenuComponent, RouterModule.forRoot([])],
    });
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should hide the award menu until a database is loaded", () => {
    const db = TestBed.inject(DbmanagerService);

    expect(fixture.nativeElement.textContent).not.toContain("Awards");

    db.SetData([{} as never]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Awards");
  });
});
