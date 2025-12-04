import { CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";

import { Component, EventEmitter, Output, computed, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMiniFabButton } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Author } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import {
  CurrentProblemService,
  EndingTypes,
  ProblemTypes
} from "@sp/dbmanager/src/public-api";
import { SortableListComponent } from "../sortable-list/sortable-list.component";

@Component({
    selector: "lib-problem-definitions",
    templateUrl: "./problem-definitions.component.html",
    styleUrls: ["./problem-definitions.component.scss"],
    standalone: true,
    imports: [
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    SortableListComponent,
    CdkDropList,
    MatMiniFabButton
]
})
export class ProblemDefinitionsComponent {
  private current = inject(CurrentProblemService);

  @Output()
  public openTwin = new EventEmitter<Twin | null>();

  @Output()
  public addCondition = new EventEmitter<void>();

  @Output()
  public deleteCondition = new EventEmitter<string>();

  @Output()
  public deleteTwin = new EventEmitter<Twin>();

  completeDesc = computed(() => this.current.Problem?.stipulation.completeStipulationDesc);

  get authors(): Author[] {
    return this.current.Problem?.authors ?? [];
  }
  set authors(v: Author[]) {
    this.current.SetAuthors(v);
  }

  get twins(): Twin[] {
    return this.current.Problem?.twins.TwinList ?? [];
  }
  set twins(v: Twin[]) {
    this.current.SetTwins(v);
  }

  get conditions(): string[] {
    return this.current.Problem?.conditions ?? [];
  }
  set conditions(v: string[]) {
    this.current.SetConditions(v);
  }

  get problemType(): ProblemTypes {
    return this.current.Problem?.stipulation.problemType ?? "-";
  }
  set problemType(v: ProblemTypes) {
    this.current.SetProblemType(v);
  }

  get leadsTo(): EndingTypes {
    return this.current.Problem?.stipulation.stipulationType ?? "#";
  }
  set leadsTo(v: EndingTypes) {
    this.current.SetStipulationType(v);
  }

  get moves(): string {
    return (this.current.Problem?.stipulation.moves ?? 2).toString();
  }
  set moves(v: string) {
    const moves = parseFloat(v.replace(",", "."));
    this.current.SetStipulationMoves(!isNaN(moves) ? moves : this.current.Problem?.stipulation.moves ?? 2);
  }

  public twinCanBeDeleted(twin: Twin) {
    return (this.twins?.length > 2) || twin.TwinType !== "Diagram";
  }
  public isDragDisabledForTwin = (twin: Twin): boolean => {
    const length = this.twins?.length ?? 0;
    const hasDiagram = this.current?.Problem?.twins?.HasDiagram === true;
    const tooFewElements = length < 2;
    const tooFewElementsWDiagram = (hasDiagram && length <= 2);
    const isDiagram = twin.TwinType === "Diagram";
    return (tooFewElements || tooFewElementsWDiagram || isDiagram);
  };

  dropAuthor(event: CdkDragDrop<Author[]>) {
    moveItemInArray(this.authors, event.previousIndex, event.currentIndex);
  }
  dropTwin(event: CdkDragDrop<Twin[]>) {
    if (event.currentIndex <= 0) event.currentIndex = 1;
    moveItemInArray(this.twins, event.previousIndex, event.currentIndex);
  }
  dropCondition(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.conditions, event.previousIndex, event.currentIndex);
  }

}

/*

						                              {#= }	      {#=  }
						                              {!= }	      {!=  }
						                              {!# }       {!#  }
						                              {00 }	      {00  }
						                              {%  }	      {%	 }
						                              {~  }	      {~	 }
						                              {ep }	      {ep  }
          {SER- }              {H }	      {#  }	      {#	 }
			    {PSER-}              {S }	      {=  }	      {=	 }
	{m->} + {EXACT-} + {PHSER-}+ {R } + ( + {== } + ) + {==  } + n
			    {SEMI-}              {HS}	      {+  }	      {+	 }
			    {RECI-}              {HR}	      {Zxy}	      {Zxy }
						                              {x  }	      {x	 }
						                              {## }	      {##  }
						                              {##!}	      {##! }
						                              {ct }	      {ct  }
						                              {<> }	      {<>  }
						                              {ctr}	      {ctr }
						                              {<>r}	      {<>r }
						                              {c81}	      {c81 }
							                                        {Kxy }

							                                        {dia } + n{.5}
			    {SER-}	                                  + {dia } + n
							                                        {a=>b} + n{.5}
			    {SER-}			                              + {a=>b} + n

	(m, n are the number of moves)


*/
