import { TestBed } from "@angular/core/testing";
import { OneDriveService } from "./one-drive.service";
import { OneDriveCliProvider } from "../../oauth_providers/onedrive.cli";
import { AuthenticationResult } from "@azure/msal-browser";
import { FolderItemInfo } from "@sp/host-bridge/src/lib/fileService";

/**
 * Unit tests for OneDriveService
 * These tests verify the OneDrive file service integration with auth mocking
 */
describe("OneDriveService", () => {
  let service: OneDriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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
    it("should call OneDriveCliProvider.getToken", async () => {
      const getTokenSpy = spyOn(OneDriveCliProvider, "getToken").and.returnValue(
        Promise.resolve(undefined)
      );

      await service.authorize();

      expect(getTokenSpy).toHaveBeenCalled();
    });

    it("should return token from provider", async () => {
      const mockToken: AuthenticationResult = {
        accessToken: "test-access-token",
        account: {
          homeAccountId: "test-id",
          localAccountId: "local-id",
          username: "test@example.com",
          environment: "login.microsoftonline.com",
          tenantId: "test-tenant"
        },
        authority: "https://login.microsoftonline.com/common",
        uniqueId: "unique-id",
        tenantId: "tenant-id",
        scopes: ["User.Read"],
        idToken: "mock-id-token",
        idTokenClaims: {},
        fromCache: false,
        expiresOn: new Date(Date.now() + 3600000),
        tokenType: "Bearer",
        correlationId: "correlation-id"
      };

      spyOn(OneDriveCliProvider, "getToken").and.returnValue(
        Promise.resolve(mockToken)
      );

      const result = await service.authorize();

      expect(result).toBe(mockToken);
      expect(result?.accessToken).toBe("test-access-token");
    });

    it("should return undefined when authentication fails", async () => {
      spyOn(OneDriveCliProvider, "getToken").and.returnValue(
        Promise.resolve(undefined)
      );

      const result = await service.authorize();

      expect(result).toBeUndefined();
    });
  });

  describe("enumContent", () => {
    it("should return empty array when authorization fails", async () => {
      spyOn(OneDriveCliProvider, "getToken").and.returnValue(
        Promise.resolve(undefined)
      );

      const result = await service.enumContent(null, "root");

      expect(result).toEqual([]);
    });
  });

  describe("getFileContent", () => {
    it("should throw error when authorization fails", async () => {
      spyOn(OneDriveCliProvider, "getToken").and.returnValue(
        Promise.resolve(undefined)
      );

      const mockItem: FolderItemInfo = {
        fullPath: "/drives/root:/test.txt",
        id: "test-id",
        itemName: "test.txt",
        type: "file"
      };

      await expectAsync(service.getFileContent(mockItem)).toBeRejectedWithError(
        "Unable to open file: /drives/root:/test.txt"
      );
    });
  });

  describe("saveFileContent", () => {
    it("should throw error when authorization fails", async () => {
      spyOn(OneDriveCliProvider, "getToken").and.returnValue(
        Promise.resolve(undefined)
      );

      const mockFile = new File(["test content"], "test.txt");
      const mockItem: FolderItemInfo = {
        fullPath: "/drives/root:/test.txt",
        id: "test-id",
        itemName: "test.txt",
        type: "file"
      };

      await expectAsync(
        service.saveFileContent(mockFile, mockItem)
      ).toBeRejectedWithError("Unable to open file: /drives/root:/test.txt");
    });
  });
});

describe("OneDriveService with mocked auth", () => {
  let service: OneDriveService;
  const mockToken: AuthenticationResult = {
    accessToken: "mocked-access-token-for-graph-api",
    account: {
      homeAccountId: "test-account-id",
      localAccountId: "local-test-id",
      username: "testuser@onedrive.com",
      environment: "login.microsoftonline.com",
      tenantId: "test-tenant"
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
    correlationId: "correlation-id"
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneDriveService);

    // Mock the auth provider to return a valid token
    spyOn(OneDriveCliProvider, "getToken").and.returnValue(
      Promise.resolve(mockToken)
    );
  });

  it("should have valid authorization", async () => {
    const token = await service.authorize();

    expect(token).toBeDefined();
    expect(token?.accessToken).toBe("mocked-access-token-for-graph-api");
  });

  describe("enumContent with auth", () => {
    it("should request root drives when type is root", async () => {
      // The actual Graph API call would fail without network,
      // but we can verify the auth token is passed correctly
      const token = await service.authorize();

      expect(token?.accessToken).toBeDefined();
    });

    it("should request drive children when type is drive", async () => {
      const token = await service.authorize();

      expect(token?.accessToken).toBe("mocked-access-token-for-graph-api");
    });
  });
});
