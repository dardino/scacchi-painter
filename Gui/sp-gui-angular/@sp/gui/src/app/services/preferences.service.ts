import { Injectable, WritableSignal } from "@angular/core";

import { localStoredSignal } from "./signalFactories/localStored";
import { AvailableThemes } from "./types";

interface PreferencesTable {
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
  editorShowExtraPieces: WritableSignal<boolean>;
  compactPieceSelector: WritableSignal<boolean>;
}

@Injectable({
  providedIn: "root",
})
export class PreferencesService implements PreferencesTable {
  save(/* args: Partial<PreferencesTable> */) {
    throw new Error("Method not implemented.");
  }

  public editorWindowWidth = localStoredSignal<PreferencesTable, "editorWindowWidth">("editorWindowWidth", 800);
  public editorSolutionFontSize = localStoredSignal<PreferencesTable, "editorSolutionFontSize">("editorSolutionFontSize", 1);
  public chessboardLabels = localStoredSignal<PreferencesTable, "chessboardLabels">("chessboardLabels", false);
  public chessboardWhiteCellColor = localStoredSignal<PreferencesTable, "chessboardWhiteCellColor">("chessboardWhiteCellColor", "#ffffff");
  public chessboardBlackCellColor = localStoredSignal<PreferencesTable, "chessboardBlackCellColor">("chessboardBlackCellColor", "#dddddd");
  public chessboardPieceBlackColor = localStoredSignal<PreferencesTable, "chessboardPieceBlackColor">("chessboardPieceBlackColor", "#000000");
  public chessboardPieceWhiteColor = localStoredSignal<PreferencesTable, "chessboardPieceWhiteColor">("chessboardPieceWhiteColor", "#ffffff");
  public chessboardBorderColor = localStoredSignal<PreferencesTable, "chessboardBorderColor">("chessboardBorderColor", "transparent");
  public chessboardPieceShadow = localStoredSignal<PreferencesTable, "chessboardPieceShadow">("chessboardPieceShadow", false);
  public chessboardTheme = localStoredSignal<PreferencesTable, "chessboardTheme">("chessboardTheme", "default");
  public editorShowExtraPieces = localStoredSignal<PreferencesTable, "editorShowExtraPieces">("editorShowExtraPieces", false);
  public compactPieceSelector = localStoredSignal<PreferencesTable, "compactPieceSelector">("compactPieceSelector", false);
}
