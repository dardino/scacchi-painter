import { Component, computed, inject, output } from "@angular/core";
import { Author } from "@sp/dbmanager/src/lib/models";
import { CurrentProblemService } from "@sp/dbmanager/src/public-api";
import { AuthorCardActions, AuthorCardComponent } from "../author-card/author-card.component";

@Component({
  selector: "lib-problem-authors",
  templateUrl: "./problem-authors.component.html",
  styleUrls: ["./problem-authors.component.scss"],
  imports: [AuthorCardComponent],
  standalone: true,
})
export class ProblemAuthorsComponent {
  private current = inject(CurrentProblemService);

  currentProblem = computed(() => this.current.Problem());
  callAction = output<{ author: Author | null; action: AuthorCardActions }>();

  action($event: AuthorCardActions, author: Author | null) {
    this.callAction.emit({ action: $event, author });
  }

  openAuthor(author: Author | null) {
    this.callAction.emit({ action: "edit", author });
  }
}
