export interface FolderItemInfo {
  type: "file" | "folder";
  itemName: string;
  fullPath: string;
  id: string;
}

export interface FileService {
  enumContent(folder: string, ...extensions: string[]): Promise<FolderItemInfo[]>;
  getFileContent(item: FolderItemInfo): Promise<File>;
}
