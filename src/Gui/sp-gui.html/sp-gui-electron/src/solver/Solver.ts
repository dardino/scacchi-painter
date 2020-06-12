export interface ISolver {
  stop(): Error | null;
  start(cbOut: (text: string) => void, done: () => void): Error | null;
}
