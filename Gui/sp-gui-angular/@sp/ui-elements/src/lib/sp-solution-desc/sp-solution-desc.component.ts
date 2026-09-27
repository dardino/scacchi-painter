import { Component, computed, inject, input } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { HalfMoveInfo } from "@dardino-chess/core";
import { CurrentProblemService } from "@sp/dbmanager/src/lib/current-problem.service";
import { notEmpty } from "@sp/dbmanager/src/public-api";
import { istructionRegExp, outlogRegExp } from "@sp/gui/src/app/constants/constants";
import { PreferencesService } from "@sp/gui/src/app/services/preferences.service";
import { Editor, NgxEditorModule, Toolbar } from "ngx-editor";
import { DisplayMoveService } from "../services/displayMove.service";
import { SpSolutionMoveComponent } from "../sp-solution-move/sp-solution-move.component";
import { ViewModes } from "../toolbar-engine/toolbar-engine.component";
import { buildTreeMoves, TreeMove } from "./sp-solution-desc.helper";

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

  #current = inject(CurrentProblemService);
  #preferences = inject(PreferencesService);
  #moveDisplayService = inject(DisplayMoveService);

  jsonSolution = input<HalfMoveInfo[]>([]);
  onClickMove = (moveIndex: number) => {
    const myTreeNode = this.moveTree().find(treeNode => treeNode.id === moveIndex);
    if (!myTreeNode) return;
    const allMoves = myTreeNode.lineAge.split("|").map((id) => {
      const parsedId = parseInt(id, 10);
      const treeNode = this.moveTree().find(node => node.id === parsedId) ?? null;
      return treeNode?.move ?? null;
    }).filter(notEmpty);
    this.#moveDisplayService.applyMoves(allMoves);
  };

  viewMode = input<ViewModes>("html");

  constructor() {
    // noop
    this.editor = new Editor({
      history: true,
      parseOptions: {
        preserveWhitespace: true,
      },
    });
  }

  firstMove = computed(() => this.#current.Problem()?.startMoveN ?? 1);
  totalMoves = computed(() => this.#current.Problem()?.stipulation.moves ?? 2);
  solutionFontSize = computed(() => `${Math.max(this.#preferences.editorSolutionFontSize(), 1)}rem`);
  rows = computed(() => {
    return this.jsonSolution() ?? [];
  });

  moveTree = computed(() => {
    const rows = this.rows();
    const tree = buildTreeMoves(rows);
    return tree;
  });

  #solutionText = computed(() => this.#current.Problem()?.textSolution ?? "");
  get solutionText() {
    return this.#solutionText();
  }

  set solutionText(txt: string) {
    this.#current.SetTextSolution(txt);
  }

  #solutionHtml = computed(() => this.#current.Problem()?.htmlSolution ?? "");
  get solutionHtml() {
    return this.#solutionHtml();
  }

  set solutionHtml(text: string) {
    this.#current.SetHTMLSolution(text);
  }

  getClass(item: string) {
    item = item.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (istructionRegExp.test(item)) return "instruction";
    else if (outlogRegExp.test(item)) return "log";
    else return "solution";
  }

  lineBr = (move: TreeMove<HalfMoveInfo>) => {
    const prevByIndex = this.moveTree().find(node => node.id === move.id - 1) ?? null;
    const isNewLine = !move.lineAge.startsWith(prevByIndex?.lineAge ?? "");
    return move.parentId === null || move.move.zugzwang || isNewLine;
  };

  ngModelOptions: NgModel["options"] = {
    updateOn: "blur",
  };

  mode: "inline" | "block" = "inline";
}
