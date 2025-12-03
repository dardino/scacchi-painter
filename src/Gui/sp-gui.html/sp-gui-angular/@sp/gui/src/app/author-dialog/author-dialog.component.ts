
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Author } from '@sp/dbmanager/src/lib/models';

@Component({
    selector: 'app-author-dialog',
    templateUrl: './author-dialog.component.html',
    styleUrl: './author-dialog.component.less',
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
],
    standalone: true
})
export class AuthorDialogComponent {
  dialogRef = inject<MatDialogRef<AuthorDialogComponent, Author | null>>(MatDialogRef);
  data = inject<Author | null>(MAT_DIALOG_DATA);

  author: Author;

  get Id() { return this.author.AuthorID; }

  constructor() {
    const data = this.data;

    // clone to keep old values unchanged until save
    this.author = Author.fromJson(data ?? {}, data?.AuthorID ?? -1);
  }
  clickCancel() {
    this.dialogRef.close();
  }
  clickSave() {
    this.dialogRef.close(this.author);
  }
  setNameAndSurname(event: string) {
    this.author.nameAndSurname = event;
  }
  setAddress(event: string) {
    this.author.address = event;
  }
  setCity(event: string) {
    this.author.city = event;
  }
  setCountry(event: string) {
    this.author.country = event;
  }
  setLanguage(event: string) {
    this.author.language = event;
  }
  setPhone(event: string) {
    this.author.phone = event;
  }
  setStateOrProvince(event: string) {
    this.author.stateOrProvince = event;
  }
  setZipCode(event: string) {
    this.author.zipCode = event;
  }
}
