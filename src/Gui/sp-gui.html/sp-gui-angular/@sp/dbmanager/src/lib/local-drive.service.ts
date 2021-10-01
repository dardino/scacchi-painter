import { Injectable } from "@angular/core";
import "../../FileSystem";
import {
  AvaliableFileServices,
  FileService,
  FolderItemInfo,
} from "@sp/host-bridge/src/lib/fileService";

@Injectable({
  providedIn: "root",
})
export class LocalDriveService implements FileService {
  constructor() {}
  sourceName: AvaliableFileServices = "local";
  async enumContent(
    itemID: string,
    itemType: "root" | "file" | "folder" | "drive",
    ...extensions: string[]
  ): Promise<FolderItemInfo[]> {
    if (itemID === "root_no_permission") return [];
    const havePermission = await this.getFolderPermission();
    if (!havePermission) {
      return [
        {
          id: "root_no_permission",
          type: "root",
          itemName: "Pemission denied!",
          fullPath: "no_permission"
        },
      ];
    } else {
      if (itemType === "drive") {
        const rootHandle = await window.showDirectoryPicker();
        const entries = await rootHandle.entries();
        const retEntries: FolderItemInfo[] = [];
        for await (const [key, value] of entries) {
          retEntries.push({
            fullPath: key,
            itemName: key,
            id: key,
            type: value.kind === "file" ? "file"
             : value.kind ==="directory" ? "folder" : "root"
          });
        }
      }
      return [

      ];
    }
  }
  getFileContent(item: FolderItemInfo): Promise<File> {
    throw new Error("Method not implemented.");
  }
  saveFileContent(
    file: File,
    item: FolderItemInfo
  ): Promise<FolderItemInfo | Error> {
    throw new Error("Method not implemented.");
  }
  joinPath(...parts: string[]): string {
    throw new Error("Method not implemented.");
  }


  private async getFolderPermission() {
    const reqFS = await window.navigator.permissions.query({ name: "persistent-storage" });
    if (reqFS.state === "denied") return false;
    if (reqFS.state === "granted") return true;
    if (reqFS.state === "prompt") return "prompt";
    return false;
  }
}
