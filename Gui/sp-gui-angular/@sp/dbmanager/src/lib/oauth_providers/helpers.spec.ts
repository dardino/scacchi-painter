import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getLocalAuthInfo, setLocalAuthInfo, HASHES, LocalAuthInfo } from "./helpers";

describe("OAuth Helpers", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe("HASHES", () => {
    it("should contain expected hash values", () => {
      expect(HASHES).toContain("dropbox");
      expect(HASHES).toContain("onedrive");
      expect(HASHES).toContain("null");
      expect(HASHES.length).toBe(3);
    });
  });

  describe("getLocalAuthInfo", () => {
    it("should return default values when localStorage is empty", () => {
      const authInfo = getLocalAuthInfo();

      expect(authInfo.redirect).toBe("null");
      expect(authInfo.state).toBe("");
      expect(authInfo.dropbox_token).toBe("null");
      expect(authInfo.onedrive_token).toBe("null");
      expect(authInfo.return_url).toBe("");
    });

    it("should return stored redirect value", () => {
      localStorage.setItem("redirect", "dropbox");

      const authInfo = getLocalAuthInfo();

      expect(authInfo.redirect).toBe("dropbox");
    });

    it("should return stored state value", () => {
      localStorage.setItem("state", "test-state-123");

      const authInfo = getLocalAuthInfo();

      expect(authInfo.state).toBe("test-state-123");
    });

    it("should return stored dropbox_token value", () => {
      const mockToken = JSON.stringify({ access_token: "test-token" });
      localStorage.setItem("dropbox_token", mockToken);

      const authInfo = getLocalAuthInfo();

      expect(authInfo.dropbox_token).toBe(mockToken);
    });

    it("should return stored onedrive_token value", () => {
      const mockToken = JSON.stringify({ accessToken: "test-onedrive-token" });
      localStorage.setItem("onedrive_token", mockToken);

      const authInfo = getLocalAuthInfo();

      expect(authInfo.onedrive_token).toBe(mockToken);
    });

    it("should return stored return_url value", () => {
      localStorage.setItem("return_url", "/savefile#dropbox");

      const authInfo = getLocalAuthInfo();

      expect(authInfo.return_url).toBe("/savefile#dropbox");
    });

    it("should return all stored values together", () => {
      const mockDropboxToken = JSON.stringify({ access_token: "dropbox-token" });
      const mockOnedriveToken = JSON.stringify({ accessToken: "onedrive-token" });

      localStorage.setItem("redirect", "onedrive");
      localStorage.setItem("state", "auth-state-456");
      localStorage.setItem("dropbox_token", mockDropboxToken);
      localStorage.setItem("onedrive_token", mockOnedriveToken);

      const authInfo = getLocalAuthInfo();

      expect(authInfo.redirect).toBe("onedrive");
      expect(authInfo.state).toBe("auth-state-456");
      expect(authInfo.dropbox_token).toBe(mockDropboxToken);
      expect(authInfo.onedrive_token).toBe(mockOnedriveToken);
    });
  });

  describe("setLocalAuthInfo", () => {
    it("should set redirect value in localStorage", () => {
      setLocalAuthInfo({ redirect: "dropbox" });

      expect(localStorage.getItem("redirect")).toBe("dropbox");
    });

    it("should set state value in localStorage", () => {
      setLocalAuthInfo({ state: "new-state-789" });

      expect(localStorage.getItem("state")).toBe("new-state-789");
    });

    it("should set dropbox_token value in localStorage", () => {
      const mockToken = JSON.stringify({ access_token: "new-dropbox-token" });
      setLocalAuthInfo({ dropbox_token: mockToken });

      expect(localStorage.getItem("dropbox_token")).toBe(mockToken);
    });

    it("should set onedrive_token value in localStorage", () => {
      const mockToken = JSON.stringify({ accessToken: "new-onedrive-token" });
      setLocalAuthInfo({ onedrive_token: mockToken });

      expect(localStorage.getItem("onedrive_token")).toBe(mockToken);
    });

    it("should set return_url value in localStorage", () => {
      setLocalAuthInfo({ return_url: "/savefile#onedrive" });

      expect(localStorage.getItem("return_url")).toBe("/savefile#onedrive");
    });

    it("should only set provided properties", () => {
      // First set some values
      localStorage.setItem("redirect", "dropbox");
      localStorage.setItem("state", "old-state");

      // Only update redirect
      setLocalAuthInfo({ redirect: "onedrive" });

      expect(localStorage.getItem("redirect")).toBe("onedrive");
      expect(localStorage.getItem("state")).toBe("old-state");
    });

    it("should set multiple properties at once", () => {
      const authInfo: LocalAuthInfo = {
        redirect: "dropbox",
        state: "multi-state",
        dropbox_token: "token-123",
        onedrive_token: "token-456",
        return_url: "/edit/1",
      };

      setLocalAuthInfo(authInfo);

      expect(localStorage.getItem("redirect")).toBe("dropbox");
      expect(localStorage.getItem("state")).toBe("multi-state");
      expect(localStorage.getItem("dropbox_token")).toBe("token-123");
      expect(localStorage.getItem("onedrive_token")).toBe("token-456");
      expect(localStorage.getItem("return_url")).toBe("/edit/1");
    });

    it("should handle empty object without errors", () => {
      expect(() => setLocalAuthInfo({})).not.toThrow();
    });
  });

  describe("Auth flow integration", () => {
    it("should correctly store and retrieve redirect provider for OneDrive", () => {
      // Simulate storing auth info before redirect
      setLocalAuthInfo({
        redirect: "onedrive",
        state: "onedrive-auth-state",
      });

      // Simulate retrieving auth info after redirect
      const authInfo = getLocalAuthInfo();

      expect(authInfo.redirect).toBe("onedrive");
      expect(authInfo.state).toBe("onedrive-auth-state");
    });

    it("should correctly store and retrieve redirect provider for Dropbox", () => {
      // Simulate storing auth info before redirect
      setLocalAuthInfo({
        redirect: "dropbox",
        state: "dropbox-auth-state",
      });

      // Simulate retrieving auth info after redirect
      const authInfo = getLocalAuthInfo();

      expect(authInfo.redirect).toBe("dropbox");
      expect(authInfo.state).toBe("dropbox-auth-state");
    });

    it("should update token after successful authentication", () => {
      // Simulate pre-auth state
      setLocalAuthInfo({
        redirect: "onedrive",
        state: "pre-auth",
      });

      // Simulate post-auth token storage
      const mockToken = JSON.stringify({
        accessToken: "authenticated-token",
        expiresOn: Date.now() + 3600000,
      });
      setLocalAuthInfo({ onedrive_token: mockToken });

      // Verify token was stored
      const authInfo = getLocalAuthInfo();
      expect(authInfo.onedrive_token).toBe(mockToken);

      // Parse and verify token structure
      const parsedToken = JSON.parse(authInfo.onedrive_token);
      expect(parsedToken.accessToken).toBe("authenticated-token");
    });

    it("should handle null redirect value correctly", () => {
      setLocalAuthInfo({ redirect: "null" });

      const authInfo = getLocalAuthInfo();
      expect(authInfo.redirect).toBe("null");
    });

    it("should store return_url for Dropbox auth and retrieve it after authentication", () => {
      // Simulate storing auth info with return_url before Dropbox redirect
      setLocalAuthInfo({
        redirect: "dropbox",
        state: "dropbox-auth-state",
        return_url: "/savefile#dropbox",
      });

      // Simulate retrieving auth info after redirect
      const authInfo = getLocalAuthInfo();

      expect(authInfo.redirect).toBe("dropbox");
      expect(authInfo.return_url).toBe("/savefile#dropbox");
    });

    it("should store return_url for OneDrive auth and retrieve it after authentication", () => {
      // Simulate storing auth info with return_url before OneDrive redirect
      setLocalAuthInfo({
        redirect: "onedrive",
        state: "onedrive-auth-state",
        return_url: "/savefile#onedrive",
      });

      // Simulate retrieving auth info after redirect
      const authInfo = getLocalAuthInfo();

      expect(authInfo.redirect).toBe("onedrive");
      expect(authInfo.return_url).toBe("/savefile#onedrive");
    });

    it("should preserve return_url through token storage", () => {
      // Simulate pre-auth state with return_url
      setLocalAuthInfo({
        redirect: "dropbox",
        state: "pre-auth",
        return_url: "/edit/5",
      });

      // Simulate post-auth token storage (should not clear return_url)
      const mockToken = JSON.stringify({
        access_token: "authenticated-token",
      });
      setLocalAuthInfo({ dropbox_token: mockToken });

      // Verify return_url was preserved
      const authInfo = getLocalAuthInfo();
      expect(authInfo.return_url).toBe("/edit/5");
      expect(authInfo.dropbox_token).toBe(mockToken);
    });

    it("should return empty return_url when not set (fallback to default)", () => {
      // Simulate auth without setting return_url
      setLocalAuthInfo({
        redirect: "dropbox",
        state: "auth-state",
      });

      const authInfo = getLocalAuthInfo();
      expect(authInfo.return_url).toBe("");
    });
  });
});
