import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { AwardDetailComponent } from "./award-detail.component";

describe("AwardDetailComponent", () => {
  let component: AwardDetailComponent;
  let fixture: ComponentFixture<AwardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwardDetailComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
