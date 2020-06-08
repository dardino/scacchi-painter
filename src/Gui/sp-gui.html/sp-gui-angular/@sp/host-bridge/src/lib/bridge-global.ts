export interface BridgeGlobal {
  saveFile(content: File): Promise<string>;
  closeApp?(): void;
}
