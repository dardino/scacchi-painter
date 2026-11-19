import { Injectable } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import {
  FileService,
  FolderItemInfo,
} from "@sp/host-bridge/src/lib/fileService";

interface TauriLocalEntry {
  id: string;
  itemName: string;
  fullPath: string;
  entryType: "root" | "drive" | "folder" | "file";
}

@Injectable({
  providedIn: "root",
})
export class TauriLocalDriveService implements FileService<"local"> {
  readonly sourceName = "local" as const;
  private readonly lastFolderKey = "spx:tauri:last-local-folder";

  joinPath(...parts: string[]): string {
    const normalized = parts
      .filter(part => part.length > 0)
      .map(part => part.replace(/[\\/]+$/, ""));
    if (normalized.length === 0) return "";

    const first = normalized[0];
    const separator = first.includes("\\") && !first.includes("/") ? "\\" : "/";
    if (/^[A-Za-z]:[\\/]?$/.test(first) && separator === "\\") {
      return normalized.join("\\").replace(/\\{2,}/g, "\\");
    }
    return normalized.join(separator).replace(/\/{2,}/g, "/");
  }

  async enumContent(
    itemId: string,
    itemType: FolderItemInfo["type"],
  ): Promise<FolderItemInfo[]> {
    const entries = itemType === "root"
      ? await this.#listRoots()
      : await invoke<TauriLocalEntry[]>("list_local_folder", { path: itemId });
    return entries.map(entry => ({
      id: entry.id,
      itemName: entry.itemName,
      fullPath: entry.fullPath,
      type: entry.entryType,
    }));
  }

  async getFileContent(item: FolderItemInfo): Promise<File> {
    const bytes = await invoke<number[]>("read_local_file", { path: item.fullPath });
    return new File([new Uint8Array(bytes)], item.itemName, {
      type: item.itemName.toLowerCase().endsWith(".sp2")
        ? "application/xml"
        : "application/json",
    });
  }

  async saveFileContent(
    file: File,
    item: FolderItemInfo,
  ): Promise<FolderItemInfo | Error> {
    try {
      const targetPath = item.type === "folder"
        ? this.joinPath(item.fullPath, file.name)
        : item.fullPath
          ? item.fullPath
          : this.joinPath(item.fullPath, file.name);
      const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
      await invoke("write_local_file", { path: targetPath, bytes });
      return {
        ...item,
        type: "file",
        itemName: file.name,
        fullPath: targetPath,
        id: targetPath,
      };
    }
    catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  async #listRoots(): Promise<TauriLocalEntry[]> {
    return invoke<TauriLocalEntry[]>("list_local_roots");
  }
}
