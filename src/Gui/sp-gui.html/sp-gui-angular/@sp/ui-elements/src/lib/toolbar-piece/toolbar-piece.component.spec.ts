import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { ToolbarPieceComponent } from "./toolbar-piece.component";

describe("ToolbarPieceComponent", () => {
  let component: ToolbarPieceComponent;
  let fixture: ComponentFixture<ToolbarPieceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarPieceComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
