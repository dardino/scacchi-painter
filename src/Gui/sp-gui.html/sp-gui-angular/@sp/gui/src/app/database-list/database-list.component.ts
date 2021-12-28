import { Component, OnInit } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { DataSource, CollectionViewer } from "@angular/cdk/collections";
import { Observable, BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-database-list",
  templateUrl: "./database-list.component.html",
  styleUrls: ["./database-list.component.less"],
})
export class DatabaseListComponent implements OnInit {
  itemSource = new MyDataSource(this.db.All);
  constructor(private db: DbmanagerService, private route: Router) {}
  ngOnInit(): void {
    if (this.db.All.length < 1) {
      this.route.navigate(["/openfile"]);
    }
  }
  stipulation(item: Problem) {
    return `${item.stipulation.completeStipulationDesc}`;
  }
  pieceCounter(item: Problem) {
    return `${item.getPieceCounter()}`;
  }
  realIndex(index: number) {
    return this.itemSource.realIndex(index);
  }
}

export class MyDataSource extends DataSource<Problem | undefined> {
  private get items$() {
    return this.itemsSubject.asObservable();
  }
  private itemsSubject = new BehaviorSubject<Problem[]>([]);
  constructor(items: Problem[]) {
    super();
    this.itemsSubject.next(items.slice().reverse());
  }
  connect(
    collectionViewer: CollectionViewer
  ): Observable<Array<Problem | undefined>> {
    return this.items$;
  }
  disconnect(collectionViewer: CollectionViewer): void {}
  realIndex(index: number) {
    return this.itemsSubject.getValue().length - index;
  }
}
