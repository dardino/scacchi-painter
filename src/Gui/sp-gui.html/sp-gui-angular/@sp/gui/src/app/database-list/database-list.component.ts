import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { BehaviorSubject, Observable } from "rxjs";
export interface ProblemRef {
  problem: Problem | null;
  dbIndex: number;
}

@Component({
  selector: "app-database-list",
  templateUrl: "./database-list.component.html",
  styleUrls: ["./database-list.component.less"],
})
export class DatabaseListComponent implements OnInit {
  itemSource = new MyDataSource(this.db);
  constructor(private db: DbmanagerService, private modal: DialogService, private route: Router) {}
  ngOnInit(): void {
    if (this.db.All.length < 1) {
      this.route.navigate(["/openfile"]);
    }
  }
  realIndex(index: number) {
    return this.itemSource.realIndex(index);
  }

  public searchValue = "";

  public valueChange($event: Event) {
    this.searchValue = ($event.target as HTMLInputElement).value;
  };

  async createNewPosition() {
    const createdIndex = await this.db.addBlankPosition();
    this.route.navigate(["edit", createdIndex]);
  }
  async askForDeletePositions() {
    alert("");
  }

  async deleteItem(dbIndex: number) {
    const modal = this.modal.confirmDialog({
      title: "Delete confirmation",
      message: "Do you want to remove this problem from the database? This action can NOT be restored!",
      cancelText: "No",
      confirmText: "Yes"
    }).subscribe(res => {
      if (res === true) {
        this.itemSource.deleteProblemByDbIndex(dbIndex);
      }
      modal.unsubscribe();
    });
  }
}


export class MyDataSource extends DataSource<ProblemRef | undefined> {
  private originalDataSource: ProblemRef[];
  private filteredDataSource: ProblemRef[];
  private get items$() {
    return this.itemsSubject.asObservable();
  }
  private itemsSubject = new BehaviorSubject<ProblemRef[]>([]);
  constructor(private db: DbmanagerService) {
    super();
    this.reload();
  }
  connect(
    collectionViewer: CollectionViewer
  ): Observable<Array<ProblemRef | undefined>> {
    return this.items$;
  }
  disconnect(collectionViewer: CollectionViewer): void {
    // no op
  }
  realIndex(index: number) {
    return this.itemsSubject.getValue().length - index;
  }
  public async deleteProblemByDbIndex(dbIndex: number) {
    await this.db.deleteProblemByIndex(dbIndex);
    await this.reload();
  }
  private async reload() {
    const items = this.db.All;
    this.originalDataSource = items.map((problem, dbIndex) => ({ dbIndex, problem }));
    this.filter();
  }
  private async filter() {
    this.filteredDataSource = this.originalDataSource.slice();
    this.filteredDataSource.unshift({ dbIndex: -1, problem: null });
    this.sortDescByDate();
  }
  private async sortDescByDate() {
    this.filteredDataSource.reverse();
    this.itemsSubject.next(this.filteredDataSource);
  }
}
