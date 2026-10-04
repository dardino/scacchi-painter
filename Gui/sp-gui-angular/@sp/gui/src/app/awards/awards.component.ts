import { DatePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { Awards, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-awards",
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatListModule],
  templateUrl: "./awards.component.html",
  styleUrl: "./awards.component.scss",
})
export class AwardsComponent {
  private db = inject(DbmanagerService);
  private modal = inject(DialogService);

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

  openVerdict(award: Awards) {
    this.modal.verdictDialog(award, "view");
  }
}
