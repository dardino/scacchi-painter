import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PreferencesService } from "@sp/gui/src/app/services/preferences.service";

@Component({
  selector: "lib-toolbar-engine",
  templateUrl: "./toolbar-engine.component.html",
  styleUrls: ["./toolbar-engine.component.less"],
})
export class ToolbarEngineComponent implements OnInit {
  @Input()
  public hideLabels: boolean;

  @Output()
  public startSolve = new EventEmitter();

  @Output()
  public stopSolve = new EventEmitter();

  @Input()
  isRunning: boolean;

  public get isMaxFont() {
    return this.fontSize >= 2;
  };
  public get isMinFont() {
    return this.fontSize <= 1;
  };

  public get fontSize() {
    return this.preferences.solutionFontSize;
  }
  public set fontSize(newVal: number) {
    this.preferences.solutionFontSize = Math.min(Math.max(newVal, 1), 2);
  }

  constructor(private preferences: PreferencesService) {

  }

  start() {
    console.log("[LOG] -> try to start process...");
    this.startSolve.emit("start");
  }
  stop() {
    console.log("[LOG] -> try to stop process...");
    this.stopSolve.emit("stop");
  }
  tryMove() {
    console.log("[LOG] -> start engine in try mode...");
    this.stopSolve.emit("try");
  }
  increaseFontSize() {
    this.fontSize += .1;
  }
  decreaseFontSize() {
    this.fontSize -= .1;
  }

  ngOnInit(): void {}
}
