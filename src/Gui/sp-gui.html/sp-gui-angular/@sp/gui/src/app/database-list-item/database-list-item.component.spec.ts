import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RouterModule } from "@angular/router";
import { ThirdPartyModules } from "../modules";
import { DatabaseListItemComponent } from "./database-list-item.component";

describe("DatabaseListItemComponent", () => {
  let component: DatabaseListItemComponent;
  let fixture: ComponentFixture<DatabaseListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...ThirdPartyModules, RouterModule.forRoot([])],
      declarations: [DatabaseListItemComponent]
    });
    fixture = TestBed.createComponent(DatabaseListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
