import { Component, OnInit, Input } from '@angular/core';
import { Problem } from '@sp/dbmanager/src/lib/models';

/*https://stackblitz.com/edit/ngx-quill-example-btmh9i?file=src%2Fapp%2Fapp.component.ts*/

@Component({
  selector: 'lib-sp-solution-desc',
  templateUrl: './sp-solution-desc.component.html',
  styleUrls: ['./sp-solution-desc.component.styl'],
})
export class SpSolutionDescComponent implements OnInit {
  constructor() {}

  @Input()
  public problem: Problem | null;

  ngOnInit(): void {}

  get solution() {
    return this.problem?.textSolution ?? '';
  }
  set solution(txt: string) {
    if (this.problem) this.problem.textSolution = txt;
  }
  get solutionHTML() {
    return this.problem?.htmlSolution ?? '';
  }
  set solutionHTML(txt: string) {
    if (this.problem) this.problem.htmlSolution = txt;
  }

  get rows() {
    return this.problem?.textSolution.split('\n') ?? [];
  }

  getClass(item: string): string {
    item = item.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (istructionRegExp.test(item)) return 'instruction';
    else if (outlogRegExp.test(item)) return 'log';
    else return 'solution';
  }
}

const istructionRegExp = new RegExp(
  `^(Popeye|BeginProblem|Pieces|White|Black|Stipulation|Option|Twin|EndProblem|Condition|SetPlay|Executing|solution finished|Starting popeye).*$`
);
const outlogRegExp = new RegExp(
  `^(ERR:|Execute|Popeye|starting engine|Engine process|program exited).*$`
);


/*
 * BeginProblem
 * Pieces
 * White Kf2 Bf7 Pe6 Pg6 Pf5 Rg5 Pg4 Pc3 Pd2 Ph5
 * Black Pe7 Pg7 Pc5 Ka4 Pc4 Qf6 Pb5 Ph4 Rg3 Rc2 Sb2
 * Stipulation H#4
 * Option Try NoBoard Variations WhiteToPlay
 * Twin Move b5 a3
 * EndProblem
 * Execute command: pywin64.exe tmp
 * Popeye Windows-64Bit v4.79 (4207 MB)
 */
