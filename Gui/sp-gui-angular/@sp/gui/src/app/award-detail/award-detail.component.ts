import { DatePipe } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { Awards, AwardsProblem, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DatabaseListItemComponent } from "@sp/ui-elements/src/lib/database-list-item/database-list-item.component";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-award-detail",
  standalone: true,
  imports: [DatePipe, MatCardModule, DatabaseListItemComponent, MatProgressBarModule],
  styleUrl: "./award-detail.component.scss",
  templateUrl: "./award-detail.component.html",
})
export class AwardDetailComponent {
  private db = inject(DbmanagerService);
  private route = inject(ActivatedRoute);
  private modal = inject(DialogService);
  #toastService = inject(MatSnackBar);
  #allProblemsIds = computed(() => this.db.All().map(problem => problem.uuid));
  #alreadyInAwardIds = computed(() => this.db.Awards().flatMap(award => award.awardsProblems.map(problem => problem.problemID)));

  readonly award = computed<Awards | null>(() => {
    const rawId = this.route.snapshot.paramMap.get("id");
    const index = rawId == null ? NaN : Number(rawId);
    const awards = this.db.Awards();

    if (Number.isNaN(index) || index < 0 || index >= awards.length) {
      return null;
    }

    return awards[index] ?? null;
  });

  getAwardedStatus(problemRef: { problem: Problem; dbIndex: number }) {
    const award = this.award();
    if (!award) {
      return "Not awarded";
    }
    const match = award.awardsProblems.find(p => p.problemID === problemRef.problem.uuid);
    return match?.awarded ? "Awarded " + match.rankInAward : "Not awarded";
  }

  readonly awardProblems = computed(() => {
    const award = this.award();
    if (!award) {
      return [];
    }

    const problemsById = new Map(this.db.All().map((problem, index) => [
      problem.uuid, { problem, dbIndex: index + 1 },
    ]));
    const result = award.awardsProblems.flatMap((problemRef) => {
      const match = problemsById.get(problemRef.problemID);
      return match ? [match] : [];
    });
    return result;
  });

  removeFromAward(problemRef: { problem: Problem; dbIndex: number }) {
    const award = this.award();
    if (!award) {
      return;
    }
    const nextAwards = [...this.db.Awards()];
    const currentAwardIndex = nextAwards.findIndex(item => item === award);
    if (currentAwardIndex >= 0) {
      const currentAward = { ...nextAwards[currentAwardIndex] };
      currentAward.awardsProblems = currentAward.awardsProblems.filter(p => p.problemID !== problemRef.problem.uuid);
      nextAwards[currentAwardIndex] = currentAward;
      this.db.SetAwards(nextAwards);
      this.db.SaveTemporary();
    }
  }

  pendingProblems() {
    const allProblems = this.#allProblemsIds();
    const alreadyInAward = this.#alreadyInAwardIds();
    const pendingIDs = allProblems.filter(problemID => !alreadyInAward.includes(problemID));
    return this.db.All().filter(problem => pendingIDs.includes(problem.uuid)) ?? [];
  }

