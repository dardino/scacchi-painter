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
  let comparisonResult: string | null;
  let dialogService: {
    awardProblemDecisionDialog: ReturnType<typeof vi.fn>;
    problemComparisonDialog: ReturnType<typeof vi.fn>;
  };
  let awards: AwardList;
  let allProblems: Problem[];
  let problem: Problem;
  let otherProblem: Problem;
  let thirdProblem: Problem;

  beforeEach(async () => {
    recordedAwards = vi.fn((next: AwardList) => next);
    saveTemporary = vi.fn().mockResolvedValue(undefined);
    decisionResult = { action: "include" };
    comparisonResult = null;
    dialogService = {
      awardProblemDecisionDialog: vi.fn(() => of(decisionResult)),
      problemComparisonDialog: vi.fn(() => of(comparisonResult)),
    };
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
    otherProblem = Problem.fromJson({
      uuid: "p-456-0000-0000-0000-0000",
      stipulation: { completeStipulationDesc: "Mate in 2" },
      personalID: "ID-2",
      date: "2024-01-02",
      pieces: [],
      authors: [],
    });
    thirdProblem = Problem.fromJson({
      uuid: "p-789-0000-0000-0000-0000",
      stipulation: { completeStipulationDesc: "Mate in 3" },
      personalID: "ID-3",
      date: "2024-01-03",
      pieces: [],
      authors: [],
    });
    allProblems = [problem, otherProblem, thirdProblem];

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
          useValue: dialogService,
        },
        {
          provide: DbmanagerService,
          useValue: {
            Awards: () => awards,
            All: () => allProblems,
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

  it("should order the unranked problem before the first-ranked one when the second wins", async () => {
    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [
        { problemID: otherProblem.uuid, rankInAward: 1, awarded: true },
        { problemID: problem.uuid, rankInAward: -1, awarded: false },
      ],
    }];
    allProblems = [otherProblem, problem];
    comparisonResult = problem.uuid;

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const comparisonDialogSpy = vi.spyOn(component["modal"], "problemComparisonDialog").mockReturnValue(of(comparisonResult));

    await component.startOrderingViaPairwise();

    expect(comparisonDialogSpy).toHaveBeenCalledTimes(1);
    expect(awards[0].awardsProblems).toContainEqual({ problemID: problem.uuid, rankInAward: 1, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: otherProblem.uuid, rankInAward: 2, awarded: true });
  });

  it("should place the new problem between rank 1 and rank 2 when it beats the second but loses to the first", async () => {
    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [
        { problemID: problem.uuid, rankInAward: 1, awarded: true },
        { problemID: otherProblem.uuid, rankInAward: 2, awarded: true },
        { problemID: thirdProblem.uuid, rankInAward: -1, awarded: false },
      ],
    }];
    allProblems = [problem, otherProblem, thirdProblem];

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    let comparisonCalls = 0;
    const comparisonDialogSpy = vi.spyOn(component["modal"], "problemComparisonDialog").mockImplementation(() => {
      comparisonCalls += 1;
      if (comparisonCalls === 1) {
        return of(thirdProblem.uuid);
      }
      return of(problem.uuid);
    });

    await component.startOrderingViaPairwise();

    expect(comparisonDialogSpy).toHaveBeenCalledTimes(2);
    expect(awards[0].awardsProblems).toContainEqual({ problemID: problem.uuid, rankInAward: 1, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: thirdProblem.uuid, rankInAward: 2, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: otherProblem.uuid, rankInAward: 3, awarded: true });
  });

  it("should keep all problems when only one item is already ranked", async () => {
    const fourthProblem = Problem.fromJson({
      uuid: "p-4",
      stipulation: { completeStipulationDesc: "Mate in 4" },
      personalID: "ID-4",
      date: "2024-01-04",
      pieces: [],
      authors: [],
    });

    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [
        { problemID: problem.uuid, rankInAward: 1, awarded: true },
        { problemID: otherProblem.uuid, rankInAward: -1, awarded: false },
        { problemID: thirdProblem.uuid, rankInAward: -1, awarded: false },
        { problemID: fourthProblem.uuid, rankInAward: -1, awarded: false },
      ],
    }];
    allProblems = [problem, otherProblem, thirdProblem, fourthProblem];

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const comparisonDialogSpy = vi.spyOn(component["modal"], "problemComparisonDialog").mockReturnValue(of(problem.uuid));

    await component.startOrderingViaPairwise();

    expect(comparisonDialogSpy).toHaveBeenCalledTimes(1);
    expect(awards[0].awardsProblems).toHaveLength(4);
    expect(awards[0].awardsProblems).toContainEqual({ problemID: problem.uuid, rankInAward: 1, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: otherProblem.uuid, rankInAward: 2, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: thirdProblem.uuid, rankInAward: -1, awarded: false });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: fourthProblem.uuid, rankInAward: -1, awarded: false });
  });

  it("should assign rank 1 when the award has no already-ranked problems", async () => {
    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [
        { problemID: problem.uuid, rankInAward: -1, awarded: false },
        { problemID: otherProblem.uuid, rankInAward: -1, awarded: false },
      ],
    }];
    allProblems = [problem, otherProblem];

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const comparisonDialogSpy = vi.spyOn(component["modal"], "problemComparisonDialog").mockReturnValue(of(problem.uuid));

    await component.startOrderingViaPairwise();

    expect(comparisonDialogSpy).not.toHaveBeenCalled();
    expect(awards[0].awardsProblems).toHaveLength(2);
    expect(awards[0].awardsProblems).toContainEqual({ problemID: problem.uuid, rankInAward: 1, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: otherProblem.uuid, rankInAward: -1, awarded: false });
  });

  it("should place the new problem in second position among six ranked problems", async () => {
    const fourthProblem = Problem.fromJson({
      uuid: "p-4",
      stipulation: { completeStipulationDesc: "Mate in 4" },
      personalID: "ID-4",
      date: "2024-01-04",
      pieces: [],
      authors: [],
    });
    const fifthProblem = Problem.fromJson({
      uuid: "p-5",
      stipulation: { completeStipulationDesc: "Mate in 5" },
      personalID: "ID-5",
      date: "2024-01-05",
      pieces: [],
      authors: [],
    });
    const sixthProblem = Problem.fromJson({
      uuid: "p-6",
      stipulation: { completeStipulationDesc: "Mate in 6" },
      personalID: "ID-6",
      date: "2024-01-06",
      pieces: [],
      authors: [],
    });
    const newProblem = Problem.fromJson({
      uuid: "p-new",
      stipulation: { completeStipulationDesc: "Mate in 7" },
      personalID: "ID-NEW",
      date: "2024-01-07",
      pieces: [],
      authors: [],
    });

    awards = [{
      awardsTitle: "Spring",
      awardsDescription: "Test",
      awardsDate: "2024-01-01",
      awardsJudge: "Judge",
      awardsProblems: [
        { problemID: problem.uuid, rankInAward: 1, awarded: true },
        { problemID: otherProblem.uuid, rankInAward: 2, awarded: true },
        { problemID: thirdProblem.uuid, rankInAward: 3, awarded: true },
        { problemID: fourthProblem.uuid, rankInAward: 4, awarded: true },
        { problemID: fifthProblem.uuid, rankInAward: 5, awarded: true },
        { problemID: sixthProblem.uuid, rankInAward: 6, awarded: true },
        { problemID: newProblem.uuid, rankInAward: -1, awarded: false },
      ],
    }];
    allProblems = [problem, otherProblem, thirdProblem, fourthProblem, fifthProblem, sixthProblem, newProblem];

    fixture = TestBed.createComponent(AwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    let comparisonCalls = 0;
    const comparisonDialogSpy = vi.spyOn(component["modal"], "problemComparisonDialog").mockImplementation(() => {
      comparisonCalls += 1;
      if (comparisonCalls === 1) {
        return of(newProblem.uuid);
      }
      if (comparisonCalls === 2) {
        return of(newProblem.uuid);
      }
      return of(problem.uuid);
    });

    await component.startOrderingViaPairwise();

    expect(comparisonDialogSpy).toHaveBeenCalledTimes(3);
    expect(awards[0].awardsProblems).toContainEqual({ problemID: problem.uuid, rankInAward: 1, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: newProblem.uuid, rankInAward: 2, awarded: true });
    expect(awards[0].awardsProblems).toContainEqual({ problemID: otherProblem.uuid, rankInAward: 3, awarded: true });
  });
});
