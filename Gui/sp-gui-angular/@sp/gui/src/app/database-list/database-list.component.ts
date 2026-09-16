import { CdkVirtualScrollViewport, ScrollingModule } from "@angular/cdk/scrolling";

import { Component, ElementRef, OnInit, ViewChild, ViewChildren, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { DatabaseListItemComponent } from "../database-list-item/database-list-item.component";
import { MyDataSource } from "./database-source";

@Component({
  selector: "app-database-list",
  templateUrl: "./database-list.component.html",
  styleUrls: ["./database-list.component.scss"],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ScrollingModule,
    MatIconModule,
    DatabaseListItemComponent,
    MatToolbarModule,
    MatButtonModule,
  ],
})
export class DatabaseListComponent implements OnInit {
  private db = inject(DbmanagerService);
  private modal = inject(DialogService);
  private router = inject(Router);

  itemSource = new MyDataSource(this.db);

  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @ViewChildren("dbItemContainer") dbItemContainer: ElementRef[];

  itemSize = computed(() => Math.round(this.dbItemContainer?.[0]?.nativeElement?.getBoundingClientRect().height ?? 256));

  ngOnInit(): void {
    if (this.db.All().length < 1) {
      this.router.navigate(["/openfile"]);
    }
    setTimeout(() => this.scrollToIndex(), 100);
  }

  scrollToIndex() {
    const tree = this.router.parseUrl(this.router.url);
    if (tree.fragment) {
      const index = parseInt(tree.fragment);
      if (!isNaN(index)) {
        this.viewPort.scrollToIndex(this.itemSource.getPositionalIndexFromId(index));
      }
    }
  }

  public searchValue = signal("");

  public valueChange($event: Event) {
    const value = ($event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    this.itemSource.filter(value);
  }

  async createNewPosition() {
    const createdIndex = await this.db.addBlankPosition();
    this.router.navigate(["edit", createdIndex()]);
  }

  async deleteItem(dbIndex: number) {
    const modal = this.modal.confirmDialog({
      title: "Delete confirmation",
      message: "Do you want to remove this problem from the database? This action can NOT be restored!",
      cancelText: "No",
      confirmText: "Yes",
    }).subscribe((res) => {
      if (res === true) {
        this.itemSource.deleteProblemByDbIndex(dbIndex);
      }
      modal.unsubscribe();
    });
  }
}
