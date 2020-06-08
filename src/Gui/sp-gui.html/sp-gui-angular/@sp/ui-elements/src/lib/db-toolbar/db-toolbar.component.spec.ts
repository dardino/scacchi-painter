import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DbToolbarComponent } from "./db-toolbar.component";

describe("ToolbarComponent", () => {
  let component: DbToolbarComponent;
  let fixture: ComponentFixture<DbToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DbToolbarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
