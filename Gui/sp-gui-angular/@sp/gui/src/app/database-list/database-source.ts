import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { effect } from "@angular/core";
import { Problem } from "@sp/dbmanager/src/lib/models/problem";
import { IDbManagerService } from "@sp/dbmanager/src/public-api";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { intersect } from "../tools/array";
import { includes } from "../tools/string";

export interface ProblemRef {
  problem: Problem | null;
  dbIndex: number;
}

export type SourceModes = "date" | "date-desc" | "id" | "id-desc" | "personalid" | "personalid-desc";

export class MyDataSource extends DataSource<ProblemRef | undefined> {
  private _length = 0;
  private _pageSize = 10;
  private _cachedData = Array.from<ProblemRef | undefined>({ length: this._length });
  private readonly _dataStream = new BehaviorSubject<(ProblemRef | undefined)[]>(this._cachedData);
  private readonly _subscription = new Subscription();
  private _currentFilter = "";
  private _sortMode: SourceModes = "id-desc";

  constructor(private db: IDbManagerService) {
    super();

    effect(() => {
      const allProblems = this.db.All();
      this._length = allProblems.length;
      this._cachedData = allProblems.map((problem, index) => ({ problem, dbIndex: index + 1 }));
      this._refreshCurrentView();
    });
  }

  private _refreshCurrentView(): void {
    const sourceData = this._cachedData.slice();
    const filteredData = this._currentFilter.trim()
      ? sourceData.filter(filterByText(this._currentFilter))
      : sourceData;

    this.sort(this._sortMode, filteredData);
  }

  connect(collectionViewer: CollectionViewer): Observable<(ProblemRef | undefined)[]> {
    this._subscription.add(
      collectionViewer.viewChange.subscribe((range) => {
        const startPage = this._getPageForIndex(range.start);
        const endPage = this._getPageForIndex(range.end - 1);
        const currentData = this._dataStream.getValue();

        this._dataStream.next(currentData.slice(
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
      const currentAll = this.db.All();
      const newAll = currentAll.filter((_, i) => i !== dbIndex - 1);
      this.db.SetData(newAll);
      this.db.SaveTemporary();
    }
  }

  filter(value: string): void {
    this._currentFilter = value;
    this._refreshCurrentView();
  }

  /**
   * Sorts the dataset based on the specified sorting mode.
   * @param value The sorting mode to apply to the dataset.
   * @param dataToSort Optional dataset to sort. If not provided, the current data stream value will be used.
   */
  sort(value: SourceModes, dataToSort?: (ProblemRef | undefined)[]): void {
    this._sortMode = value;
    const datasetToSort = dataToSort ? [...dataToSort] : [...this._dataStream.getValue()];
    switch (value) {
      case "date":
        datasetToSort.sort(sortByDate);
        break;
      case "date-desc":
        datasetToSort.sort((a, b) => -sortByDate(a, b));
        break;
      case "id":
        datasetToSort.sort(sortById);
        break;
      case "id-desc":
        datasetToSort.sort((a, b) => -sortById(a, b));
        break;
      case "personalid":
        datasetToSort.sort(sortByPersonalId);
        break;
      case "personalid-desc":
        datasetToSort.sort((a, b) => -sortByPersonalId(a, b));
        break;
    }
    this._dataStream.next(datasetToSort);
  }
}

function sortByDate(a: ProblemRef | undefined, b: ProblemRef | undefined): number {
  return (a?.problem?.dateAsDate.getTime() ?? 0) - (b?.problem?.dateAsDate.getTime() ?? 0);
}
function sortById(a: ProblemRef | undefined, b: ProblemRef | undefined): number {
  return (a?.dbIndex ?? 0) - (b?.dbIndex ?? 0);
}
function sortByPersonalId(a: ProblemRef | undefined, b: ProblemRef | undefined): number {
  const pidA = a?.problem?.personalID ?? "-1";
  const pidB = b?.problem?.personalID ?? "-1";
  const pidANum = parseInt(pidA, 10) || 0;
  const pidBNum = parseInt(pidB, 10) || 0;
  if (!isNaN(pidANum) && !isNaN(pidBNum)) {
    return pidANum - pidBNum;
  }
  return pidA.localeCompare(pidB);
}

const filterByText = (text: string, cfg = {
  stipulation: true,
  names: true,
  source: true,
  kingPositions: true,
}) => {
  const textTokens = text.toLowerCase().split(" ");
  return (e: ProblemRef | undefined /* , i: number, a: ProblemRef[] */) => {
    if (!e?.problem) return false;
    const stip = e.problem.stipulation.completeStipulationDesc.toLowerCase();
    const names = e.problem.authors.map(aut => aut.nameAndSurname.toLowerCase()) ?? "";
    const magazine = e.problem.source.toLowerCase();
    const kingPositions = e.problem.kingPositions.toLowerCase();

    const isMatch = (cfg.stipulation && textTokens.filter(tok => stip.includes(tok)).length > 0)
      || (cfg.names && intersect(names, textTokens, includes).length > 0)
      || (cfg.source && textTokens.filter(tok => magazine.includes(tok)).length > 0)
      || (cfg.kingPositions && textTokens.filter(tok => kingPositions.includes(tok)).length > 0);

    return isMatch;
  };
};
