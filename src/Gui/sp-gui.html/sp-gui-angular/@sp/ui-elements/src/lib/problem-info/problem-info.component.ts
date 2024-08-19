import { Component, EventEmitter, Output } from "@angular/core";
import { Author } from "@sp/dbmanager/src/lib/models/author";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import type { AuthorCardActions } from "../author-card/author-card.component";

@Component({
  selector: "lib-problem-info",
  templateUrl: "./problem-info.component.html",
  styleUrls: ["./problem-info.component.less"],
})
export class ProblemInfoComponent {


  constructor() { }

  @Output()
  public openTwin = new EventEmitter<Twin | null>();
  @Output()
  public addCondition = new EventEmitter<void>();
  @Output()
  public deleteCondition = new EventEmitter<string>();
  @Output()
  public deleteTwin = new EventEmitter<Twin>();
  @Output()
  public openAuthor = new EventEmitter<Author | null>();
  @Output()
  public deleteAuthor = new EventEmitter<Author>();

  callAuthorAction($event: { author: Author | null; action: AuthorCardActions; }) {
    switch ($event.action) {
      case "delete":
        if ($event.author) this.deleteAuthor.emit($event.author);
        break;
      case "edit":
        this.openAuthor.emit($event.author);
        break;
    }

  }
}
