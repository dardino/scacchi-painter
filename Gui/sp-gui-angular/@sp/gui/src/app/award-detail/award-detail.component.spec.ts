import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { Awards, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { AwardDetailComponent } from "./award-detail.component";

type AwardList = Array<Awards>;

describe("AwardDetailComponent", () => {
  let component: AwardDetailComponent;
  let fixture: ComponentFixture<AwardDetailComponent>;
  let recordedAwards: Mock<(next: AwardList) => AwardList>;
  let saveTemporary: ReturnType<typeof vi.fn>;
  let decisionResult: { action: "include" | "exclude" | "skip" | "interrupt" };
  let awards: AwardList;
  let problem: Problem;

  beforeEach(async () => {
    recordedAwards = vi.fn((next: AwardList) => next);
    saveTemporary = vi.fn().mockResolvedValue(undefined);
    decisionResult = { action: "include" };
    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [],
    }];
    problem = Problem.fromJson({
      uuid: "p-123-0000-0000-0000-0000",
      stipulation: { completeStipulationDesc: "Mate in 1" },
      personalID: "ID-1",
      date: "2024-01-01",
      pieces: [],
      authors: [],
    });

    await TestBed.configureTestingModule({
      imports: [AwardDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => "0" } },
          },
        },
        {
          provide: DialogService,
          useValue: {
            awardProblemDecisionDialog: () => of(decisionResult),
          },
        },
        {
          provide: DbmanagerService,
          useValue: {
            Awards: () => awards,
            All: () => [problem],
            CurrentProblem: () => null,
            SetAwards: (next: typeof awards) => {
              awards.splice(0, awards.length, ...next);
              recordedAwards(next);
            },
            SaveTemporary: saveTemporary,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    await component.processPendingProblems();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should add the pending problem to the current verdict after confirmation", async () => {
    await Promise.resolve();

    expect(recordedAwards).toHaveBeenCalled();
    const awards = recordedAwards.mock.calls[0][0];
    expect(awards[0].awardsProblems).toContainEqual({ problemID: "p-123-0000-0000-0000-0000", rankInAward: -1 });
    expect(saveTemporary).toHaveBeenCalled();
  });

  it("should render the assigned problems in the verdict detail view", async () => {
    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [{ problemID: "p-123-0000-0000-0000-0000", rankInAward: 1, awarded: true }],
    }];

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("Mate in 1");
    expect(fixture.nativeElement.textContent).toContain("Award Details");
  });

  it("should skip the current problem without adding it to any verdict", async () => {
    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [],
    }];
    decisionResult = { action: "skip" };
    recordedAwards.mockClear();
    saveTemporary.mockClear();

    await component.processPendingProblems();

    expect(recordedAwards).not.toHaveBeenCalled();
    expect(saveTemporary).not.toHaveBeenCalled();
    expect(awards[0].awardsProblems).toEqual([]);
  });
});
