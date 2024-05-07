import { Component, Input, OnInit } from "@angular/core";
import { CurrentProblemService } from "@sp/dbmanager/src/public-api";
import { istructionRegExp, outlogRegExp } from "@sp/gui/src/app/constants/constants";
import { PreferencesService } from "@sp/gui/src/app/services/preferences.service";
import { ViewModes } from "../toolbar-engine/toolbar-engine.component";

/*https://stackblitz.com/edit/ngx-quill-example-btmh9i?file=src%2Fapp%2Fapp.component.ts*/

@Component({
  selector: "lib-sp-solution-desc",
  templateUrl: "./sp-solution-desc.component.html",
  styleUrls: ["./sp-solution-desc.component.less"],
})
export class SpSolutionDescComponent implements OnInit {
  constructor(
    private preferences: PreferencesService,
    private problem: CurrentProblemService
  ) {
    // noop
  }

  @Input()
  showLog: boolean = false;

  @Input()
  viewMode: ViewModes = "html";

  ngOnInit(): void { /* */ }

  public get solutionFontSize() {
    return `${Math.max(this.preferences.solutionFontSize, 1)}rem`;
  }

  get solution() {
    return this.problem.textSolution ?? "";
  }
  set solution(txt: string) {
    this.problem.SetTextSolution(txt);
  }

  get solutionHtml() {
    return this.problem.htmlSolution.map(gt => gt.outerHTML).join("") ?? "";
  }
  set solutionHtml(text: string) {
    this.problem.SetHTMLSolution(text);
  }

  get rows(): Array<{ row: string; className: "instruction" | "log" | "solution" }> {
    return this.problem.textSolution.split("\n").map(row => ({
      row,
      className: this.getClass(row)
    })) ?? [];
  }

  getClass(item: string) {
    item = item.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (istructionRegExp.test(item)) return "instruction";
    else if (outlogRegExp.test(item)) return "log";
    else return "solution";
  }
}
