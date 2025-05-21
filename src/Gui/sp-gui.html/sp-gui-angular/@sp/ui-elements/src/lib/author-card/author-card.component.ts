import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Author } from '@sp/dbmanager/src/lib/models';

export type AuthorCardActions = "delete" | "edit";

@Component({
  selector: 'lib-author-card',
  templateUrl: './author-card.component.html',
  imports: [MatCardModule, MatIconModule, CommonModule, MatButtonModule],
  styleUrl: './author-card.component.less',
  standalone: true
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
