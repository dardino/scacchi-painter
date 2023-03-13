import { Component, OnInit } from "@angular/core";
import { DbmanagerService, TwinTypes } from "@sp/dbmanager/src/public-api";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { DataSource, CollectionViewer } from "@angular/cdk/collections";
import { Observable, BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";

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
  hasTwins(item: Problem): boolean {
    const twinsNoDiagram = item.twins?.TwinList.filter(twin => twin.TwinType !== TwinTypes.Diagram) ?? [];
    return !!twinsNoDiagram.length;
  }
  twins(item: Problem) {
    const twinsNoDiagram = item.twins?.TwinList.filter(twin => twin.TwinType !== TwinTypes.Diagram) ?? [];
    if (!twinsNoDiagram.length) return [];
    return [Twin.DIAGRAM].concat(twinsNoDiagram).map((twin, index) => `${index+1}) ${twin.toString()}`);
  }
  authors(item: Problem) {
    return item.authors.map((author) => author.nameAndSurname).join(", ");
  }
  async createNewPosition() {
    const createdIndex = await this.db.addBlankPosition();
    this.route.navigate(["edit", createdIndex]);
  }
}


interface ProblemRef {
  problem: Problem;
  dbIndex: number;
}

export class MyDataSource extends DataSource<ProblemRef | undefined> {
  private readonly originalDataSource: ProblemRef[];
  private readonly filteredDataSource: ProblemRef[];
  private get items$() {
    return this.itemsSubject.asObservable();
  }
  private itemsSubject = new BehaviorSubject<ProblemRef[]>([]);
  constructor(items: Problem[]) {
    super();
    this.originalDataSource = items.map((problem, dbIndex) => ({ dbIndex, problem }));
    this.filteredDataSource = this.originalDataSource.slice();
    this.sortDescByDate();
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
  private sortDescByDate() {
    this.filteredDataSource.reverse();
    this.itemsSubject.next(this.filteredDataSource);
  }
}
