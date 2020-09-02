import { Component, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Author } from "@sp/dbmanager/src/lib/models";
import {
  CurrentProblemService,
  ProblemTypes,
  EndingTypes,
} from "@sp/dbmanager/src/public-api";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";

@Component({
  selector: "lib-problem-definitions",
  templateUrl: "./problem-definitions.component.html",
  styleUrls: ["./problem-definitions.component.styl"],
})
export class ProblemDefinitionsComponent implements OnInit {
  public get completeDesc() {
    return this.current.Problem?.stipulation.completeStipulationDesc;
  }
  public get authors(): Author[] {
    return this.current.Problem?.authors ?? [];
  }
  public set authors(v: Author[]) {
    if (this.current.Problem) this.current.Problem.authors = v;
  }

  public get twins(): Twin[] {
    return this.current.Problem?.twins.TwinList ?? [];
  }
  public set twins(v: Twin[]) {
    if (this.current.Problem) this.current.Problem.twins.TwinList = v;
  }

  public get conditions(): string[] {
    return this.current.Problem?.conditions ?? [];
  }
  public set conditions(v: string[]) {
    if (this.current.Problem) this.current.Problem.conditions = v;
  }

  public get problemType(): ProblemTypes {
    return this.current.Problem?.stipulation.problemType ?? "-";
  }
  public set problemType(v: ProblemTypes) {
    if (this.current.Problem) this.current.Problem.stipulation.problemType = v;
  }
  public get leadsTo(): EndingTypes {
    return this.current.Problem?.stipulation.stipulationType ?? "#";
  }
  public set leadsTo(v: EndingTypes) {
    if (this.current.Problem) this.current.Problem.stipulation.stipulationType = v;
  }
  public get moves(): number {
    return this.current.Problem?.stipulation.moves ?? 2;
  }
  public set moves(v: number) {
    if (this.current.Problem) this.current.Problem.stipulation.moves = v;
  }

  constructor(private current: CurrentProblemService) {}

  ngOnInit(): void {}

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
