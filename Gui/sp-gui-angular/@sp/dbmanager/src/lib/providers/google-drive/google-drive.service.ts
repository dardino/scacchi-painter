import { Injectable } from "@angular/core";
import {
  GOOGLE_DRIVE_AUTH_CONFIG,
  requestGoogleDriveAccessToken,
} from "@sp/dbmanager/src/lib/oauth_providers/google-drive.cli";
import { getLocalAuthInfo, setLocalAuthInfo } from "@sp/dbmanager/src/lib/oauth_providers/helpers";
import { FileService, FolderItemInfo } from "@sp/host-bridge/src/lib/fileService";

interface GoogleDriveToken {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  expiry_date?: number;
  scope?: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
}

@Injectable({
  providedIn: "root",
})
export class GoogleDriveService implements FileService<"googledrive"> {
  private token: GoogleDriveToken | null = null;

  get sourceName(): "googledrive" {
    return "googledrive";
  }

  joinPath(...parts: string[]): string {
    const normalized = parts
      .filter(Boolean)
      .map(part => part.replace(/^\/+|\/+$/g, ""))
      .filter(Boolean);

    if (normalized.length === 0) return "/";
    return `/${normalized.join("/")}`;
  }

  async authorize(): Promise<boolean> {
    const stored = getLocalAuthInfo().google_token;
    if (stored && stored !== "null") {
      try {
        const parsed = JSON.parse(stored) as GoogleDriveToken;
        if (parsed?.access_token) {
          this.token = parsed;
          return true;
        }
      }
      catch (_err) {
        localStorage.removeItem("google_token");
      }
    }

    if (!GOOGLE_DRIVE_AUTH_CONFIG.clientId) {
      console.warn("Google Drive OAuth client ID is not configured.");
      return false;
    }

    try {
      const token = await requestGoogleDriveAccessToken();
      const normalizedToken: GoogleDriveToken = {
        access_token: token.access_token ?? "",
        token_type: token.token_type ?? "Bearer",
        refresh_token: token.refresh_token ?? "",
        expires_in: token.expires_in ?? 3600,
        expiry_date: token.expiry_date ?? Date.now() + 3600_000,
        scope: token.scope ?? GOOGLE_DRIVE_AUTH_CONFIG.scopes.join(" "),
      };

      this.token = normalizedToken;
      setLocalAuthInfo({
        redirect: "googledrive",
        google_token: JSON.stringify(normalizedToken),
        google_code_verifier: "",
        state: "",
        return_url: `${location.pathname}${location.hash}`,
      });
      return true;
    }
    catch (error) {
      console.error("Google Drive authorization failed:", error);
      return false;
    }
  }

  async enumContent(
    itemId: string,
    type: FolderItemInfo["type"],
    ...extensions: string[]
  ): Promise<FolderItemInfo[]> {
    if (!this.token && !(await this.authorize())) {
      return [];
    }

    try {
      const query = this.buildQuery(itemId, type, extensions);
      const params = new URLSearchParams({
        q: query,
        fields: "files(id,name,mimeType,parents)",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
        pageSize: "1000",
      });

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.token?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Google Drive list failed: ${await response.text()}`);
      }

      const payload = await response.json() as { files?: Array<{ id?: string; name?: string; mimeType?: string; parents?: string[] }> };
      const files = payload.files ?? [];

      return files.map(file => ({
        type: file.mimeType === "application/vnd.google-apps.folder" ? "folder" : "file",
        itemName: file.name ?? "",
        fullPath: this.joinPath(file.parents?.[0] ?? itemId, file.name ?? ""),
        id: file.id ?? "",
      }));
    }
    catch (error) {
      console.error("Google Drive enum error:", error);
      localStorage.removeItem("google_token");
      this.token = null;
      return [];
    }
  }

  async getFileContent(item: FolderItemInfo): Promise<File> {
    if (!this.token && !(await this.authorize())) {
      throw new Error("Unable to authorize Google Drive");
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${item.id}?alt=media`, {
        headers: {
          Authorization: `Bearer ${this.token?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Google Drive read failed: ${await response.text()}`);
      }

      const blob = await response.blob();
      return new File([blob], item.itemName, {
        type: blob.type || "application/octet-stream",
      });
    }
    catch (error) {
      console.error("Google Drive read failed:", error);
      throw new Error("Google Drive read failed", { cause: error });
    }
  }

  async saveFileContent(
    file: File,
    item: FolderItemInfo,
  ): Promise<FolderItemInfo | Error> {
    if (!this.token && !(await this.authorize())) {
      return new Error("Unable to authorize Google Drive");
    }

    try {
      const formData = new FormData();
      const metadata = {
        name: item.itemName || file.name,
        mimeType: file.type || "application/octet-stream",
      };

      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" }),
      );
      formData.append("file", file);

      const isUpdate = !!item.id;
      const url = isUpdate
        ? `https://www.googleapis.com/upload/drive/v3/files/${item.id}?uploadType=multipart`
        : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

      const response = await fetch(url, {
        method: isUpdate ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${this.token?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        return new Error(`Google Drive save failed: ${await response.text()}`);
      }

      const json = await response.json() as GoogleDriveFile;
      return {
        id: json.id,
        itemName: json.name,
        fullPath: this.joinPath(item.fullPath, json.name),
        type: "file",
      };
    }
    catch (err) {
      return err as Error;
    }
  }

  private buildQuery(itemId: string, type: FolderItemInfo["type"], extensions: string[]): string {
    const parentQuery = type === "root"
      ? "('root' in parents or sharedWithMe)"
      : `'${itemId}' in parents`;

    const normalizedExtensions = [...new Set(extensions.map(ext => ext.replace(/^\./, "")))];
    const extensionFilter = normalizedExtensions.length > 0
      ? ` and ((mimeType = 'application/vnd.google-apps.folder') or ${normalizedExtensions.map(ext => `name contains '.${ext}'`).join(" or ")})`
      : " and mimeType = 'application/vnd.google-apps.folder'";

    return `${parentQuery} and trashed = false${extensionFilter}`;
  }
}
