import { Component, OnInit } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { DataSource, CollectionViewer } from "@angular/cdk/collections";
import { Observable, BehaviorSubject } from "rxjs";

@Component({
  selector: "app-database-list",
  templateUrl: "./database-list.component.html",
  styleUrls: ["./database-list.component.styl"],
})
export class DatabaseListComponent implements OnInit {
  itemSource = new MyDataSource(this.db.All);
  constructor(private db: DbmanagerService) {}
  ngOnInit(): void {}
  stipulation(item: Problem) {
    return `${item.stipulation.completeStipulationDesc}${
      item.stipulation.moves
    } ${item.getPieceCounter()}`;
  }
  realIndex(index: number){
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
  disconnect(collectionViewer: CollectionViewer): void {
  }
  realIndex(index: number) {
    return this.itemsSubject.getValue().length - index;
  }
}