  async processPendingProblems() {
    const pending = this.pendingProblems();
    if (!pending || pending.length === 0) {
      return;
    }
    const award = this.award();
    if (!award) {
      return;
    }
    const currentAwardIndex = this.db.Awards().findIndex(item => item === award);
    const nextAwards = [...this.db.Awards()];
    let currentAward = currentAwardIndex >= 0 ? nextAwards[currentAwardIndex] : { ...award };
    let changed = false;

    for (const problem of pending) {
      const result = await firstValueFrom(this.modal.awardProblemDecisionDialog(problem));

      if (result?.action === "interrupt") {
        break;
      }

      if (result?.action === "skip") {
        continue;
      }

      if (result?.action === "include") {
        currentAward = {
          ...currentAward,
          awardsProblems: [...currentAward.awardsProblems, { problemID: problem.uuid, rankInAward: -1 } as AwardsProblem],
        };
        changed = true;
      }
      else {
        const excludedTitle = "Esclusi";
        const excludedAwardIndex = nextAwards.findIndex(item => item.awardsTitle === excludedTitle);
        const excludedProblem: AwardsProblem = {
          problemID: problem.uuid, rankInAward: -1, awarded: false };

        if (excludedAwardIndex >= 0) {
          nextAwards[excludedAwardIndex] = {
            ...nextAwards[excludedAwardIndex],
            awardsProblems: [...nextAwards[excludedAwardIndex].awardsProblems, excludedProblem],
          };
        }
        else {
          nextAwards.push({
            awardsTitle: excludedTitle,
            awardsDescription: "Problemi esclusi dal verdetto corrente",
            awardsDate: new Date().toISOString().slice(0, 10),
            awardsJudge: "Sistema",
            awardsProblems: [excludedProblem],
          });
        }
        changed = true;
      }
    }

    if (!changed) {
      return;
    }

    if (currentAwardIndex >= 0) {
      nextAwards[currentAwardIndex] = currentAward;
    }
    else {
      nextAwards.push(currentAward);
    }

    this.db.SetAwards(nextAwards);
    await this.db.SaveTemporary();
  }

  getOrderingProgress = computed(() => {
    const problems = this.award()?.awardsProblems ?? [];
    if (problems.length === 0) {
      return 0;
    }
    const awardedCount = problems.filter(problem => problem.awarded).length;
    return (awardedCount / problems.length) * 100;
  });

  async startOrderingViaPairwise() {
    const problems = this.award()?.awardsProblems ?? [];
    if (problems.length < 2) {
      return;
    }

    const firstUnawarded = problems.find(problem => !problem.awarded);
    if (!firstUnawarded) {
      this.#toastService.open("All problems have been awarded.", "Close", { duration: 3000 });
      return;
    }

    const firstProblem = this.db.All().find(problem => problem.uuid === firstUnawarded.problemID);
    if (!firstProblem) {
      this.#toastService.open("First problem not found.", "Close", { duration: 3000 });
      return;
    }

    const awardedProblems = problems
      .filter(problem => problem.awarded)
      .sort((a, b) => a.rankInAward - b.rankInAward);

    let low = 0;
    let high = awardedProblems.length - 1;

    if (awardedProblems.length > 0) {
      while (low <= high) {
        const mid = Math.ceil((low + high) / 2);
        const compared = awardedProblems[mid];
        const comparedProblem = this.db.All().find(problem => problem.uuid === compared?.problemID);
        if (!comparedProblem) {
          this.#toastService.open("Second problem not found.", "Close", { duration: 3000 });
          return;
        }

        const winnerUuid = await firstValueFrom(this.modal.problemComparisonDialog([firstProblem, comparedProblem]));
        if (winnerUuid === null) {
          return;
        }

        if (winnerUuid === firstProblem.uuid) {
          high = mid - 1;
        }
        else {
          low = mid + 1;
        }
      }
    }

    const award = this.award();
    if (!award) {
      return;
    }

    const nextAwards = [...this.db.Awards()];
    const awardIndex = nextAwards.findIndex(item => item === award);
    if (awardIndex < 0) {
      return;
    }

    const orderedRanked = [...awardedProblems];
    orderedRanked.splice(low, 0, { ...firstUnawarded, awarded: true, rankInAward: low + 1 });

    const remainingUnranked = problems
      .filter(problem => problem.problemID !== firstUnawarded.problemID && !problem.awarded)
      .map(problem => ({
        ...problem,
        awarded: false,
        rankInAward: -1,
      }));

    const updatedProblems = [
      ...orderedRanked.map((problem, index) => ({
        ...problem,
        rankInAward: index + 1,
        awarded: true,
      })),
      ...remainingUnranked,
    ];

    nextAwards[awardIndex] = {
      ...award,
      awardsProblems: updatedProblems,
    };

    this.db.SetAwards(nextAwards);
    await this.db.SaveTemporary();
  }
}
