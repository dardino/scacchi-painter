import { Component, computed, input, output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { Author } from "@sp/dbmanager/src/lib/models";

export type AuthorCardActions = "delete" | "edit";

@Component({
  selector: "lib-author-card",
  templateUrl: "./author-card.component.html",
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  styleUrl: "./author-card.component.scss",
  standalone: true,
})
export class AuthorCardComponent {
  author = input<Author | null>(null);

  authorId = computed(() => this.author()?.authorId);
  nameAndSurname = computed(() => this.author()?.nameAndSurname);
  country = computed(() => this.author()?.country);
  longText = computed(() => this.author()?.city);

  public action = output<AuthorCardActions>();

  execDelete = () => {
    this.action.emit("delete");
  };

  execEdit = () => {
    this.action.emit("edit");
  };
}
