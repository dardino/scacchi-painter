import { effect, Signal, signal, untracked, WritableSignal } from "@angular/core";

const lsPropNameGetter = <T extends string>(value: T): `spx:pref:${typeof value}` => {
  const retVal = `spx:pref:${value}` as const;
  return retVal;
};

function serialize(v: unknown): string {
  if (typeof v === "boolean") return v === true ? "true" : "false";
  if (typeof v === "number") return v.toString();
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function parse<T>(raw: string, fallback: T): T {
  try {
    if (raw === "") return fallback;
    // Se fallback è string → non parse JSON
    if (typeof fallback === "string") return raw as T;
    if (typeof fallback === "boolean") return raw === "true" ? true as T : false as T;
    if (typeof fallback === "number") return Number(raw) as T;
    return JSON.parse(raw) as T;
  }
  catch {
    return fallback;
  }
}

type StringProps<T> = Extract<{
  [K in keyof T]: T[K] extends string | Signal<string> ? K : never;
}[keyof T], string>;
type NumberProps<T> = Extract<{
  [K in keyof T]: T[K] extends number | Signal<number> ? K : never;
}[keyof T], string>;
type BooleanProps<T> = Extract<{
  [K in keyof T]: T[K] extends boolean | Signal<boolean> ? K : never;
}[keyof T], string>;
type ArrayProps<T> = Extract<{
  [K in keyof T]: T[K] extends Array<string | number | boolean> | Signal<Array<string | number | boolean>> ? K : never;
}[keyof T], string>;
type ValidPreferenceKey<T> = StringProps<T> | NumberProps<T> | BooleanProps<T> | ArrayProps<T>;

/**
 * Creates a signal that is synchronized with localStorage.
 * @param key The key to use in localStorage.
 * @param defaultValue The default value to use if no value is found in localStorage.
 * @returns A signal that reflects the value in localStorage.
 */
export function localStoredSignal<
  T, K extends ValidPreferenceKey<T>,
>(
  key: K, defaultValue: NoInfer<T[K] extends Signal<infer U> ? U : T[K]>,
): WritableSignal<T[K] extends Signal<infer U> ? U : T[K]> {
  const lsKey = lsPropNameGetter(key);

  const raw = localStorage.getItem(lsKey);
  const initial = parse(raw ?? "", defaultValue);

  const s = signal<T[K] extends Signal<infer U> ? U : T[K]>(initial);

  effect(() => {
    const v = s();
    untracked(() => {
      localStorage.setItem(lsKey, serialize(v));
    });
  });

  return s;
}
