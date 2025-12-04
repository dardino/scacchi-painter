
import { Component, EventEmitter, Output, inject, computed, input } from "@angular/core";
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
    styleUrls: ["./toolbar-engine.component.scss"],
    imports: [
    MatToolbarModule,
    SpToolbarButtonComponent
],
    standalone: true
})
export class ToolbarEngineComponent {
  private preferences = inject(PreferencesService);

  hideLabels = input<boolean>(false);

  @Output()
  public startSolve = new EventEmitter<"start" | "try">();

  @Output()
  public stopSolve = new EventEmitter<"stop">();

  @Output()
  public toggleLog = new EventEmitter<void>();

  @Output()
  public toggleEditor = new EventEmitter<ViewModes>();

  isRunning = input<boolean>(false);
  fullLog = input<boolean>(false);
  viewMode = input<ViewModes>("both");

  isMaxFont = computed(() => this.fontSize() >= 2);
  isMinFont = computed(() => this.fontSize() <= 1);
  logIcon = computed(() => this.fullLog() ? "compress" : "expand");
  fontSize = computed(() => this.preferences.solutionFontSize);
  viewModeIcon = computed(() => mapViewModeToIcons[this.viewMode()]?.icon);

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
    this.preferences.solutionFontSize = Math.min(Math.max(this.preferences.solutionFontSize + 0.1, 1), 2);
  }
  decreaseFontSize() {
    this.preferences.solutionFontSize = Math.min(Math.max(this.preferences.solutionFontSize - 0.1, 1), 2);
  }
  toggleEngineLog() {
    this.toggleLog.emit();
  }
  toggleEditorview() {
    this.toggleEditor.emit(mapViewModeToIcons[this.viewMode()].nextM);
  }

}
