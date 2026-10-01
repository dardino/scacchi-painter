/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from "@angular/core/testing";
import { requestGoogleDriveAccessToken } from "@sp/dbmanager/src/lib/oauth_providers/google-drive.cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleDriveService } from "./google-drive.service";

describe("GoogleDriveService", () => {
  let service: GoogleDriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(GoogleDriveService);
    delete (window as any).google;
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should expose the correct source name", () => {
    expect(service.sourceName).toBe("googledrive");
  });

  it("should request Drive scopes that allow both reading and saving project files", async () => {
    const requestAccessToken = vi.fn();
    const initTokenClient = vi.fn(() => ({ requestAccessToken }));
    (window as any).google = {
      accounts: {
        oauth2: {
          initTokenClient,
        },
      },
    };

    const resultPromise = requestGoogleDriveAccessToken();
    await Promise.resolve();
    const initOptions = ((initTokenClient as any).mock.calls[0]?.[0]) as { callback: (response: any) => void } | undefined;
    expect(initOptions).toBeDefined();
    if (!initOptions) {
      return;
    }

    initOptions.callback({ access_token: "gis-token", token_type: "Bearer", expires_in: 3600, scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly" });

    await expect(resultPromise).resolves.toMatchObject({ access_token: "gis-token" });
    const requestedScope = (initTokenClient as any).mock.calls[0]?.[0]?.scope;
    expect(initTokenClient).toHaveBeenCalledWith(expect.objectContaining({
      scope: expect.stringContaining("drive"),
    }));
    expect(requestedScope).toBeDefined();
    expect(requestedScope).toContain("drive");
    expect(requestedScope).not.toContain("drive.file");
  });

  it("should include folders and supported project files in the Drive root query", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ files: [] }),
    } as Response);

    localStorage.setItem("google_token", JSON.stringify({ access_token: "test-token", token_type: "Bearer" }));
    await service.enumContent("", "root", "sp2", "sp3");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://www.googleapis.com/drive/v3/files?"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
    const requestUrl = (fetchMock.mock.calls[0]?.[0] as string | URL | Request | undefined)?.toString?.() ?? String(fetchMock.mock.calls[0]?.[0] ?? "");
    const decodedUrl = decodeURIComponent(requestUrl);
    expect(decodedUrl).toContain("application/vnd.google-apps.folder");
    expect(decodedUrl).toContain(".sp2");
    expect(decodedUrl).toContain(".sp3");

    fetchMock.mockRestore();
  });

  it("should join path segments consistently", () => {
    expect(service.joinPath("folder", "subfolder", "file.sp3")).toBe("/folder/subfolder/file.sp3");
    expect(service.joinPath("", "folder", "")).toBe("/folder");
  });

  it("should authorize from an existing stored token", async () => {
    localStorage.setItem("google_token", JSON.stringify({ access_token: "test-google-token" }));

    await expect(service.authorize()).resolves.toBe(true);
    expect(service.sourceName).toBe("googledrive");
  });

  it("should request a Google Drive access token through Google Identity Services", async () => {
    const requestAccessToken = vi.fn();
    const initTokenClient = vi.fn(() => ({ requestAccessToken }));
    (window as any).google = {
      accounts: {
        oauth2: {
          initTokenClient,
        },
      },
    };

    const resultPromise = requestGoogleDriveAccessToken();
    await Promise.resolve();
    const initOptions = ((initTokenClient as any).mock.calls[0]?.[0]) as { callback: (response: any) => void } | undefined;
    expect(initOptions).toBeDefined();
    if (!initOptions) {
      return;
    }

    initOptions.callback({
      access_token: "gis-token",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "https://www.googleapis.com/auth/drive.file",
    });

    await expect(resultPromise).resolves.toMatchObject({
      access_token: "gis-token",
      token_type: "Bearer",
    });
    const requestedScope = (initTokenClient as any).mock.calls[0]?.[0]?.scope;
    expect(initTokenClient).toHaveBeenCalledWith(expect.objectContaining({
      client_id: expect.any(String),
      scope: expect.stringContaining("drive"),
    }));
    expect(requestedScope).toBeDefined();
    expect(requestedScope).toContain("drive");
    expect(requestedScope).not.toContain("drive.file");
    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: "consent" });
  });
});
