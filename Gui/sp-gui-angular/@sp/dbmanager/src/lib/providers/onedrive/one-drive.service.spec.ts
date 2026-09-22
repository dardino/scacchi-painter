import { TestBed } from "@angular/core/testing";
import { AuthenticationResult } from "@azure/msal-browser";
import { FolderItemInfo } from "@sp/host-bridge/src/lib/fileService";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MsalAuthService } from "../../oauth_providers/onedrive.cli";
import { OneDriveService } from "./one-drive.service";

describe("OneDriveService", () => {
  let service: OneDriveService;
  let msalAuthServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    initialize: ReturnType<typeof vi.fn>;
    handleRedirect: ReturnType<typeof vi.fn>;
  };

  const mockToken: AuthenticationResult = {
    accessToken: "mocked-access-token-for-graph-api",
    account: {
      homeAccountId: "test-account-id",
      localAccountId: "local-test-id",
      username: "testuser@onedrive.com",
      environment: "login.microsoftonline.com",
      tenantId: "test-tenant",
    },
    authority: "https://login.microsoftonline.com/common",
    uniqueId: "unique-id",
    tenantId: "tenant-id",
    scopes: ["User.Read", "Files.ReadWrite"],
    idToken: "mock-id-token",
    idTokenClaims: {},
    fromCache: false,
    expiresOn: new Date(Date.now() + 3600000),
    tokenType: "Bearer",
    correlationId: "correlation-id",
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();

    msalAuthServiceMock = {
      getToken: vi.fn().mockResolvedValue(mockToken),
      login: vi.fn(),
      initialize: vi.fn().mockResolvedValue(undefined),
      handleRedirect: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: MsalAuthService, useValue: msalAuthServiceMock }],
    });
    service = TestBed.inject(OneDriveService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("sourceName", () => {
    it("should return 'onedrive' as source name", () => {
      expect(service.sourceName).toBe("onedrive");
    });
  });

  describe("joinPath", () => {
    it("should join path parts with forward slash", () => {
      const result = service.joinPath("folder", "subfolder", "file.txt");
      expect(result).toBe("folder/subfolder/file.txt");
    });

    it("should handle single path part", () => {
      const result = service.joinPath("file.txt");
      expect(result).toBe("file.txt");
    });

    it("should handle empty path parts", () => {
      const result = service.joinPath();
      expect(result).toBe("");
    });

    it("should handle root paths", () => {
      const result = service.joinPath("/drives/root:", "folder");
      expect(result).toBe("/drives/root:/folder");
    });
  });

  describe("authorize", () => {
    it("should return the token from MsalAuthService when available", async () => {
      const result = await service.authorize();

      expect(result).toBe(mockToken);
      expect(msalAuthServiceMock.getToken).toHaveBeenCalledTimes(1);
    });

    it("should trigger login and return null when the token is unavailable", async () => {
      msalAuthServiceMock.getToken.mockResolvedValueOnce(null);

      const result = await service.authorize();

      expect(result).toBeNull();
      expect(msalAuthServiceMock.login).toHaveBeenCalledTimes(1);
    });
  });

  describe("enumContent", () => {
    it("should return an empty array when authorization fails", async () => {
      msalAuthServiceMock.getToken.mockResolvedValueOnce(null);

      const result = await service.enumContent(null, "root");

      expect(result).toEqual([]);
    });
  });

  describe("getFileContent", () => {
    it("should throw an error when authorization fails", async () => {
      msalAuthServiceMock.getToken.mockResolvedValueOnce(null);

      const mockItem: FolderItemInfo = {
        fullPath: "/drives/root:/test.txt",
        id: "test-id",
        itemName: "test.txt",
        type: "file",
      };

      await expect(service.getFileContent(mockItem)).rejects.toThrowError(
        "Unable to open file: /drives/root:/test.txt",
      );
    });
  });

  describe("saveFileContent", () => {
    it("should throw an error when authorization fails", async () => {
      msalAuthServiceMock.getToken.mockResolvedValueOnce(null);

      const mockFile = new File(["test content"], "test.txt");
      const mockItem: FolderItemInfo = {
        fullPath: "/drives/root:/test.txt",
        id: "test-id",
        itemName: "test.txt",
        type: "file",
      };

      await expect(
        service.saveFileContent(mockFile, mockItem),
      ).rejects.toThrowError("Unable to open file: /drives/root:/test.txt");
    });
  });
});
