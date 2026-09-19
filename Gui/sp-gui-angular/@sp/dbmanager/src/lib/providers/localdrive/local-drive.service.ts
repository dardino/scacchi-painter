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
  sourceName: AvaliableFileServices = "local";
  async enumContent(
    _itemID: string,
    _itemType: "root" | "file" | "folder" | "drive",
    ..._extensions: string[]
  ): Promise<FolderItemInfo[]> {
    return [
      { id: "openFile", fullPath: "openFile", itemName: "Click to pick a file ...", type: "file" },
    ];
  }

  #fileHandle: FileSystemFileHandle | null = null;

  /**
   * This method triggers a file input dialog to allow the user to pick a file.
   * is intended to be used as a fallback when the File System API is not available.
   * @returns A promise that resolves with the selected file.
   */

  #pickFileWithInput = async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".sp2,.sp3";
      input.onchange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          resolve(target.files[0]);
        }
        else {
          reject(new AbortError("No file selected"));
        }
      };
      input.click();
    });
  };

  /**
   * Retrieves the file handle associated with the given folder item from IndexedDB, if it exists.
   * @param item The folder item information for which to retrieve the file handle from IndexedDB.
   * @returns A promise that resolves with the file handle if found, or null otherwise.
   */
  async #getFileHandleFromIndexedDB(item: FolderItemInfo): Promise<FileSystemFileHandle | null> {
    if (!("indexedDB" in window)) {
      return null;
    }
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open("spx_filehandles", 1);

        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains("filehandles")) {
            database.createObjectStore("filehandles");
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB"));
      });

      const handle = await new Promise<FileSystemFileHandle | null>((resolve) => {
        const transaction = db.transaction("filehandles", "readonly");
        const store = transaction.objectStore("filehandles");
        const request = store.get(item.id + "|" + item.fullPath + "|" + item.itemName);

        request.onsuccess = () => {
          resolve((request.result as FileSystemFileHandle | null) ?? null);
        };

        request.onerror = () => resolve(null);
      });

      db.close();
      return handle;
    }
    catch {
      return null;
    }
  }

  async #saveFileHandleToIndexedDB(item: FolderItemInfo, fileHandle: FileSystemFileHandle): Promise<void> {
    if (!("indexedDB" in window)) {
      return;
    }

    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open("spx_filehandles", 1);

        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains("filehandles")) {
            database.createObjectStore("filehandles");
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB"));
      });

      await new Promise<void>((resolve) => {
        const transaction = db.transaction("filehandles", "readwrite");
        const store = transaction.objectStore("filehandles");
        const request = store.put(fileHandle, item.id + "|" + item.fullPath + "|" + item.itemName);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });

      db.close();
    }
    catch {
      // no-op: persistence is best-effort only for file handles
    }
  }

  #askForFileHandle = async (_item: FolderItemInfo | null): Promise<FileSystemFileHandle> => {
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
    return fileHandle;
  };

  /**
   * Downloads a file using a hidden anchor element.
   * This method creates a temporary anchor element to trigger the download of the specified file.
   * Is intended as a fallback mechanism when the File System API is not available.
   * @param file The file to download.
   * @param item The folder item information.
   */
  #downloadFileWithAnchor = async (file: File, item: FolderItemInfo): Promise<void> => {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = item.itemName || file.name;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  async getFileContent(item: FolderItemInfo): Promise<File> {
    if (item.type === "file" && item.id === "openFile") {
      item.id = Math.random().toString(36).substring(2);
      item.fullPath = "";
      item.itemName = "";
    }
    if (!window.showOpenFilePicker) {
      // fallback to using the input element for file selection
      console.warn("Your current device does not support the File System API. Try again on desktop Chrome! Now Switching to fallback mode.");
      const file2open = await this.#pickFileWithInput();
      item.fullPath = file2open.name;
      item.itemName = file2open.name;
      item.type = "file";
      item.id = item.fullPath;
      return file2open;
    }

    try {
      const fileHandleFromIndexedDB = await this.#getFileHandleFromIndexedDB(item);
      if (fileHandleFromIndexedDB) {
        this.#fileHandle = fileHandleFromIndexedDB;
      }
      else {
        this.#fileHandle = await this.#askForFileHandle(item);
      }

      await this.#saveFileHandleToIndexedDB(item, this.#fileHandle);

      const allOk = await this.verifyPermission(this.#fileHandle, true);
      if (!allOk) throw new Error("Cannot open a file!");

      const filecontent = await this.#fileHandle.getFile();

      return filecontent;
    }
    catch (err) {
      this.#fileHandle = null;
      throw new AbortError((err as Error).message);
    }
  }

  async saveFileContent(
    file: File,
    item: FolderItemInfo,
  ): Promise<FolderItemInfo | Error> {
    if (!window.showSaveFilePicker) {
      // fallback mechanism when the File System API is not available
      console.warn("Your current device does not support the File System API. Falling back to download via anchor element.");
      await this.#downloadFileWithAnchor(file, item);
      return item;
    }

    if (!this.#fileHandle) {
      this.#fileHandle = await window.showSaveFilePicker({ suggestedName: item.itemName });
    }
    const fileStream = await this.#fileHandle.createWritable();
    await fileStream.write(file);
    await fileStream.close();
    return item;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  joinPath(...parts: string[]): string {
    throw new Error("Method not implemented.");
  }

  // fileHandle is a FileSystemFileHandle
  // withWrite is a boolean set to true if write

  async verifyPermission(fileHandle: FileSystemHandle, withWrite: boolean) {
    const opts = {} as FileSystemHandlePermissionDescriptor;
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
