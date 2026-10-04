import { DatePipe } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { ActivatedRoute } from "@angular/router";
import { Awards, DbmanagerService } from "@sp/dbmanager/src/public-api";

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

  readonly award = computed<Awards | null>(() => {
    const rawId = this.route.snapshot.paramMap.get("id");
    const index = rawId == null ? NaN : Number(rawId);
    const awards = this.db.Awards();

    if (Number.isNaN(index) || index < 0 || index >= awards.length) {
      return null;
    }

    return awards[index] ?? null;
  });
}
