import { LiveAnnouncer } from "@angular/cdk/a11y";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, effect, inject, signal } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatCardModule } from "@angular/material/card";
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Problem } from "@sp/dbmanager/src/lib/models/problem";
import { CurrentProblemService, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Observable, Subscription, map, startWith } from "rxjs";


@Component({
    selector: "lib-problem-publication",
    templateUrl: "./problem-publication.component.html",
    providers: [provideNativeDateAdapter()],
    styleUrls: ["./problem-publication.component.scss"],
    standalone: true,
    imports: [
      MatCardModule,
       FormsModule,
       ReactiveFormsModule,
       MatAutocompleteModule,
       MatSelectModule,
       CommonModule,
       MatIconModule,
       MatFormFieldModule,
       MatChipsModule,
       MatDatepickerModule,
       MatInputModule
      ]
})
export class ProblemPublicationComponent implements OnInit, OnDestroy {
  private db = inject(DbmanagerService);
  private curProbSvc = inject(CurrentProblemService);

  private _currentProblem = signal<Problem | null>(null);

  get magazine(): string { return this._currentProblem()?.source ?? ""; }
  set magazine(val: string) {
    const prob = this._currentProblem();
    if (prob) prob.source = val;
  }

  private _date = signal<Date | null>(new Date());
  get date(): Date | null { return this._date(); }
  set date(val: Date | null) {
    this._date.set(val);
    if (val) this.curProbSvc.SetPublicationDate(val);
  }

  get rank(): string { return this._currentProblem()?.prizeRank?.toFixed(0) ?? ""; }
  set rank(v: string) {
    const prob = this._currentProblem();
    if (prob) prob.prizeRank = parseInt(v);
  }

  get rankType(): string { return this._currentProblem()?.prizeDescription ?? ""; }
  set rankType(value: string) {
    const prob = this._currentProblem();
    if (prob) prob.prizeDescription = value;
  }

  get personalId(): string { return this._currentProblem()?.personalID ?? ""; }
  set personalId(value: string) {
    const prob = this._currentProblem();
    if (prob) prob.personalID = value;
  }

  tags = signal<string[]>([]);

  constructor() {
    // Effetto per sincronizzare i tag quando cambia il problema
    effect(() => {
      const problem = this._currentProblem();
      if (problem) {
        this.tags.set([...problem.tags]);
      }
    });
  }

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

  ngOnInit(): void {
    this._subscr = this.db.CurrentProblem$.subscribe(value => {
      this._currentProblem.set(value);
      if (value) {
        this._date.set(new Date(value.date));
        this.magazineInputControl.setValue(value.source ?? "", { emitEvent: false });
      } else {
        this._date.set(null);
        this.magazineInputControl.setValue("", { emitEvent: false });
      }
    })
    this._currentProblem.set(this.db.CurrentProblem);

    // Sincronizza magazine dal FormControl al modello
    this.magazineInputControl.valueChanges.subscribe(value => {
      const prob = this._currentProblem();
      if (prob) {
        prob.source = value ?? "";
      }
    });

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
    const currentTags = this.tags();
    const arleadyExists = currentTags.indexOf(value) > -1;
    if (value && !arleadyExists) {
      this.tags.update(tags => [...tags, value]);
    }
    this.tagInput.nativeElement.value = '';
    this.tagInputControl.setValue(null);
  }

  removetag(tag: string): void {
    this.tags.update(tags => {
      const index = tags.indexOf(tag);
      if (index >= 0) {
        const newTags = [...tags];
        newTags.splice(index, 1);
        this.announcer.announce(`Removed ${tag}`);
        return newTags;
      }
      return tags;
    });
  }

  edittag(tag: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.removetag(tag);
      return;
    }

    // Edit existing fruit
    this.tags.update(tags => {
      const index = tags.indexOf(tag);
      if (index >= 0) {
        const newTags = [...tags];
        newTags[index] = value;
        return newTags;
      }
      return tags;
    });
  }
  selecttag(event: MatAutocompleteSelectedEvent) {
    this.tags.update(tags => [...tags, event.option.viewValue]);
    this.tagInput.nativeElement.value = '';
    this.tagInputControl.setValue(null);
  }
}
