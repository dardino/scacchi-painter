import { Injectable } from "@angular/core";

import {
  AvaliableFileServices,
  FileService,
  FolderItemInfo,
} from "@sp/host-bridge/src/lib/fileService";
import { AbortError } from "../AbortError";

@Injectable({
  providedIn: "root",
})
export class LocalDriveService implements FileService {
  constructor() { }
  sourceName: AvaliableFileServices = "local";
  async enumContent(
    itemID: string,
    itemType: "root" | "file" | "folder" | "drive",
    ...extensions: string[]
  ): Promise<FolderItemInfo[]> {
    return [];
  }

  async getFileContent(item: FolderItemInfo): Promise<File> {

    // if (itemID === "root_no_permission") return [];
    if (!window.showOpenFilePicker) {
      throw new Error("Your current device does not support the File System API. Try again on desktop Chrome!");
    }

    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Scacchi Painter X",
            accept: {
              "application/json": [".sp3"],
            },
          },
          {
            description: "Scacchi Painter 2",
            accept: {
              "text/xml": [".sp2"],
            },
          },
        ],
      });
      const allOk = await this.verifyPermission(fileHandle, true);
      if (!allOk) throw new Error("Cannot open a file!");

      const filecontent = await fileHandle.getFile();
      return filecontent;
    } catch(err) {
      console.log("🚀 ~ LocalDriveService ~ getFileContent ~ err:", err);
      throw new AbortError((err as Error).message);
    }
  }
  async saveFileContent(
    file: File,
    item: FolderItemInfo
  ): Promise<FolderItemInfo | Error> {
    const fileHandle = await window.showSaveFilePicker({ suggestedName: item.itemName });
    const fileStream = await fileHandle.createWritable();
    await fileStream.write(file);
    await fileStream.close();
    return item;
  }
  joinPath(...parts: string[]): string {
    throw new Error("Method not implemented.");
  }

  // fileHandle is a FileSystemFileHandle
  // withWrite is a boolean set to true if write

  async verifyPermission(fileHandle: FileSystemHandle, withWrite: boolean) {
    const opts = {} as any;
    if (withWrite) {
      opts.mode = "readwrite";
    }

    // Check if we already have permission, if so, return true.
    if ((await fileHandle.queryPermission(opts)) === "granted") {
      return true;
    }

    // Request permission to the file, if the user grants permission, return true.
    if ((await fileHandle.requestPermission(opts)) === "granted") {
      return true;
    }

    // The user did not grant permission, return false.
    return false;
  }
}
