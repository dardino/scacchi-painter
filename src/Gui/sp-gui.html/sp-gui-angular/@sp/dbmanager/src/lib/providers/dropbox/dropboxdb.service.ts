import { Injectable } from "@angular/core";
import {
  FileService,
  FolderItemInfo,
} from "@sp/host-bridge/src/lib/fileService";
import { TokenResponse } from "../../oauth_funcs/pkce";
import { setLocalAuthInfo } from "../../oauth_providers/const";
import { getDropboxToken } from "../../oauth_providers/dropboxcli";

interface DropboxFileInfo {
  ".tag": "folder" | "file";
  id: string;
  name: string;
  path_display: string;
  path_lower: string;
}
interface DropboxFileSavedInfo {
  name: string; // "Database Problemi Gabriele (1).sp2";
  path_lower: string; // "/sp_test_files/database problemi gabriele (1).sp2";
  path_display: string; // "/SP_TEST_FILES/Database Problemi Gabriele (1).sp2";
  id: string; // "id:fDSZAwF2EeQAAAAAAAB4Qw";
  client_modified: string; // "2021-03-11T15:25:39Z";
  server_modified: string; // "2021-03-11T15:25:40Z";
  rev: string; // "5bd446568a0ae060f1482";
  size: number; // 706507;
  is_downloadable: boolean; //true;
  content_hash: string; // "b3d449e5a836d3ad55c153d360466f6f5d4e3891209a9094504636c5091f1286";
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

  get sourceName() {
    return "dropbox" as const;
  }

  joinPath(...parts: string[]): string {
    return parts.join("/");
  }

  async authorize(): Promise<boolean> {
    const token = await getDropboxToken();
    this.token = token;
    return token != null;
  }

  async saveFileContent(
    file: File,
    item: FolderItemInfo
  ): Promise<FolderItemInfo | Error> {
    if (this.token == null) {
      await this.authorize();
    }
    const urlToCall = "https://content.dropboxapi.com/2/files/upload";
    const apiArg = JSON.stringify({
      path: item.id,
      mode: "overwrite",
      autorename: true,
      mute: true,
      strict_conflict: false,
    });
    const result = await fetch(urlToCall, {
      headers: {
        ...this.getHeaders(),
        "Dropbox-API-Arg": apiArg,
        "Content-Type": "application/octet-stream",
      },
      method: "POST",
      body: file,
    });
    if (result.status === 200) {
      const json = (await result.json()) as DropboxFileSavedInfo;
      return {
        fullPath: json.path_display,
        id: json.id,
        itemName: json.name,
        type: "folder",
      };
    } else {
      const message = await result.text();
      console.error(message);
      return new Error(message);
    }
  }

  async getFileContent(item: FolderItemInfo): Promise<File> {
    if (this.token == null) {
      await this.authorize();
    }
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
    if (this.token == null) {
      await this.authorize();
    }
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
      if (result.status === 400 || result.status === 401) {
        setLocalAuthInfo({ dropbox_token: "null" });
        this.authorize();
      }
      return [];
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token?.access_token}`,
    };
  }
}
