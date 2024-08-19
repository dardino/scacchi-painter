import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RouterModule } from "@angular/router";
import { ThirdPartyModules } from "../modules";
import { OpenFileComponent } from "../open-file/open-file.component";
import { AllMatIconRegistry } from "../registerIcons";
import { DatabaseListComponent } from "./database-list.component";

describe("DatabaseListComponent", () => {
  let component: DatabaseListComponent;
  let fixture: ComponentFixture<DatabaseListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatabaseListComponent, OpenFileComponent],
      imports: [
        ...ThirdPartyModules,
        RouterModule.forRoot(
          [{ path: 'openfile', component: OpenFileComponent }]
        )
      ],
      providers: [AllMatIconRegistry]
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
