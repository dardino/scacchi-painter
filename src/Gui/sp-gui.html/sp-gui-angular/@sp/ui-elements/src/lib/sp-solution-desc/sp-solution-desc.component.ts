
import { Component, Input } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { HalfMoveInfo } from "@dardino-chess/core";
import { CurrentProblemService } from "@sp/dbmanager/src/public-api";
import { istructionRegExp, outlogRegExp } from "@sp/gui/src/app/constants/constants";
import { PreferencesService } from "@sp/gui/src/app/services/preferences.service";
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { SpSolutionRowComponent } from "../sp-solution-row/sp-solution-row.component";
import { ViewModes } from "../toolbar-engine/toolbar-engine.component";

@Component({
    selector: "lib-sp-solution-desc",
    templateUrl: "./sp-solution-desc.component.html",
    styleUrls: ["./sp-solution-desc.component.less"],
    standalone: true,
    imports: [
    NgxEditorModule,
    FormsModule,
    SpSolutionRowComponent
]
})
export class SpSolutionDescComponent {
  editor: Editor;
  toolbar: Toolbar = [
    // default value
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'link'],
    // ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    // or, set options for link:
    //[{ link: { showOpenInNewTab: false } }, 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    [/*'horizontal_rule', */'format_clear', 'indent', 'outdent'],
    // ['superscript', 'subscript'],
    ['undo', 'redo'],
  ];
  colorPresets = ['red', '#FF0000', 'rgb(255, 0, 0)'];
  constructor(
    private preferences: PreferencesService,
    private problem: CurrentProblemService
  ) {
    // noop
    this.editor = new Editor({
      history: true,
      parseOptions: {
        preserveWhitespace: true,
      }
    });
  }

  @Input()
  showLog = false;

  @Input()
  viewMode: ViewModes = "html";

  get firstMove() {
    return Math.floor(this.totalMoves) === Math.ceil(this.totalMoves) ? 1 : 1.5;
  }

  get totalMoves() {
    return this.problem.Problem?.stipulation.moves ?? 1;
  }

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
    const changedText = this.problem.htmlSolution ?? "";
    return changedText;
  }
  set solutionHtml(text: string) {
    this.problem.SetHTMLSolution(text);
  }

  get rows(): HalfMoveInfo[] {
    return this.problem.Problem?.jsonSolution ?? [];
  }

  getClass(item: string) {
    item = item.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (istructionRegExp.test(item)) return "instruction";
    else if (outlogRegExp.test(item)) return "log";
    else return "solution";
  }

  ngModelOptions: NgModel["options"] = {
    updateOn: "blur"
  };

  mode: 'inline' | 'block' = 'inline';
}
