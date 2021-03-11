export interface FolderItemInfo {
  type: "file" | "folder";
  itemName: string;
  fullPath: string;
  id: string;
}

export interface FileService {
  readonly sourceName: "local" | "dropbox" | "unknown";
  enumContent(
    folder: string,
    ...extensions: string[]
  ): Promise<FolderItemInfo[]>;
  getFileContent(item: FolderItemInfo): Promise<File>;
  saveFileContent(file: File, item: FolderItemInfo): Promise<FolderItemInfo | Error>;
}

export interface FileSelected {
  file: File;
  meta: FolderItemInfo;
  source: "local" | "dropbox" | "unknown";
}
