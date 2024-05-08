import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Author } from '@sp/dbmanager/src/lib/models';

export type AuthorCardActions = "delete" | "edit";

@Component({
  selector: 'lib-author-card',
  templateUrl: './author-card.component.html',
  styleUrl: './author-card.component.less'
})
export class AuthorCardComponent {

  @Input() author: Author | null;

  get nameAndSurname() { return this.author?.nameAndSurname; }
  get country() { return this.author?.country; }
  get longText() { return this.author?.city; }

  @Output()
  public action = new EventEmitter<AuthorCardActions>();

  execDelete = () => {
    this.action.emit("delete")
  }
  execEdit = () => {
    this.action.emit("edit")
  }
}
