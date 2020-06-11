export interface ISolver {
  stop(): Error | null;
  start(cbOut: (text: string) => void): Error | null;
}
