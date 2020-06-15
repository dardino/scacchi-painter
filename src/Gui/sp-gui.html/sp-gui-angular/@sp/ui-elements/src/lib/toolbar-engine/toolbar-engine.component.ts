import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "lib-toolbar-engine",
  templateUrl: "./toolbar-engine.component.html",
  styleUrls: ["./toolbar-engine.component.styl"],
})
export class ToolbarEngineComponent implements OnInit {

  @Input()
  hideLabels: boolean;

  isRunning = false;

  constructor() {}

  start() {}
  stop() {}

  ngOnInit(): void {}
}
