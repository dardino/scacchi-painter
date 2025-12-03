import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { RouterModule } from "@angular/router";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { OpenFileComponent } from "../open-file/open-file.component";
import { DatabaseListComponent } from "./database-list.component";

describe("DatabaseListComponent", () => {
  let component: DatabaseListComponent;
  let fixture: ComponentFixture<DatabaseListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DatabaseListComponent,
        RouterModule.forRoot(
          [{ path: 'openfile', component: OpenFileComponent }]
        )
      ],
      providers: [AllMatIconRegistryService]
    });
    fixture = TestBed.createComponent(DatabaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
