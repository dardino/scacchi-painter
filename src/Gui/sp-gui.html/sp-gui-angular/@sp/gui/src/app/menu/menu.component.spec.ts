import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AppRoutingModule } from "../app-routing.module";
import { ThirdPartyModules } from "../modules";
import { MenuComponent } from "./menu.component";

describe("MenuComponent", () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [...ThirdPartyModules, AppRoutingModule],
      declarations: [ MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
