import { DataSource } from "@angular/cdk/collections";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { Router } from "@angular/router";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { BehaviorSubject, Observable } from "rxjs";
import { intersect } from "../tools/array";
import { includes } from "../tools/string";
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
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @ViewChildren('dbItemContainer') dbItemContainer: ElementRef[];

  get itemSize() {
    return Math.round(this.dbItemContainer?.[0]?.nativeElement?.getBoundingClientRect().height ?? 256);
  }
  constructor(private db: DbmanagerService, private modal: DialogService, private router: Router) {
  }
  ngOnInit(): void {
    if (this.db.All.length < 1) {
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

  public searchValue = "";

  public valueChange($event: Event) {
    this.searchValue = ($event.target as HTMLInputElement).value;
    this.itemSource.filter(this.searchValue);
  }

  async createNewPosition() {
    const createdIndex = await this.db.addBlankPosition();
    this.router.navigate(["edit", createdIndex]);
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
    /* collectionViewer: CollectionViewer */
  ): Observable<Array<ProblemRef | undefined>> {
    return this.items$;
  }
  disconnect(/* collectionViewer: CollectionViewer */): void {
    // no op
  }
  getPositionalIndexFromId(dbIndex: number): number {
    return this.itemsSubject.getValue().findIndex(pr => pr.dbIndex === dbIndex);
  }
  public async deleteProblemByDbIndex(dbIndex: number) {
    await this.db.deleteProblemByIndex(this.getPositionalIndexFromId(dbIndex));
    await this.reload();
  }
  private async reload() {
    const items = this.db.All;
    this.originalDataSource = items.map((problem, dbIndex) => ({ dbIndex: dbIndex + 1, problem }));
    this.filter("");
  }
  public async filter(text: string) {
    this.filteredDataSource = this.originalDataSource.slice();
    if (text.trim() !== "") {
      this.filteredDataSource = this.filteredDataSource.filter(filterByText(text));
    }
    this.filteredDataSource.unshift({ dbIndex: -1, problem: null });
    this.sortDescByDate();
    this.itemsSubject.next(this.filteredDataSource);
  }
  private async sortDescByDate() {
    this.filteredDataSource.reverse();
  }
}

const filterByText = (text: string, cfg = { stipulation: true, names: true, source: true }) => {
  const textTokens = text.toLowerCase().split(" ");
  return (e: ProblemRef /*, i: number, a: ProblemRef[] */) => {
    if (!e.problem) return false;
    const stip = e.problem.stipulation.completeStipulationDesc.toLowerCase();
    const names = e.problem.authors.map(aut => aut.nameAndSurname.toLowerCase()) ?? "";
    const magazine = e.problem.source.toLowerCase();

    const isMatch = (cfg.stipulation && textTokens.filter(tok => stip.includes(tok)).length > 0)
        || (cfg.names && intersect(names, textTokens, includes).length > 0)
        || (cfg.source && textTokens.filter(tok =>  magazine.includes(tok)).length > 0);

    return isMatch;
  };
};
