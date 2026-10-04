import { DatePipe } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { ActivatedRoute } from "@angular/router";
import { Awards, AwardsProblem, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-award-detail",
  standalone: true,
  imports: [DatePipe, MatCardModule],
  styleUrl: "./award-detail.component.scss",
  templateUrl: "./award-detail.component.html",
})
export class AwardDetailComponent {
  private db = inject(DbmanagerService);
  private route = inject(ActivatedRoute);
  private modal = inject(DialogService);

  readonly award = computed<Awards | null>(() => {
    const rawId = this.route.snapshot.paramMap.get("id");
    const index = rawId == null ? NaN : Number(rawId);
    const awards = this.db.Awards();

    if (Number.isNaN(index) || index < 0 || index >= awards.length) {
      return null;
    }

    return awards[index] ?? null;
  });

  pendingProblems() {
    const allProblems = this.db.All().map(problem => problem.uuid);
    const alreadyInAward = this.db.Awards().flatMap(award => award.awardsProblems.map(problem => problem.problemID));
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
        const excludedProblem: AwardsProblem = { problemID: problem.uuid, rankInAward: -1 };

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
}
