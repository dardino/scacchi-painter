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
