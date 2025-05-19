import { Component, EventEmitter, Output } from "@angular/core";
import { Author } from "@sp/dbmanager/src/lib/models";
import { CurrentProblemService } from "@sp/dbmanager/src/public-api";
import { AuthorCardActions } from "../author-card/author-card.component";

@Component({
    selector: "lib-problem-authors",
    templateUrl: "./problem-authors.component.html",
    styleUrls: ["./problem-authors.component.less"],
    standalone: false
})
export class ProblemAuthorsComponent {

  get currentProblem() { return this.current.Problem; }
  @Output()
  public callAction = new EventEmitter<{ author: Author | null, action: AuthorCardActions }>();

  constructor(private current: CurrentProblemService) {}

  action($event: AuthorCardActions, author: Author | null) {
    this.callAction.emit({ action: $event, author });
  }

  openAuthor(author: Author | null) {
    this.callAction.emit({ action: "edit", author });
  }
}
