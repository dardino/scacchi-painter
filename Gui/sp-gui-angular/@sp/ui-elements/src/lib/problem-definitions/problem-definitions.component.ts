import { CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";

import { Component, computed, inject, output } from "@angular/core";
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
    MatMiniFabButton,
  ],
})
export class ProblemDefinitionsComponent {
  private current = inject(CurrentProblemService);

  openTwin = output<Twin | null>();
  addCondition = output<void>();
  deleteCondition = output<string>();
  deleteTwin = output<Twin>();
  zeroposition = computed(() => this.current.Problem()?.twins.HasZeroPosition ?? false);
  completeDesc = computed(() => this.current.Problem()?.stipulation.completeStipulationDesc);

  authors = computed(() => this.current.Problem()?.authors ?? []);
  twins = computed(() => this.current.Problem()?.twins.TwinList ?? []);
  conditions = computed(() => this.current.Problem()?.conditions ?? []);
  problemType = computed(() => this.current.Problem()?.stipulation.problemType ?? "-");
  leadsTo = computed(() => this.current.Problem()?.stipulation.stipulationType ?? "#");
  moves = computed(() => (this.current.Problem()?.stipulation.moves ?? 2).toString());

  setProblemType(value: "-" | "H" | "S" | "HS" | "R" | "HR") {
    this.current.SetProblemType(value);
  }

  setLeadsTo(value: "#" | "=" | "+" | "%" | "~" | "##" | "==" | "#=" | "!=" | "!#" | "00" | "ep" | "Zxy" | "x" | "##!" | "ct" | "<>" | "ctr" | "<>r" | "c81") {
    this.current.SetStipulationType(value);
  }

  setMoves(value: string) {
    const valueNum = parseFloat(value.replace(",", "."));
    if (isNaN(valueNum)) return;
    this.current.SetStipulationMoves(valueNum);
  }

  public twinCanBeDeleted = (twin: Twin) => {
    if (twin.TwinType === "Diagram" && this.twins()?.length <= 2) return false;
    return (this.twins()?.length >= 2);
  };

  public isDragDisabledForTwin = (twin: Twin): boolean => {
    const length = this.twins()?.length ?? 0;
    const hasDiagram = this.current.Problem()?.twins?.HasDiagram === true;
    const tooFewElements = length < 2;
    const tooFewElementsWDiagram = (hasDiagram && length <= 2);
    const isDiagram = twin.TwinType === "Diagram";
    return (tooFewElements || tooFewElementsWDiagram || isDiagram);
  };

  dropAuthor(event: CdkDragDrop<Author[]>) {
    moveItemInArray(this.authors(), event.previousIndex, event.currentIndex);
  }

  dropTwin(event: CdkDragDrop<Twin[]>) {
    if (event.currentIndex <= 0) event.currentIndex = 1;
    const array = this.twins();
    moveItemInArray(array, event.previousIndex, event.currentIndex);
    this.current.SetTwins(array);
  }

  dropCondition(event: CdkDragDrop<string[]>) {
    const array = this.conditions();
    moveItemInArray(array, event.previousIndex, event.currentIndex);
    this.current.SetConditions(array);
  }
}

/*

                                          {#= }       {#=  }
                                          {!= }       {!=  }
                                          {!# }       {!#  }
                                          {00 }       {00  }
                                          {%  }       {%   }
                                          {~  }       {~   }
                                          {ep }       {ep  }
          {SER-  }             {H  }      {#   }      {#   }
          {PSER- }             {S  }      {=   }      {=   }
  {m->} + {EXACT-} + {PHSER-}+ {R } + ( + {== } + ) + {==  } + n
          {SEMI- }             {HS}       {+  }       {+   }
          {RECI- }             {HR}       {Zxy}       {Zxy }
                                          {x  }       {x   }
                                          {## }       {##  }
                                          {##!}       {##! }
                                          {ct }       {ct  }
                                          {<> }       {<>  }
                                          {ctr}       {ctr }
                                          {<>r}       {<>r }
                                          {c81}       {c81 }
                                                      {Kxy }

                                                      {dia } + n{.5}
          {SER-  }                                  + {dia } + n
                                                      {a=>b} + n{.5}
          {SER-  }                                  + {a=>b} + n

  (m, n are the number of moves)

*/
