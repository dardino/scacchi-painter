import { Injectable } from "@angular/core";

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
    return [];
  }
  async getFileContent(item: FolderItemInfo): Promise<File> {
    // if (itemID === "root_no_permission") return [];
    if (!window.showOpenFilePicker){
      alert("Your current device does not support the File System API. Try again on desktop Chrome!");
      throw new Error("Your current device does not support the File System API. Try again on desktop Chrome!");
    }

    const fileToOpen = await window.showOpenFilePicker({
      types: [
        {
          description: "Scacchi Painter 2",
          accept: {
            "text/xml": [".sp2"],
          },
        },
        {
          description: "Scacchi Painter X",
          accept: {
            "application/json": [".sp3"],
          },
        },
      ],
    });
    const filecontent = await fileToOpen[0].getFile();
    return filecontent;
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
}
