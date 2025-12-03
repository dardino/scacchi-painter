import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { RouterModule } from "@angular/router";
import { DatabaseListItemComponent } from "./database-list-item.component";

describe("DatabaseListItemComponent", () => {
  let component: DatabaseListItemComponent;
  let fixture: ComponentFixture<DatabaseListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatabaseListItemComponent, RouterModule.forRoot([])]
    });
    fixture = TestBed.createComponent(DatabaseListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
