import { beforeEach, describe, expect, it, vi } from "vitest";
import { SETTINGS_PREFIX } from "./settings.storage";

describe("settings.storage (web)", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("reads persisted settings and writes updates to localStorage", async () => {
    localStorage.setItem(`${SETTINGS_PREFIX}theme`, "chesscom");
    const storage = await import("./settings.storage");
    await storage.initializeSettings();

    expect(storage.readSetting("theme", "default")).toBe("chesscom");

    storage.writeSetting("theme", "wood");
    expect(localStorage.getItem(`${SETTINGS_PREFIX}theme`)).toBe("wood");
    expect(storage.readSetting("theme", "default")).toBe("wood");
  });

  it("parses typed values and falls back to defaults", async () => {
    localStorage.setItem(`${SETTINGS_PREFIX}count`, "7");
    localStorage.setItem(`${SETTINGS_PREFIX}enabled`, "true");
    const storage = await import("./settings.storage");
    await storage.initializeSettings();

    expect(storage.readSetting("count", 0)).toBe(7);
    expect(storage.readSetting("enabled", false)).toBe(true);
    expect(storage.readSetting("missing", "fallback")).toBe("fallback");
  });
});
