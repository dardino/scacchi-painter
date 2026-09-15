import { effect, Injectable, signal, untracked, WritableSignal } from "@angular/core";

interface PreferencesTable {
  editWindowWidth: WritableSignal<number>;
  solutionFontSize: WritableSignal<number>;
}

const lsPropNameGetter = <T extends string>(value: T): `spx:pref:${typeof value}` => {
  const retVal = `spx:pref:${value}` as const;
  return retVal;
};

function serialize(v: unknown): string {
  return typeof v === "string" ? v : JSON.stringify(v);
}

function parse<T>(raw: string, fallback: T): T {
  try {
    // Se fallback è string → non parse JSON
    if (typeof fallback === "string") return raw as T;
    return JSON.parse(raw) as T;
  }
  catch {
    return fallback;
  }
}
function localStoredSignal<T>(key: keyof PreferencesTable, defaultValue: T) {
  const lsKey = lsPropNameGetter(key);

  const raw = localStorage.getItem(lsKey);
  const initial = raw !== null ? parse(raw, defaultValue) : defaultValue;

  const s = signal<T>(initial);

  effect(() => {
    const v = s();
    untracked(() => {
      localStorage.setItem(lsKey, serialize(v));
    });
  });

  return s;
}
@Injectable({
  providedIn: "root",
})
export class PreferencesService implements PreferencesTable {
  save(/* args: Partial<PreferencesTable> */) {
    throw new Error("Method not implemented.");
  }

  public editWindowWidth = localStoredSignal("editWindowWidth", 800);
  public solutionFontSize = localStoredSignal("solutionFontSize", 1);
}
