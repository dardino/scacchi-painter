import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { FileExplorerComponent } from "./file-explorer.component";

describe("FileExplorerComponent", () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileExplorerComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
