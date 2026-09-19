import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type Animations = "rotate" | "translate" | "mirror";
export type ArgsByAnimation = {
  rotate: "left" | "right";
  translate: "up" | "down" | "left" | "right";
  mirror: "horizontal" | "vertical";
};

export type AnimationArgs<T extends Animations> = ArgsByAnimation[T];
export type AnimationFunction<T extends Animations> = (args: AnimationArgs<T>) => Promise<void>;

export type AnimationData<T extends Animations> = {
  animation: T;
  args: AnimationArgs<T>;
};

@Injectable({
  providedIn: "root",
})
export class ChessboardAnimationService {
  onAnimate: Subject<AnimationData<Animations>> = new Subject<AnimationData<Animations>>();
  onStop: Subject<void> = new Subject<void>();
  animate = <T extends Animations>(animation: T, args: AnimationArgs<T>): Promise<void> => {
    this.onAnimate.next({ animation, args });
    const animationDuration = parseFloat(getComputedStyle(document.body).getPropertyValue("--global-animation-duration")) * 1000;
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.onStop.next();
        resolve();
      }, animationDuration);
    });
  };

  constructor() { }
}
