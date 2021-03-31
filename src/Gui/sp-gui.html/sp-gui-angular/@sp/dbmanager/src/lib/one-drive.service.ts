import { Injectable } from "@angular/core";
import {
  FileService,
  FolderItemInfo,
} from "@sp/host-bridge/src/lib/fileService";
import { getOneDriveToken } from "./oauth_providers/onedrivecli";
import { Client } from "@microsoft/microsoft-graph-client";
import type { Drive, DriveItem } from "@microsoft/microsoft-graph-types";

@Injectable({
  providedIn: "root",
})
export class OneDriveService implements FileService {
  constructor() {}
  get sourceName() {
    return "onedrive" as const;
  }
  joinPath(...parts: string[]): string {
    return parts.join("/");
  }
  async enumContent(
    itemId: string | null,
    type: FolderItemInfo["type"],
    ...extensions: string[]
  ): Promise<FolderItemInfo[]> {
    console.log(itemId, type);
    const tokenReponse = await this.authorize();
    if (tokenReponse == null) return [];
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => tokenReponse.accessToken,
      },
    });

    if (type === "root") {
      const aw: { value?: Drive[] } = await client.api("/drives").get();
      return (aw.value ?? []).map<FolderItemInfo>((dir) => ({
        fullPath: `${dir.parentReference?.path}/${
          dir.description ?? dir.driveType ?? dir.id ?? "Personal"
        }`,
        id: dir.id ?? "",
        itemName: dir.description ?? dir.driveType ?? dir.id ?? "Personal",
        type: "drive",
      }));
    }

    if (type === "drive") {
      const aw: { value?: DriveItem[] } = await client
        .api("/drives/" + itemId + "/root/children")
        .get();
      return (aw.value ?? []).map<FolderItemInfo>((dir) => ({
        fullPath: `${dir.parentReference?.path}/${dir.name ?? dir.id}`,
        id: dir.id ?? "",
        itemName: dir.name ?? dir.id ?? "????",
        type: "folder",
      }));
    }

    if (type === "folder") {
      const aw: { value?: DriveItem[] } = await client
        .api("/drive/items/" + itemId + "/children")
        .get();
      return (aw.value ?? []).map<FolderItemInfo>((dir) => ({
        fullPath: `${dir.parentReference?.path ?? ""}/${dir.name ?? dir.id}`,
        id: dir.id ?? "",
        itemName: dir.name ?? dir.id ?? "????",
        type: dir.file ? "file" : "folder",
      }));
    }

    return [];
  }
  async getFileContent(item: FolderItemInfo): Promise<File> {
    const tokenReponse = await this.authorize();
    if (tokenReponse == null) {
      throw new Error("Unable to open file: " + item.fullPath);
    }
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => tokenReponse.accessToken,
      },
    });
    const aw = await client.api("/drive/items/" + item.id).get();
    const url = aw["@microsoft.graph.downloadUrl"];
    const blob = await (await fetch(url)).blob();
    return new File([blob], item.itemName);
  }
  async saveFileContent(
    file: File,
    item: FolderItemInfo
  ): Promise<FolderItemInfo | Error> {
    const tokenReponse = await this.authorize();
    if (tokenReponse == null) {
      throw new Error("Unable to open file: " + item.fullPath);
    }
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => tokenReponse.accessToken,
      },
    });
    try {
      const save: DriveItem = await client.api(`drive/items/${item.id}/content`).putStream(await file.text());
      console.log(save);
      item.itemName = save.name ?? item.itemName;
      item.fullPath = `${save.parentReference?.path ?? ""}/${save.name ?? save.id}`;
      item.id = save.id ?? item.id;
      return item;
    } catch(err) {
      return err;
    }
  }
  async authorize() {
    const token = await getOneDriveToken();
    return token;
  }
}
