import { Injectable } from "@angular/core";

interface PreferencesTable {
  editWindowWidth: number;
}

const lsPropNameGetter = <T extends string>(value: T): `spx:pref:${typeof value}` => {
  const retVal = `spx:pref:${value}` as const;
  return retVal;
};

const BindToLocalStorage = <T extends "number" | "string">(
  type: T,
  defaultValue?: T extends "number" ? number : string
) => (target: unknown, key: string) => {
  Object.defineProperty(target, key, {
    get: () => {
      const fromLS = localStorage.getItem(lsPropNameGetter(key)) ?? defaultValue ?? "";
      switch (type) {
        case "number":
          return parseFloat(`0` + fromLS);
        case "string":
        default:
          return fromLS;
      }
    },
    set: (newValue) => {
      localStorage.setItem(lsPropNameGetter(key), newValue.toString());
    },
  });
};

@Injectable({
  providedIn: "root"
})
export class PreferencesService implements PreferencesTable {

  save(/* args: Partial<PreferencesTable> */) {
    throw new Error("Method not implemented.");
  }

  @BindToLocalStorage("number")
  public editWindowWidth: number;

  @BindToLocalStorage("number", 1)
  public solutionFontSize: number;
}
