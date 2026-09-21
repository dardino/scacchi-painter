import { computed, signal } from "@angular/core";

export const DEFAULT_EXISTING_TIP_WEIGHT = 64;
export const DEFAULT_NEW_TIP_WEIGHT = 128;
export const MIN_TIP_WEIGHT = 1;
const DB_NAME = "spx_tips";
const STORE_NAME = "tip_state";
const STATE_KEY = "current";

export interface TipsState {
  weights: Record<string, number>;
  lastShownTip: string | null;
  showTipsAtStartup: boolean;
  tipsVersion: number;
}

export const EMPTY_TIPS_STATE: TipsState = {
  weights: {},
  lastShownTip: null,
  showTipsAtStartup: true,
  tipsVersion: 0,
};

export function loadTipsFromJson(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of raw) {
    if (typeof item !== "string") {
      continue;
    }

    const trimmed = item.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

export function syncTipsState(syncedTips: string[], existingState: Partial<TipsState> | null | undefined): TipsState {
  const baseState = { ...EMPTY_TIPS_STATE, ...(existingState ?? {}) };
  const weights: Record<string, number> = {};
  const storedWeights = { ...(baseState.weights ?? {}) };

  for (const tip of syncedTips) {
    if (Object.hasOwn(storedWeights, tip) && Number.isFinite(storedWeights[tip])) {
      weights[tip] = Math.max(MIN_TIP_WEIGHT, Math.round(storedWeights[tip]));
      continue;
    }

    weights[tip] = DEFAULT_NEW_TIP_WEIGHT;
  }

  for (const storedTip of Object.keys(storedWeights)) {
    if (!Object.hasOwn(weights, storedTip)) {
      delete storedWeights[storedTip];
    }
  }

  return {
    weights,
    lastShownTip: baseState.lastShownTip ?? null,
    showTipsAtStartup: baseState.showTipsAtStartup ?? true,
    tipsVersion: syncedTips.length,
  };
}

export function selectWeightedTip(weights: Record<string, number>, random: () => number = Math.random): string | null {
  const entries = Object.entries(weights).filter(([, weight]) => Number.isFinite(weight) && weight > 0);
  if (entries.length === 0) {
    return null;
  }

  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) {
    return entries[0]?.[0] ?? null;
  }

  let target = random() * totalWeight;
  for (const [tip, weight] of entries) {
    target -= weight;
    if (target <= 0) {
      return tip;
    }
  }

  return entries[entries.length - 1]?.[0] ?? null;
}

export function decayWeight(
  tip: string,
  weights: Record<string, number>,
  sessionDecayApplied: Set<string>,
): Record<string, number> {
  const nextWeights = { ...weights };
  const currentWeight = nextWeights[tip];

  if (currentWeight == null || sessionDecayApplied.has(tip)) {
    return nextWeights;
  }

  nextWeights[tip] = Math.max(MIN_TIP_WEIGHT, Math.floor(currentWeight / 2));
  sessionDecayApplied.add(tip);
  return nextWeights;
}

async function openTipDatabase(): Promise<IDBDatabase> {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is not available."));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open tips database."));
  });
}

async function readTipsStateFromIndexedDB(): Promise<TipsState> {
  try {
    const db = await openTipDatabase();
    const state = await new Promise<TipsState>((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(STATE_KEY);

      request.onsuccess = () => {
        const value = request.result as Partial<TipsState> | undefined;
        resolve({ ...EMPTY_TIPS_STATE, ...(value ?? {}) });
      };
      request.onerror = () => resolve({ ...EMPTY_TIPS_STATE });
    });

    db.close();
    return state;
  }
  catch {
    return { ...EMPTY_TIPS_STATE };
  }
}

async function writeTipsStateToIndexedDB(state: TipsState): Promise<void> {
  try {
    const db = await openTipDatabase();
    await new Promise<void>((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(state, STATE_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db.close();
  }
  catch {
    // no-op: state persistence is best-effort only
  }
}

export class TipsService {
  public readonly tips = signal<string[]>([]);
  public readonly weights = signal<Record<string, number>>({});
  public readonly lastShownTip = signal<string | null>(null);
  public readonly showTipsAtStartup = signal<boolean>(true);
  public readonly currentTip = signal<string | null>(null);
  public readonly isVisible = computed(() => this.showTipsAtStartup() && this.tips().length > 0 && this.currentTip() != null);
  public readonly sessionDecayApplied = new Set<string>();

  public loadTipsFromJson(raw: unknown): string[] {
    const nextTips = loadTipsFromJson(raw);
    this.tips.set(nextTips);
    return nextTips;
  }

  public async syncWithIndexedDB(tips: string[] = this.tips()): Promise<TipsState> {
    const storedState = await readTipsStateFromIndexedDB();
    const syncedState = syncTipsState(tips, storedState);

    this.weights.set(syncedState.weights);
    this.lastShownTip.set(syncedState.lastShownTip);
    this.showTipsAtStartup.set(syncedState.showTipsAtStartup);

    await writeTipsStateToIndexedDB(syncedState);
    return syncedState;
  }

  public selectTip(random: () => number = Math.random): string | null {
    const selection = selectWeightedTip(this.weights(), random);
    if (selection == null) {
      this.currentTip.set(null);
      return null;
    }

    return this.showTip(selection);
  }

  public showTip(tip: string): string | null {
    if (this.tips().includes(tip) === false) {
      return null;
    }

    this.currentTip.set(tip);
    this.lastShownTip.set(tip);
    this.weights.set(decayWeight(tip, this.weights(), this.sessionDecayApplied));
    return tip;
  }

  public nextTip(): string | null {
    const list = this.tips();
    const current = this.currentTip();
    if (list.length === 0) {
      return null;
    }

    const currentIndex = current == null ? 0 : list.indexOf(current);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % list.length : 0;
    return this.showTip(list[nextIndex]);
  }

  public prevTip(): string | null {
    const list = this.tips();
    const current = this.currentTip();
    if (list.length === 0) {
      return null;
    }

    const currentIndex = current == null ? 0 : list.indexOf(current);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    return this.showTip(list[prevIndex]);
  }
}
