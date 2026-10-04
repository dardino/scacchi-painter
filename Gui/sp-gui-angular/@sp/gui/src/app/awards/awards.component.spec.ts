import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { AwardsComponent } from "./awards.component";

describe("AwardsComponent", () => {
  let component: AwardsComponent;
  let fixture: ComponentFixture<AwardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AwardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render without crashing", () => {
    expect(fixture.nativeElement.textContent).toContain("Awards");
  });
});
