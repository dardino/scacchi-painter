import { Component, computed, inject, input } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { CurrentProblemService } from "@sp/dbmanager/src/lib/current-problem.service";
import { istructionRegExp, outlogRegExp } from "@sp/gui/src/app/constants/constants";
import { PreferencesService } from "@sp/gui/src/app/services/preferences.service";
import { Editor, NgxEditorModule, Toolbar } from "ngx-editor";
import { SpSolutionMoveComponent } from "../sp-solution-move/sp-solution-move.component";
import { ViewModes } from "../toolbar-engine/toolbar-engine.component";

@Component({
  selector: "lib-sp-solution-desc",
  templateUrl: "./sp-solution-desc.component.html",
  styleUrls: ["./sp-solution-desc.component.scss"],
  standalone: true,
  imports: [
    NgxEditorModule,
    FormsModule,
    SpSolutionMoveComponent,
  ],
})
export class SpSolutionDescComponent {
  editor: Editor;
  toolbar: Toolbar = [
    // default value
    ["bold", "italic"],
    ["underline", "strike"],
    ["code", "link"],
    // ['ordered_list', 'bullet_list'],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    // or, set options for link:
    // [{ link: { showOpenInNewTab: false } }, 'image'],
    ["text_color", "background_color"],
    ["align_left", "align_center", "align_right", "align_justify"],
    [/* 'horizontal_rule', */"format_clear", "indent", "outdent"],
    // ['superscript', 'subscript'],
    ["undo", "redo"],
  ];

  colorPresets = ["red", "#FF0000", "rgb(255, 0, 0)"];

  private current = inject(CurrentProblemService);

  showLog = input(false);
  viewMode = input<ViewModes>("html");

  private preferences = inject(PreferencesService);

  constructor() {
    // noop
    this.editor = new Editor({
      history: true,
      parseOptions: {
        preserveWhitespace: true,
      },
    });
  }

  firstMove = computed(() => this.current.Problem()?.startMoveN ?? 1);
  totalMoves = computed(() => this.current.Problem()?.stipulation.moves ?? 2);
  solutionFontSize = computed(() => `${Math.max(this.preferences.solutionFontSize(), 1)}rem`);
  rows = computed(() => this.current.Problem()?.jsonSolution ?? []);

  #solutionText = computed(() => this.current.Problem()?.textSolution ?? "");
  get solutionText() {
    return this.#solutionText();
  }

  set solutionText(txt: string) {
    this.current.SetTextSolution(txt);
  }

  #solutionHtml = computed(() => this.current.Problem()?.htmlSolution ?? "");
  get solutionHtml() {
    return this.#solutionHtml();
  }

  set solutionHtml(text: string) {
    this.current.SetHTMLSolution(text);
  }

  getClass(item: string) {
    item = item.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (istructionRegExp.test(item)) return "instruction";
    else if (outlogRegExp.test(item)) return "log";
    else return "solution";
  }

  ngModelOptions: NgModel["options"] = {
    updateOn: "blur",
  };

  mode: "inline" | "block" = "inline";
}
