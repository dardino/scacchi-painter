// Vitest setup file for Angular
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { webcrypto } from 'node:crypto';

// Polyfill crypto for MSAL browser in jsdom environment
if (typeof global.crypto === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).crypto = webcrypto;
}

// Polyfill TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  import('util').then((util) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).TextEncoder = util.TextEncoder;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).TextDecoder = util.TextDecoder;
  });
}

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: true },
  }
);

// Helper function to check if an error is related to icon loading
function isIconError(value: any): boolean {
  const str = String(value || '');
  if (str.includes('Error retrieving icon') || str.includes('Unable to find icon')) {
    return true;
  }

  if (value instanceof Error) {
    return isIconError(value.message) || isIconError(value.stack);
  }

  if (typeof value === 'object') {
    return isIconError(value.message) || isIconError(value.toString());
  }

  return false;
}

// Suppress console output for Material icon loading errors during tests
// These errors are expected when SVG assets are not available in jsdom test environment
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function(...args: any[]) {
  // Check if this is an icon-related error
  if (args.some(isIconError)) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = function(...args: any[]) {
  // Check if this is an icon-related warning
  if (args.some(isIconError)) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
