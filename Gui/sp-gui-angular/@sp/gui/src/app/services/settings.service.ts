import { effect, Injectable, signal, untracked, WritableSignal } from "@angular/core";
import { readSetting, writeSetting } from "./settings.storage";

/**
 * Creates a setting backed by localStorage on the web and by the Tauri store
 * on the desktop build. The returned signal is synchronous: writes update the
 * in-memory cache immediately and are persisted asynchronously.
 */
@Injectable({
  providedIn: "root",
})
export class SettingsService {
  setting<T>(key: string, defaultValue: T): WritableSignal<T> {
    const value = signal<T>(readSetting(key, defaultValue));

    effect(() => {
      const current = value();
      untracked(() => writeSetting(key, current));
    });

    return value;
  }
}
