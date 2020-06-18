import { Component, OnInit } from "@angular/core";

@Component({
  selector: "lib-piece-selector",
  templateUrl: "./piece-selector.component.html",
  styleUrls: ["./piece-selector.component.styl"],
})
export class PieceSelectorComponent implements OnInit {
  current = "";
  constructor() {}

  clickPiece(color: string, piece: string) {
    const newCurrent = `${color}_${piece}`;
    if (newCurrent !== this.current) this.current = `${color}_${piece}`;
    else this.current = "";
  }

  ngOnInit(): void {}
}
