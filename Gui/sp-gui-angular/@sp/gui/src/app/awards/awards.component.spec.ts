import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { beforeEach, describe, expect, it } from "vitest";

import { AwardsComponent } from "./awards.component";

describe("AwardsComponent", () => {
  let component: AwardsComponent;
  let fixture: ComponentFixture<AwardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwardsComponent],
      providers: [{
        provide: DbmanagerService,
        useValue: {
          Awards: signal([
            {
              awardsTitle: "Spring Tournament",
              awardsDescription: "Regional event",
              awardsDate: "2026-01-01",
              awardsJudge: "Judge A",
              awardsProblems: [],
            },
          ]),
        },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(AwardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the awards list from the DB", () => {
    expect(fixture.nativeElement.textContent).toContain("Spring Tournament");
  });
});
