import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { effect } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/lib/dbmanager.service";
import { Problem } from "@sp/dbmanager/src/lib/models/problem";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { intersect } from "../tools/array";
import { includes } from "../tools/string";

export interface ProblemRef {
  problem: Problem | null;
  dbIndex: number;
}

export class MyDataSource extends DataSource<ProblemRef | undefined> {
  private _length = 0;
  private _pageSize = 10;
  private _cachedData = Array.from<ProblemRef | undefined>({ length: this._length });
  private _fetchedPages = new Set<number>();
  private readonly _dataStream = new BehaviorSubject<(ProblemRef | undefined)[]>(this._cachedData);
  private readonly _subscription = new Subscription();

  constructor(private db: DbmanagerService) {
    super();

    effect(() => {
      const allProblems = this.db.All();
      this._length = allProblems.length;
      this._cachedData = allProblems.map((problem, index) => ({ problem, dbIndex: index + 1 }));
      this._cachedData.unshift({ problem: null, dbIndex: -1 }); // Add a placeholder for the "Add New Position" button
      this._dataStream.next(this._cachedData);
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<(ProblemRef | undefined)[]> {
    this._subscription.add(
      collectionViewer.viewChange.subscribe((range) => {
        const startPage = this._getPageForIndex(range.start);
        const endPage = this._getPageForIndex(range.end - 1);

        this._dataStream.next(this._cachedData.slice(
          startPage * this._pageSize,
          (endPage + 1) * this._pageSize,
        ));
      }),
    );
    return this._dataStream;
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  getPositionalIndexFromId(id: number): number {
    return this._cachedData.findIndex(item => item?.dbIndex === id);
  }

  deleteProblemByDbIndex(dbIndex: number): void {
    const index = this._cachedData.findIndex(item => item?.dbIndex === dbIndex);
    if (index !== -1) {
      this._cachedData.splice(index, 1);
      this._dataStream.next(this._cachedData);
      this.db.All.update(problems => problems.filter((_, i) => i !== dbIndex - 1));
      this.db.SaveTemporary();
    }
  }

  filter(value: string): void {
    const filteredData = this._cachedData.filter(filterByText(value));
    this._dataStream.next(filteredData);
  }
}

const filterByText = (text: string, cfg = { stipulation: true, names: true, source: true }) => {
  const textTokens = text.toLowerCase().split(" ");
  return (e: ProblemRef | undefined /* , i: number, a: ProblemRef[] */) => {
    if (!e?.problem) return false;
    const stip = e.problem.stipulation.completeStipulationDesc.toLowerCase();
    const names = e.problem.authors.map(aut => aut.nameAndSurname.toLowerCase()) ?? "";
    const magazine = e.problem.source.toLowerCase();

    const isMatch = (cfg.stipulation && textTokens.filter(tok => stip.includes(tok)).length > 0)
      || (cfg.names && intersect(names, textTokens, includes).length > 0)
      || (cfg.source && textTokens.filter(tok => magazine.includes(tok)).length > 0);

    return isMatch;
  };
};
