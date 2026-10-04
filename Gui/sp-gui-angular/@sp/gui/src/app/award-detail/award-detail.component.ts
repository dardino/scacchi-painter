import { DatePipe } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { ActivatedRoute } from "@angular/router";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { Awards, AwardsProblem, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DatabaseListItemComponent } from "@sp/ui-elements/src/lib/database-list-item/database-list-item.component";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-award-detail",
  standalone: true,
  imports: [DatePipe, MatCardModule, DatabaseListItemComponent],
  styleUrl: "./award-detail.component.scss",
  templateUrl: "./award-detail.component.html",
})
export class AwardDetailComponent {
  private db = inject(DbmanagerService);
  private route = inject(ActivatedRoute);
  private modal = inject(DialogService);
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

  async startOrderingViaPairwise() {
    const problems = this.awardProblems().map(problemRef => problemRef.problem);
    if (problems.length < 2) {
      return;
    }

    const [firstProblem, secondProblem] = problems as [Problem, Problem];
    const winnerUuid = await firstValueFrom(this.modal.problemComparisonDialog([firstProblem, secondProblem]));

    if (winnerUuid === null) {
      return;
    }

    return winnerUuid;
  }
}
