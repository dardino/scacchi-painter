import { Component, Input, OnInit } from "@angular/core";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { istructionRegExp, outlogRegExp } from "@sp/gui/src/app/constants/constants";
import { PreferencesService } from "@sp/gui/src/app/services/preferences.service";

/*https://stackblitz.com/edit/ngx-quill-example-btmh9i?file=src%2Fapp%2Fapp.component.ts*/

@Component({
  selector: "lib-sp-solution-desc",
  templateUrl: "./sp-solution-desc.component.html",
  styleUrls: ["./sp-solution-desc.component.less"],
})
export class SpSolutionDescComponent implements OnInit {
  constructor(private preferences: PreferencesService) {}

  @Input()
  public problem: Problem | null;

  ngOnInit(): void { /* */ }

  public get solutionFontSize() {
    return `${Math.max(this.preferences.solutionFontSize, 1)}rem`;
  }

  get solution() {
    return this.problem?.textSolution ?? "";
  }
  set solution(txt: string) {
    if (this.problem) this.problem.textSolution = txt;
  }

  get rows() {
    return this.problem?.textSolution.split("\n") ?? [];
  }

  getClass(item: string): string {
    item = item.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (istructionRegExp.test(item)) return "instruction";
    else if (outlogRegExp.test(item)) return "log";
    else return "solution";
  }
}
