import { Component, inject } from "@angular/core";
import { MatListModule } from "@angular/material/list";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "app-awards",
  standalone: true,
  imports: [MatListModule],
  templateUrl: "./awards.component.html",
  styleUrl: "./awards.component.scss",
})
export class AwardsComponent {
  private db = inject(DbmanagerService);

  protected readonly awards = this.db.Awards;
}
