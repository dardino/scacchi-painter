import { Component, OnInit, Input, Output } from "@angular/core";
import { EventEmitter } from "protractor";

@Component({
  selector: "lib-toolbar-engine",
  templateUrl: "./toolbar-engine.component.html",
  styleUrls: ["./toolbar-engine.component.styl"],
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
    this.startSolve.emit("start");
  }
  stop() {
    this.startSolve.emit("stop");
  }

  ngOnInit(): void {}
}
