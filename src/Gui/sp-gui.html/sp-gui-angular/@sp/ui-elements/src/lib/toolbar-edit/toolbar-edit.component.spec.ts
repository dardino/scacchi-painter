import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AllMatIconRegistryService } from "../registerIcons";
import { SpToolbarButtonComponent } from "../sp-toolbar-button/sp-toolbar-button.component";
import { ThirdPartyImports } from "../thirdPartyImports";
import { ToolbarEditComponent } from "./toolbar-edit.component";

describe("EditToolbarComponent", () => {
  let component: ToolbarEditComponent;
  let fixture: ComponentFixture<ToolbarEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarEditComponent, SpToolbarButtonComponent],
      imports:[
        ...ThirdPartyImports
      ],
      providers: [AllMatIconRegistryService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
