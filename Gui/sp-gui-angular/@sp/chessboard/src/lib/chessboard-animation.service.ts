import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type Animations = "rotateLeft" | "rotateRight";

@Injectable({
  providedIn: "root",
})
export class ChessboardAnimationService {
  onAnimate: Subject<Animations> = new Subject<Animations>();
  animate(animation: Animations) {
    this.onAnimate.next(animation);
  }

  constructor() { }
}
