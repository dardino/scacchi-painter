import { inject, Injectable, WritableSignal } from "@angular/core";

import { SettingsService } from "./settings.service";
import { AvailableThemes } from "./types";

export interface PreferencesTable {
  editorWindowWidth: WritableSignal<number>;
  editorSolutionFontSize: WritableSignal<number>;
  chessboardLabels: WritableSignal<boolean>;
  chessboardWhiteCellColor: WritableSignal<string>;
  chessboardBlackCellColor: WritableSignal<string>;
  chessboardPieceBlackColor: WritableSignal<string>;
  chessboardPieceWhiteColor: WritableSignal<string>;
  chessboardBorderColor: WritableSignal<string>;
  chessboardPieceShadow: WritableSignal<boolean>;
  chessboardTheme: WritableSignal<AvailableThemes>;
  chessboardAnimation: WritableSignal<boolean>;
  editorShowExtraPieces: WritableSignal<boolean>;
  compactPieceSelector: WritableSignal<boolean>;
}

@Injectable({
  providedIn: "root",
})
export class PreferencesService implements PreferencesTable {
  #settings = inject(SettingsService);

  save(/* args: Partial<PreferencesTable> */) {
    throw new Error("Method not implemented.");
  }

  public editorWindowWidth = this.#settings.setting<number>("editorWindowWidth", 800);
  public editorSolutionFontSize = this.#settings.setting<number>("editorSolutionFontSize", 1);
  public chessboardLabels = this.#settings.setting<boolean>("chessboardLabels", false);
  public chessboardWhiteCellColor = this.#settings.setting<string>("chessboardWhiteCellColor", "#ffffff");
  public chessboardBlackCellColor = this.#settings.setting<string>("chessboardBlackCellColor", "#dddddd");
  public chessboardPieceBlackColor = this.#settings.setting<string>("chessboardPieceBlackColor", "#000000");
  public chessboardPieceWhiteColor = this.#settings.setting<string>("chessboardPieceWhiteColor", "#ffffff");
  public chessboardBorderColor = this.#settings.setting<string>("chessboardBorderColor", "transparent");
  public chessboardPieceShadow = this.#settings.setting<boolean>("chessboardPieceShadow", false);
  public chessboardTheme = this.#settings.setting<AvailableThemes>("chessboardTheme", "default");
  public chessboardAnimation = this.#settings.setting<boolean>("chessboardAnimation", true);
  public editorShowExtraPieces = this.#settings.setting<boolean>("editorShowExtraPieces", false);
  public compactPieceSelector = this.#settings.setting<boolean>("compactPieceSelector", false);
}
