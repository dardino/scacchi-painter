import { TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { MsalAuthService } from "@sp/dbmanager/src/lib/oauth_providers/onedrive.cli";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppComponent } from "./app.component";

const msalAuthServiceMock = {
  initialize: vi.fn().mockResolvedValue(undefined),
  handleRedirect: vi.fn(),
  login: vi.fn(),
  getToken: vi.fn().mockResolvedValue(null),
};

describe("AppComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterModule.forRoot([]),
      ],
      providers: [
        AllMatIconRegistryService,
        { provide: MsalAuthService, useValue: msalAuthServiceMock },
      ],
    });
  });

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
