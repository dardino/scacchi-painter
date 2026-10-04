import { DatePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";
import { Awards, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-awards",
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: "./awards.component.html",
  styleUrl: "./awards.component.scss",
})
export class AwardsComponent {
  private db = inject(DbmanagerService);
  private modal = inject(DialogService);
  private router = inject(Router);

  protected readonly awards = this.db.Awards;

  async addNewVerdict() {
    const created = await firstValueFrom(this.modal.verdictDialog({
      awardsTitle: "",
      awardsDescription: "",
      awardsDate: new Date().toISOString().slice(0, 10),
      awardsJudge: "",
      awardsProblems: [],
    }, "create"));

    if (!created) {
      return;
    }

    this.db.SetAwards([...this.awards(), created]);
    await this.db.SaveTemporary();
  }

  async openVerdict(award: Awards) {
    const updated = await firstValueFrom(this.modal.verdictDialog(award, "edit"));

    if (!updated) {
      return;
    }

    const currentIndex = this.awards().findIndex(item =>
      item === award
      || (
        item.awardsTitle === award.awardsTitle
        && item.awardsDescription === award.awardsDescription
        && item.awardsDate === award.awardsDate
        && item.awardsJudge === award.awardsJudge
      ),
    );
    const nextAwards = [...this.awards()];

    if (currentIndex >= 0) {
      nextAwards[currentIndex] = updated;
    }
    else {
      nextAwards.push(updated);
    }

    this.db.SetAwards(nextAwards);
    await this.db.SaveTemporary();
  }

  openVerdictFromRow(event: Event, award: Awards) {
    event.stopPropagation();
    void this.openVerdict(award);
  }

  generateVerdict(event: Event, award: Awards) {
    event.stopPropagation();
    const index = this.awards().findIndex(item => item === award || (
      item.awardsTitle === award.awardsTitle
      && item.awardsDescription === award.awardsDescription
      && item.awardsDate === award.awardsDate
      && item.awardsJudge === award.awardsJudge
    ));

    this.router.navigate(["/awards", String(index >= 0 ? index : this.awards().length)]);
  }
}
