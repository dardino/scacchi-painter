import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DatabaseListItemComponent } from "./database-list-item.component";

describe("DatabaseListItemComponent", () => {
  let component: DatabaseListItemComponent;
  let fixture: ComponentFixture<DatabaseListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
