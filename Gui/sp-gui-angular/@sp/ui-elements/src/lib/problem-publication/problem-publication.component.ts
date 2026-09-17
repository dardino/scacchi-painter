import { LiveAnnouncer } from "@angular/cdk/a11y";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { CommonModule } from "@angular/common";
import { Component, computed, ElementRef, inject, signal, viewChild } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatCardModule } from "@angular/material/card";
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInputEvent, MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { CurrentProblemService, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { alphabeticalSort } from "../tools/array";

const predefinedPlacementTypes = ["Prize", "Placement", "Honorable mention", "Commendation", "Special Prize", "Special Honorable mention"] as const;
type StandardPlacementType = (typeof predefinedPlacementTypes)[number];
type StandardPlacements = Array<{ value: StandardPlacementType; description: string }>;

const AllStandardPlacements: StandardPlacements = predefinedPlacementTypes.map(value => ({ value, description: value }));

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
    MatInputModule,
  ],
})
export class ProblemPublicationComponent {
  #db = inject(DbmanagerService);
  #filterMagazine = signal("");
  #filterTag = signal("");
  filteredTags = computed(() => {
    const values = new Set(this.#db.All().map(problem => problem.tags).flat());
    return Array.from(values)
      .filter(tag => tag.toLowerCase().includes(this.#filterTag().trim().toLowerCase()))
      .sort(alphabeticalSort);
  });

  filteredMagazines = computed(() => {
    const values = new Set(this.#db.All().map(problem => problem.source).flat());
    return Array.from(values)
      .filter(mag => mag.toLowerCase().includes(this.#filterMagazine().trim().toLowerCase()))
      .sort(alphabeticalSort);
  });

  placementTypes = computed(() => {
    return [
      { value: "", description: "None" },
      ...AllStandardPlacements,
    ].concat(
      Array.from(new Set(this.#db.All().map(problem => problem.prizeDescription)
        .sort(alphabeticalSort)
        .filter(desc => !!desc && !predefinedPlacementTypes.includes(desc as StandardPlacementType)),
      )).map(desc => ({ value: desc, description: desc })),
    );
  });

  private curProbSvc = inject(CurrentProblemService);

  tagInput = viewChild<ElementRef<HTMLInputElement>>("tagInput");
  magazine = computed(() => this.curProbSvc.Problem()?.source ?? "");
  date = computed(() => this.curProbSvc.Problem()?.dateAsDate ?? null);
  personalId = computed(() => this.curProbSvc.Problem()?.personalID ?? "");
  rank = computed(() => this.curProbSvc.Problem()?.prizeRank?.toFixed(0) ?? "");
  rankType = computed(() => this.curProbSvc.Problem()?.prizeDescription ?? "");
  tags = computed<string[]>(() => this.curProbSvc.Problem()?.tags ?? []);

  setRank(value: string) {
    this.curProbSvc.SetAward({ rank: parseInt(value) });
  }

  setRankType(value: string) {
    this.curProbSvc.SetAward({ description: value });
  }

  setPersonalId(value: string) {
    this.curProbSvc.SetPersonalID(value);
  }

  setMagazine(val: string) {
    this.#filterMagazine.set(val);
    this.curProbSvc.SetSource(val);
  }

  setDate(event: MatDatepickerInputEvent<Date>) {
    const val = event.value;
    this.curProbSvc.SetPublicationDate(val ?? new Date());
  }

  addOnBlur = false;
  announcer = inject(LiveAnnouncer);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  setFilterTag(value: string) {
    this.#filterTag.set(value);
  }

  addtag(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();
    const set = new Set(this.tags());
    set.add(value);
    this.curProbSvc.SetTags([...set].filter(tag => !!tag));
    this.#filterTag.set("");

    const input = this.tagInput();
    if (input) {
      input.nativeElement.value = "";
    }
  }

  removetag(tag: string): void {
    const set = new Set(this.tags());
    set.delete(tag);
    this.curProbSvc.SetTags([...set]);
  }

  edittag(tag: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.removetag(tag);
      return;
    }

    // Edit existing tag
    const set = new Set(this.tags());
    if (set.has(tag)) {
      set.delete(tag);
      set.add(value);
      this.curProbSvc.SetTags([...set]);
    }
  }

  selecttag(event: MatAutocompleteSelectedEvent) {
    const value = event.option.viewValue.trim();
    if (!value) {
      return;
    }
    const set = new Set(this.tags());
    set.add(value);
    this.curProbSvc.SetTags([...set]);

    const input = this.tagInput();
    if (input) {
      input.nativeElement.value = "";
    }
  }
}
