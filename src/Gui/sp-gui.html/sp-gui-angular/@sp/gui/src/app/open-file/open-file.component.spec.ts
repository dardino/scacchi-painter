import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { OpenFileComponent } from "./open-file.component";

describe("OpenfileComponent", () => {
  let component: OpenFileComponent;
  let fixture: ComponentFixture<OpenFileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
