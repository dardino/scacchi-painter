import { Problem } from "../../../sp-gui-angular/@sp/dbmanager/src/lib/models";
import { EOF } from "../../../sp-gui-angular/@sp/host-bridge/src/lib/bridge-global";

export interface ISolver {
  readonly running: boolean | null;
  readonly key: string;
  stop(): void;
  start(problem: Problem, cbOut: (text: string) => void, done: (eof: EOF) => void): void;
}
