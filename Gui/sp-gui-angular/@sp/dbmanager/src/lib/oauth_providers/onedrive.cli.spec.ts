/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from "@angular/core/testing";
import type { AccountInfo } from "@azure/msal-browser";
import { LogService } from "@sp/gui/src/app/services/log.service";
import { webcrypto } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REQUESTS } from "./onedrive.config";

const mockClient = vi.hoisted(() => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  loginRedirect: vi.fn().mockResolvedValue(undefined),
  getAllAccounts: vi.fn().mockReturnValue([]),
  acquireTokenSilent: vi.fn().mockResolvedValue({ accessToken: "mock-access-token" }),
  handleRedirectPromise: vi.fn().mockResolvedValue(undefined),
}));

if (typeof globalThis.crypto === "undefined") {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}
if (typeof window !== "undefined" && typeof window.crypto === "undefined") {
  Object.defineProperty(window, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}

describe("MsalAuthService", () => {
  let service: any;
  let MsalAuthService: any;

  const mockAccount: AccountInfo = {
    homeAccountId: "test-account-id",
    localAccountId: "local-test-id",
    username: "test@example.com",
    environment: "login.microsoftonline.com",
    tenantId: "test-tenant",
    name: "Test User",
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@azure/msal-browser", () => {
      class MockPublicClientApplication {
        initialize = mockClient.initialize;
        loginRedirect = mockClient.loginRedirect;
        getAllAccounts = mockClient.getAllAccounts;
        acquireTokenSilent = mockClient.acquireTokenSilent;
        handleRedirectPromise = mockClient.handleRedirectPromise;
      }

      return { PublicClientApplication: MockPublicClientApplication };
    });

    const mod = await import("./onedrive.cli");
    MsalAuthService = mod.MsalAuthService;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [LogService, MsalAuthService],
    });

    service = TestBed.inject(MsalAuthService);
    vi.clearAllMocks();
    mockClient.getAllAccounts.mockReturnValue([]);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should initialize the MSAL client", async () => {
    await service.initialize();

    expect(mockClient.initialize).toHaveBeenCalledTimes(1);
  });

  it("should log in with redirect request scopes", async () => {
    await service.login();

    expect(mockClient.loginRedirect).toHaveBeenCalledTimes(1);
    expect(mockClient.loginRedirect).toHaveBeenCalledWith(REQUESTS.LOGIN);
  });

  it("should return null when no account is available", async () => {
    mockClient.getAllAccounts.mockReturnValue([]);

    await expect(service.getToken()).resolves.toBeNull();
  });

  it("should return the access token for the first account", async () => {
    mockClient.getAllAccounts.mockReturnValue([mockAccount]);
    mockClient.acquireTokenSilent.mockResolvedValue({ accessToken: "mock-access-token" });

    await expect(service.getToken()).resolves.toBe("mock-access-token");
    expect(mockClient.acquireTokenSilent).toHaveBeenCalledWith({
      account: mockAccount,
      ...REQUESTS.SILENT,
    });
  });

  it("should redirect and return null when silent token acquisition fails", async () => {
    mockClient.getAllAccounts.mockReturnValue([mockAccount]);
    mockClient.acquireTokenSilent.mockRejectedValue(new Error("silent failure"));

    await expect(service.getToken()).resolves.toBeNull();
    expect(mockClient.loginRedirect).toHaveBeenCalledWith(REQUESTS.LOGIN);
  });

  it("should delegate redirect handling", async () => {
    await service.handleRedirect();

    expect(mockClient.handleRedirectPromise).toHaveBeenCalledTimes(1);
  });
});
