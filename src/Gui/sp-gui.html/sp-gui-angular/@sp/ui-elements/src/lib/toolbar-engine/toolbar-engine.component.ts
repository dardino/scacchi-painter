
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { PreferencesService } from "@sp/gui/src/app/services/preferences.service";
import { SpToolbarButtonComponent } from "../sp-toolbar-button/sp-toolbar-button.component";

export type ViewModes = "txt" | "html" | "both";
const mapViewModeToIcons: Record<ViewModes, { icon: string, nextM: ViewModes }> = {
  both: { icon: "abc", nextM: "txt" },
  html: { icon: "vertical_split", nextM: "both" },
  txt : { icon: "code", nextM: "html" },
};

@Component({
    selector: "lib-toolbar-engine",
    templateUrl: "./toolbar-engine.component.html",
    styleUrls: ["./toolbar-engine.component.less"],
    imports: [
    MatToolbarModule,
    SpToolbarButtonComponent
],
    standalone: true
})
export class ToolbarEngineComponent {
  private preferences = inject(PreferencesService);

  @Input()
  public hideLabels: boolean;

  @Output()
  public startSolve = new EventEmitter<"start" | "try">();

  @Output()
  public stopSolve = new EventEmitter<"stop">();

  @Output()
  public toggleLog = new EventEmitter<void>();

  @Output()
  public toggleEditor = new EventEmitter<ViewModes>();

  @Input()
  isRunning: boolean;
  @Input()
  fullLog: boolean;
  @Input()
  viewMode: ViewModes;

  public get isMaxFont() {
    return this.fontSize >= 2;
  }

  public get isMinFont() {
    return this.fontSize <= 1;
  }

  public get logIcon() {
    return this.fullLog ? "compress" : "expand";
  }

  public get fontSize() {
    return this.preferences.solutionFontSize;
  }
  public set fontSize(newVal: number) {
    this.preferences.solutionFontSize = Math.min(Math.max(newVal, 1), 2);
  }

  public get viewModeIcon() {
    return mapViewModeToIcons[this.viewMode]?.icon;
  }

  start() {
    console.warn("[LOG] -> try to start process...");
    this.startSolve.emit("start");
  }
  stop() {
    console.warn("[LOG] -> try to stop process...");
    this.stopSolve.emit("stop");
  }
  tryMove() {
    console.warn("[LOG] -> start engine in try mode...");
    this.startSolve.emit("try");
  }
  increaseFontSize() {
    this.fontSize += .1;
  }
  decreaseFontSize() {
    this.fontSize -= .1;
  }
  toggleEngineLog() {
    this.toggleLog.emit();
  }
  toggleEditorview() {
    this.toggleEditor.emit(mapViewModeToIcons[this.viewMode].nextM);
  }

}
