import { ISolver } from "./Solver";

export class PopeyeSolver implements ISolver {
  stop(): Error {
    throw new Error("Method not implemented.");
  }
  start(cbOut: (text: string) => void, done: () => void): Error {
    throw new Error("Method not implemented.");
  }
}
