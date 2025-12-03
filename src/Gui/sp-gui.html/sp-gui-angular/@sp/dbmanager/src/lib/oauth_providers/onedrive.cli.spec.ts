import { AccountInfo } from "@azure/msal-browser";
import { OneDriveCliProvider } from "./onedrive.cli";
import { describe, expect, it, vi } from "vitest";

/**
 * Unit tests for OneDriveCliProvider
 * These tests focus on testing the public interface of the OneDriveCliProvider
 * Tests avoid triggering actual MSAL authentication calls which would timeout in test environment.
 * SKIP: MSAL requires actual browser crypto API which is not available in jsdom
 */
describe.skip("OneDriveCliProvider", () => {

  const mockAccountInfo: AccountInfo = {
    homeAccountId: "test-account-id",
    localAccountId: "local-test-id",
    username: "test@example.com",
    environment: "test-env",
    tenantId: "test-tenant",
    name: "Test User"
  };

  describe("showWelcomeMessage", () => {
    it("should log welcome message with username", () => {
      const consoleSpy = vi.spyOn(console, "warn");

      OneDriveCliProvider.showWelcomeMessage(mockAccountInfo);

      expect(consoleSpy).toHaveBeenCalledWith("Welcome test@example.com");
    });

    it("should handle accounts with different username formats", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const accountWithDifferentUsername: AccountInfo = {
        ...mockAccountInfo,
        username: "admin@company.onmicrosoft.com"
      };

      OneDriveCliProvider.showWelcomeMessage(accountWithDifferentUsername);

      expect(consoleSpy).toHaveBeenCalledWith("Welcome admin@company.onmicrosoft.com");
    });

    it("should handle accounts with empty username", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const accountWithEmptyUsername: AccountInfo = {
        ...mockAccountInfo,
        username: ""
      };

      OneDriveCliProvider.showWelcomeMessage(accountWithEmptyUsername);

      expect(consoleSpy).toHaveBeenCalledWith("Welcome ");
    });
  });

  describe("signIn methods", () => {
    it("should return a promise for popup method", () => {
      // This only verifies the method returns a promise, not that it completes
      const signInPromise = OneDriveCliProvider.signIn("popup");

      expect(signInPromise).toBeInstanceOf(Promise);
    });

    it("should return a promise for redirect method", () => {
      // This only verifies the method returns a promise, not that it completes
      const signInPromise = OneDriveCliProvider.signIn("redirect");

      expect(signInPromise).toBeInstanceOf(Promise);
    });
  });

  describe("getTokenPopup", () => {
    it("should return a promise", () => {
      const request = { scopes: ["User.Read"] };

      const tokenPromise = OneDriveCliProvider.getTokenPopup(request);

      expect(tokenPromise).toBeInstanceOf(Promise);
    });

    it("should accept request with multiple scopes", () => {
      const request = { scopes: ["User.Read", "Files.ReadWrite", "openid", "profile"] };

      const tokenPromise = OneDriveCliProvider.getTokenPopup(request);

      expect(tokenPromise).toBeInstanceOf(Promise);
    });
  });

  describe("getTokenRedirect", () => {
    it("should return a promise", () => {
      const request = { scopes: ["User.Read"] };

      const tokenPromise = OneDriveCliProvider.getTokenRedirect(request);

      expect(tokenPromise).toBeInstanceOf(Promise);
    });

    it("should accept optional account info parameter", () => {
      const request = { scopes: ["User.Read"] };

      const tokenPromise = OneDriveCliProvider.getTokenRedirect(request, mockAccountInfo);

      expect(tokenPromise).toBeInstanceOf(Promise);
    });
  });

  describe("getToken", () => {
    it("should return a promise", () => {
      const tokenPromise = OneDriveCliProvider.getToken();

      expect(tokenPromise).toBeInstanceOf(Promise);
    });
  });

  describe("initialize", () => {
    it("should return a promise", () => {
      const initPromise = OneDriveCliProvider.initialize();

      expect(initPromise).toBeInstanceOf(Promise);
    });
  });
});
