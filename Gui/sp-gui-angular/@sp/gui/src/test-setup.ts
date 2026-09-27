/* eslint-disable @typescript-eslint/no-explicit-any */
// Vitest setup file for Angular
import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing";
import { MsalAuthService } from "@sp/dbmanager/src/lib/oauth_providers/onedrive.cli";
import { webcrypto } from "node:crypto";
import { beforeEach, vi } from "vitest";

// Polyfill crypto for MSAL browser in jsdom environment
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

// Polyfill TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === "undefined") {
  import("util").then((util) => {
    (global as any).TextEncoder = util.TextEncoder;

    (global as any).TextDecoder = util.TextDecoder;
  });
}

const msalAuthServiceMock = {
  initialize: vi.fn().mockResolvedValue(undefined),
  handleRedirect: vi.fn(),
  login: vi.fn(),
  getToken: vi.fn().mockResolvedValue(null),
};

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: true },
  },
);

beforeEach(() => {
  getTestBed().overrideProvider(MsalAuthService, {
    useValue: msalAuthServiceMock,
  });
  vi.clearAllMocks();
});

// Helper function to check if an error is related to icon loading
function isIconError(value: any): boolean {
  const str = String(value || "");
  if (str.includes("Error retrieving icon") || str.includes("Unable to find icon")) {
    return true;
  }

  if (value instanceof Error) {
    return isIconError(value.message) || isIconError(value.stack);
  }

  if (typeof value === "object") {
    return isIconError(value.message) || isIconError(value.toString());
  }

  return false;
}

// Suppress console output for Material icon loading errors during tests
// These errors are expected when SVG assets are not available in jsdom test environment
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function (...args: any[]) {
  // Check if this is an icon-related error
  if (args.some(isIconError)) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = function (...args: any[]) {
  // Check if this is an icon-related warning
  if (args.some(isIconError)) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
