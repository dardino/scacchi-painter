import { Injectable } from "@angular/core";
import { FileService, FolderItemInfo } from "@sp/host-bridge/src/lib/fileService";
import { getDropboxToken } from "./dropbox/dropboxcli";
import { TokenResponse } from "./oauth_funcs/pkce";

interface DropboxFileInfo {
  ".tag": "folder" | "file";
  id: string;
  name: string;
  path_display: string;
  path_lower: string;
}

@Injectable({
  providedIn: "root",
})
export class DropboxdbService implements FileService {

  constructor() {}
  private token: TokenResponse | null;

  private currentCursor: string | null = null;
  private pagesize = 1000;
  private hasMore = true;

  async authorize(): Promise<boolean> {
    const token = await getDropboxToken();
    this.token = token;
    return token != null;
  }

  saveFileContent(file: File, item: FolderItemInfo): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getFileContent(item: FolderItemInfo): Promise<File> {
    const urlToCall = "https://content.dropboxapi.com/2/files/download";
    const result = await fetch(urlToCall, {
      headers: {
        ...this.getHeaders(),
        "Dropbox-API-Arg": JSON.stringify({
          path: item.id,
        }),
      },
      method: "POST",
    });
    const blob = await result.blob();
    return new File([blob], item.itemName);
  }

  async enumContent(
    folder: string,
    ...extensions: string[]
  ): Promise<FolderItemInfo[]> {
    this.currentCursor = null;
    const result = await this.getList(folder, ...extensions);
    return result;
  }

  private async getList(
    folder: string,
    ...extensions: string[]
  ): Promise<FolderItemInfo[]> {
    const urlToCall =
      this.currentCursor?.length ?? 0 > 0
        ? "https://api.dropboxapi.com/2/files/list_folder/continue"
        : "https://api.dropboxapi.com/2/files/list_folder";
    const result = await fetch(urlToCall, {
      headers: { ...this.getHeaders(), "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        path: folder,
        limit: this.pagesize,
      }),
    });
    if (result.ok) {
      const respJson: {
        entries: DropboxFileInfo[];
        has_more: boolean;
        cursor: string;
      } = await result.json();
      this.currentCursor = respJson.cursor;
      this.hasMore = respJson.has_more;
      return respJson.entries.map((ent) => ({
        type: ent[".tag"],
        id: ent.id,
        fullPath: ent.path_display,
        itemName: ent.name,
      }));
    } else {
      return [];
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token?.access_token}`,
    };
  }
}
