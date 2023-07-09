import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterTestingModule } from "@angular/router/testing";
import { OpenFileComponent } from "../open-file/open-file.component";
import { DatabaseListComponent } from "./database-list.component";

describe("DatabaseListComponent", () => {
  let component: DatabaseListComponent;
  let fixture: ComponentFixture<DatabaseListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatabaseListComponent, OpenFileComponent],
      imports: [
        MatSnackBarModule,
        RouterTestingModule.withRoutes([
          { path: "openfile", component: OpenFileComponent },
        ]),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
