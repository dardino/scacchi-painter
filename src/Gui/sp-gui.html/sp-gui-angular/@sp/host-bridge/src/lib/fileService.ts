export interface FolderItemInfo {
  type: "file" | "folder" | "drive" | "root";
  itemName: string;
  fullPath: string;
  id: string;
}

export type AvaliableFileServices = "local" | "dropbox" | "onedrive" | "unknown";

export interface FileService {
  readonly sourceName: AvaliableFileServices;
  enumContent(
    itemID: string,
    itemType: FolderItemInfo["type"],
    ...extensions: string[]
  ): Promise<FolderItemInfo[]>;
  getFileContent(item: FolderItemInfo): Promise<File>;
  saveFileContent(file: File, item: FolderItemInfo): Promise<FolderItemInfo | Error>;
  joinPath(...parts: string[]): string;
}


export interface FileSelected {
  file: File;
  meta: FolderItemInfo;
  source: AvaliableFileServices;
}

export type FolderSelected = Omit<FileSelected, "file">;

