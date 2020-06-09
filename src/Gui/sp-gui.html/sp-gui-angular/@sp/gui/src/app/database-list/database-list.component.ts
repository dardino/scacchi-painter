import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DataSource, CollectionViewer } from "@angular/cdk/collections";
import { BehaviorSubject, Subscription, Observable } from "rxjs";

@Component({
  selector: "app-database-list",
  templateUrl: "./database-list.component.html",
  styleUrls: ["./database-list.component.styl"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseListComponent implements OnInit {
  ds = new MyDataSource(this.db);
  constructor(private db: DbmanagerService) {}
  get problems() {
    return this.db.All;
  }
  ngOnInit(): void {}
}

export class MyDataSource extends DataSource<Element | undefined> {
  private pageSize = 10;
  private cachedData = Array.from<Element>({ length: this.db.Count });
  private fetchedPages = new Set<number>();
  private dataStream = new BehaviorSubject<Array<Element | undefined>>(
    this.cachedData
  );
  private subscription = new Subscription();

  constructor(private db: DbmanagerService) {
    super();
  }

  connect(
    collectionViewer: CollectionViewer
  ): Observable<Array<Element | undefined>> {
    this.subscription.add(
      collectionViewer.viewChange.subscribe((range) => {
        const startPage = this._getPageForIndex(range.start);
        const endPage = this._getPageForIndex(range.end - 1);
        for (let i = startPage; i <= endPage; i++) {
          this._fetchPage(i);
        }
      })
    );
    return this.dataStream;
  }

  disconnect(): void {
    this.subscription.unsubscribe();
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private _fetchPage(page: number) {
    if (this.fetchedPages.has(page)) {
      return;
    }
    this.fetchedPages.add(page);

    // Use `setTimeout` to simulate fetching data from server.
    setTimeout(() => {
      this.cachedData.splice(
        page * this.pageSize,
        this.pageSize,
        ...Array.from(this.db.getPage(page, this.pageSize))
      );
      this.dataStream.next(this.cachedData);
    }, Math.random() * 1000 + 200);
  }
}
