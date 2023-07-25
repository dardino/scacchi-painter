import { Injectable } from "@angular/core";

interface PreferencesTable {
  editWindowWidth: number;
};

const lsPropNameGetter = <T extends string>(value: T): `spx:pref:${typeof value}` => {
  const retVal = `spx:pref:${value}` as const;
  return retVal;
};

const BindToLocalStorage = (type: "number" | "string") => (target: any, key: any) => {
  Object.defineProperty(target, key, {
    get: () => {
      switch (type) {
        case "number":
          return parseFloat(`0` + (localStorage.getItem(lsPropNameGetter(key)) ?? ""));
        case "string":
        default:
          return localStorage.getItem(lsPropNameGetter(key)) ?? "";
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

  save(args: Partial<PreferencesTable>) {
    throw new Error("Method not implemented.");
  }

  @BindToLocalStorage("number")
  public editWindowWidth: number;

}
