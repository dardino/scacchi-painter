import { TestBed, waitForAsync } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { ThirdPartyModules } from "./modules";
import { AllMatIconRegistry } from "./registerIcons";

describe("AppComponent", () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ...ThirdPartyModules,
        RouterModule.forRoot([])
      ],
      declarations: [
        AppComponent
      ],
      providers: [AllMatIconRegistry]
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Scacchi Painter'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual("Scacchi Painter");
  });

});
