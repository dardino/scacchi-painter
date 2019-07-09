import { Component, OnInit, Input } from "@angular/core";
import { Piece, Columns, Traverse, GetSquareColor, SquareLocation } from "projects/sp-dbm/src/public-api";

@Component({
  selector: "lib-cbs",
  templateUrl: "./cbs.component.html",
  styleUrls: ["./cbs.component.styl"]
})
export class CbsComponent implements OnInit {
  public get classList() {
    const classlist = [];
    classlist.push(GetSquareColor(this.location));
    return classlist.join(" ");
  }

  @Input()
  public piece?: Piece;

  @Input()
  public location: SquareLocation;

  constructor() {}

  ngOnInit() {}
}
