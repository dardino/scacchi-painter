import { Injectable } from "@angular/core";
import { Client } from "@microsoft/microsoft-graph-client";
import type { DriveItem } from "@microsoft/microsoft-graph-types";
import {
  FileService,
  FolderItemInfo,
} from "@sp/host-bridge/src/lib/fileService";
import { OneDriveCliProvider } from "../../oauth_providers/onedrive.cli";

@Injectable({
  providedIn: "root",
})
export class OneDriveService implements FileService {
  get sourceName() {
    return "onedrive" as const;
  }

  joinPath(...parts: string[]): string {
    return parts.join("/");
  }

  async enumContent(
    itemId: string | null,
    type: FolderItemInfo["type"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...extensions: string[]
  ): Promise<FolderItemInfo[]> {
    const tokenReponse = await this.authorize();
    if (tokenReponse == null) return [];
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => tokenReponse.accessToken,
      },
    });

    const urlToCall = type === "root" ? "/me/drive/root/children" : `/me/drive/items/${itemId}/children`;

    try {
      const aw = await client.api(urlToCall).get() as { value?: DriveItem[] };
      console.log("🚀 ~ OneDriveService ~ enumContent ~ aw:", aw);
      return (aw.value ?? []).map<FolderItemInfo>(dir => ({
        fullPath: `${dir.parentReference?.path ?? "/me/drive/root/children"}/${
          dir.description || dir.name || dir.id || "Personal"
        }`,
        id: dir.id ?? "",
        itemName: dir.description || dir.name || dir.id || "Personal",
        type: dir.folder ? "folder" : dir.file ? "file" : "root",
      }));
    }
    catch (err) {
      console.error("Error fetching drives:", err);
      return [];
    }
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
    item: FolderItemInfo,
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
      const save: DriveItem = await client.api(`${item.fullPath}:/content`).putStream(await file.text());
      item.itemName = save.name ?? item.itemName;
      item.fullPath = `${save.parentReference?.path ?? ""}/${save.name ?? save.id}`;
      item.id = save.id ?? item.id;
      return item;
    }
    catch (err) {
      return err as Error;
    }
  }

  async authorize() {
    const token = await OneDriveCliProvider.getToken();
    return token;
  }
}
