import { environment } from "../../environments/environment";
import { parse, serialize } from "./signalFactories/localStored";

export const SETTINGS_PREFIX = "spx:pref:";
const MIGRATION_FLAG = "spx:settings:localStorageMigrated";
const STORE_FILE = "settings.json";

interface SettingsBackend {
  load(): Promise<Record<string, string>>;
  save(key: string, value: string): Promise<void>;
}

interface SettingsStore {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  save(): Promise<void>;
  entries<T>(): Promise<[string, T][]>;
}

function readLocalStorage(): Record<string, string> {
  const values: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key?.startsWith(SETTINGS_PREFIX)) {
      values[key] = localStorage.getItem(key) ?? "";
    }
  }
  return values;
}

const localStorageBackend: SettingsBackend = {
  load: async () => readLocalStorage(),
  save: async (key, value) => {
    localStorage.setItem(key, value);
  },
};

async function createTauriBackend(): Promise<SettingsBackend> {
  const { load } = await import("@tauri-apps/plugin-store");
  const store = await load(STORE_FILE) as SettingsStore;

  return {
    load: async () => {
      const entries = await store.entries<string>();
      const values: Record<string, string> = Object.fromEntries(entries);

      const alreadyMigrated = await store.get<string>(MIGRATION_FLAG) === "true";
      if (!alreadyMigrated) {
        for (const [key, value] of Object.entries(readLocalStorage())) {
          if (values[key] == null) {
            await store.set(key, value);
            values[key] = value;
          }
        }
        await store.set(MIGRATION_FLAG, "true");
        await store.save();
      }

      return values;
    },
    save: async (key, value) => {
      await store.set(key, value);
      await store.save();
    },
  };
}

let backend: SettingsBackend = localStorageBackend;
let cache: Record<string, string> = {};
let initialized = false;

/** Loads the settings from the backend selected for the current environment. */
export async function initializeSettings(): Promise<void> {
  if (initialized) {
    return;
  }

  if (environment.tauri) {
    try {
      backend = await createTauriBackend();
    }
    catch (error) {
      console.error("Failed to initialize the Tauri settings store, falling back to localStorage.", error);
      backend = localStorageBackend;
    }
  }

  cache = await backend.load();
  initialized = true;
}

export function readSetting<T>(key: string, defaultValue: T): T {
  const storageKey = `${SETTINGS_PREFIX}${key}`;
  const raw = initialized ? cache[storageKey] ?? "" : localStorage.getItem(storageKey) ?? "";
  return parse(raw, defaultValue);
}

export function writeSetting(key: string, value: unknown): void {
  const storageKey = `${SETTINGS_PREFIX}${key}`;
  const serialized = serialize(value);
  cache[storageKey] = serialized;
  void backend.save(storageKey, serialized).catch((error) => {
    console.error(`Failed to persist setting ${key}.`, error);
  });
}
