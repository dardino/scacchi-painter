import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_EXISTING_TIP_WEIGHT,
  DEFAULT_NEW_TIP_WEIGHT,
  MIN_TIP_WEIGHT,
  TipsEngine,
  decayWeight,
  loadTipsFromJson,
  selectWeightedTip,
  syncTipsState,
} from "./tips-engine";

describe("TipsEngine", () => {
  it("loads and sanitizes strings from JSON input", () => {
    expect(loadTipsFromJson([
      "  First tip  ",
      "First tip",
      "Second tip",
      "  ",
      "Third tip",
    ])).toEqual(["First tip", "Second tip", "Third tip"]);

    expect(loadTipsFromJson("not-an-array")).toEqual([]);
    expect(loadTipsFromJson(null)).toEqual([]);
    expect(loadTipsFromJson([])).toEqual([]);
  });

  it("syncs tip state with JSON and keeps existing weights", () => {
    const state = {
      weights: {
        "Keep me": 32,
        "Removed tip": 16,
      },
      lastShownTip: "Keep me",
      showTipsAtStartup: true,
      tipsVersion: 2,
    };

    const synced = syncTipsState(["Keep me", "New tip"], state);

    expect(synced.weights).toEqual({
      "Keep me": 32,
      "New tip": DEFAULT_NEW_TIP_WEIGHT,
    });
    expect(synced.lastShownTip).toBe("Keep me");
    expect(synced.tipsVersion).toBe(2);
    expect(synced.showTipsAtStartup).toBe(true);
  });

  it("uses the expected default weights for existing and new tips", () => {
    expect(DEFAULT_EXISTING_TIP_WEIGHT).toBe(64);
    expect(DEFAULT_NEW_TIP_WEIGHT).toBe(128);
    expect(MIN_TIP_WEIGHT).toBe(1);

    const weightMap = {
      "Existing tip": DEFAULT_EXISTING_TIP_WEIGHT,
      "New tip": DEFAULT_NEW_TIP_WEIGHT,
    };

    expect(weightMap["Existing tip"]).toBeGreaterThan(0);
    expect(weightMap["New tip"]).toBeGreaterThan(weightMap["Existing tip"]);
  });

  it("selects weighted tips according to their weight", () => {
    const weights = { A: 128, B: 64, C: 1 };

    expect(selectWeightedTip(weights, () => 0.1)).toBe("A");
    expect(selectWeightedTip(weights, () => 0.6)).toBe("A");
    expect(selectWeightedTip(weights, () => 0.8)).toBe("B");
    expect(selectWeightedTip(weights, () => 0.95)).toBe("B");

    const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(193);
  });

  it("decays weights once per session and keeps them at least at 1", () => {
    const session = new Set<string>();

    expect(decayWeight("A", { A: 8, B: 4 }, session)).toEqual({ A: 4, B: 4 });
    expect(decayWeight("A", { A: 4, B: 4 }, session)).toEqual({ A: 4, B: 4 });
    expect(decayWeight("B", { A: 1, B: 3 }, session)).toEqual({ A: 1, B: 1 });
    expect(decayWeight("C", { C: 1 }, session)).toEqual({ C: 1 });
  });

  it("tracks session decay state independently for each tip", () => {
    const engine = new TipsEngine();

    engine.weights.set({ A: 16, B: 8 });
    engine.tips.set(["A", "B"]);

    engine.showTip("A");
    engine.showTip("A");
    engine.showTip("B");

    expect(engine.weights().A).toBe(8);
    expect(engine.weights().B).toBe(4);
    expect(engine.sessionDecayApplied.size).toBe(2);
  });

  it("can select and navigate tips while persisting the visible state", () => {
    const engine = new TipsEngine();
    const random = vi.fn()
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.8);

    engine.tips.set(["Alpha", "Bravo", "Charlie"]);
    engine.weights.set({ Alpha: 64, Bravo: 64, Charlie: 64 });
    engine.currentTip.set("Bravo");

    const selected = engine.selectTip(random);
    expect(selected).toBe("Alpha");

    const next = engine.nextTip();
    expect(next).toBe("Bravo");

    const prev = engine.prevTip();
    expect(prev).toBe("Alpha");
  });
});
