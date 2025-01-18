import { LiveAnnouncer } from "@angular/cdk/a11y";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatChipEditedEvent, MatChipInputEvent } from "@angular/material/chips";
import { provideNativeDateAdapter } from "@angular/material/core";
import { Problem } from "@sp/dbmanager/src/lib/models/problem";
import { CurrentProblemService, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Observable, Subscription, map, startWith } from "rxjs";


@Component({
  selector: "lib-problem-publication",
  templateUrl: "./problem-publication.component.html",
  providers: [provideNativeDateAdapter()],
  styleUrls: ["./problem-publication.component.less"]
})
export class ProblemPublicationComponent implements OnInit, OnDestroy {

  get magazine(): string { return this._currentProblem?.source ?? ""; }
  set magazine(val: string) { if (this._currentProblem) this._currentProblem.source = val; }

  private _date: Date | null = new Date();
  get date() { return this._date }
  set date(val: Date | null) {
    this._date = val;
    if (val) this.curProbSvc.SetPublicationDate(val);
  }

  get rank(): string { return this._currentProblem?.prizeRank?.toFixed(0) ?? ""; }
  set rank(v: string) { if (this._currentProblem) this._currentProblem.prizeRank = parseInt(v); }

  public get rankType(): string { return this._currentProblem?.prizeDescription ?? ""; }
  public set rankType(value: string) { if (this._currentProblem) this._currentProblem.prizeDescription = value; }

  public get personalId(): string { return this._currentProblem?.personalID ?? ""; }
  public set personalId(value: string) { if (this._currentProblem) this._currentProblem.personalID = value; }

  tags: string[] = [];

  addOnBlur = true;
  announcer = inject(LiveAnnouncer);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('magazineInput') magazineInput: ElementRef<HTMLInputElement>;

  get allPreviousTags(): string[] {
    const values = new Set(this.db.All.map(problem => problem.tags).flat());
    return Array.from(values);
  }
  get allMagazines(): string[] {
    const values = new Set(this.db.All.map(problem => problem.source).flat());
    return Array.from(values);
  }

  tagInputControl = new FormControl("");
  magazineInputControl = new FormControl("");
  filteredTags: Observable<string[]>;
  magazineFiltered: Observable<string[]>;

  private _filterTags(item: string): string[] {
    const filterValue = item.toLowerCase();
    return this.allPreviousTags.filter(tag => tag.toLowerCase().includes(filterValue.toLowerCase()));
  }
  private _filterMagazine(item: string): string[] {
    const filterValue = item.toLowerCase();
    return this.allMagazines.filter(mag => mag.toLowerCase().includes(filterValue.toLowerCase()));
  }

  private _currentProblem: Problem | null;

  constructor(private db: DbmanagerService, private curProbSvc: CurrentProblemService) { }

  ngOnInit(): void {
    this._subscr = this.db.CurrentProblem$.subscribe(value => {
      this._currentProblem = value;
      if (value) {
        this._date = new Date(value.date);
        this.tags = value.tags;
      } else {
        this._date = null;
        this.tags = [];
      }
    })
    this._currentProblem = this.db.CurrentProblem;
    this.filteredTags = this.tagInputControl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filterTags(tag) : this.allPreviousTags.slice())),
    );
    this.magazineFiltered = this.magazineInputControl.valueChanges.pipe(
      startWith(null),
      map((mag: string | null) => (mag ? this._filterMagazine(mag) : this.allMagazines.slice())),
    );
  }

  private _subscr: Subscription | undefined;

  ngOnDestroy(): void {
    if (this._subscr) this._subscr.unsubscribe();
  }

  addtag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our tag
    const arleadyExists = this.tags.indexOf(value) > -1;
    if (value && !arleadyExists) {
      this.tags.push(value);
    }
    this.tagInput.nativeElement.value = '';
    this.tagInputControl.setValue(null);
  }

  removetag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.announcer.announce(`Removed ${tag}`);
    }
  }

  edittag(tag: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.removetag(tag);
      return;
    }

    // Edit existing fruit
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags[index] = value;
    }
  }
  selecttag(event: MatAutocompleteSelectedEvent) {
    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagInputControl.setValue(null);
  }
}
