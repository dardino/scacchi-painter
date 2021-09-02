import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

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

  constructor() {}

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

  ngOnInit(): void {}
}
