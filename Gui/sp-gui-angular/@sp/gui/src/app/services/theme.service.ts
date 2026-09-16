import { inject, Injectable } from "@angular/core";
import { PreferencesService } from "./preferences.service";
import { AvailableThemes, ThemeConfig } from "./types";
/**
 * List of all available themes with their display names.
 */
const AllThemes = [
  { value: "default", viewValue: "ScacchiPainter X" },
  { value: "custom", viewValue: "Custom" },
  { value: "chesscom", viewValue: "Chess.com" },
  { value: "wood", viewValue: "Wood" },
] as Array<{ value: AvailableThemes; viewValue: string }>;
/**
 * Configuration for each theme.
 */
const themeConfig: Record<AvailableThemes, ThemeConfig> = {
  default: {
    whiteCellColor: "#ffffff",
    blackCellColor: "#c3c3c3",
    pieceBlackColor: "#000000",
    pieceWhiteColor: "#ffffff",
    boardBorderColor: "transparent",
    pieceShadow: false,
  },
  custom: {
    whiteCellColor: null,
    blackCellColor: null,
    pieceBlackColor: null,
    pieceWhiteColor: null,
    boardBorderColor: null,
    pieceShadow: null,
  },
  chesscom: {
    whiteCellColor: "#eaecd0",
    blackCellColor: "#739552",
    pieceBlackColor: "#2c2a29",
    pieceWhiteColor: "#ffffff",
    boardBorderColor: "transparent",
    pieceShadow: false,
  },
  wood: {
    whiteCellColor: "#deb887",
    blackCellColor: "#8b4513",
    pieceBlackColor: "#000000",
    pieceWhiteColor: "#ffffff",
    boardBorderColor: "#000000",
    pieceShadow: false,
  },
};

interface ThemeServiceAPI {
  applyTheme(theme: AvailableThemes): void;
}

@Injectable({
  providedIn: "root",
})
export class ThemeService implements ThemeServiceAPI {
  public AllThemes = AllThemes;

  #preferences = inject(PreferencesService);

  applyTheme(theme: AvailableThemes): void {
    if (theme in themeConfig) {
      const config = themeConfig[theme];

      const whiteCellColor = config.whiteCellColor ?? this.#preferences.chessboardWhiteCellColor();
      const blackCellColor = config.blackCellColor ?? this.#preferences.chessboardBlackCellColor();
      const pieceBlackColor = config.pieceBlackColor ?? this.#preferences.chessboardPieceBlackColor();
      const pieceWhiteColor = config.pieceWhiteColor ?? this.#preferences.chessboardPieceWhiteColor();
      const boardBorderColor = config.boardBorderColor ?? this.#preferences.chessboardBorderColor();
      const chessboardPieceShadow = config.pieceShadow ?? this.#preferences.chessboardPieceShadow();

      document.body.style.setProperty("--cb-chess-light-square", whiteCellColor);
      document.body.style.setProperty("--cb-chess-dark-square", blackCellColor);
      document.body.style.setProperty("--cb-chess-piece-color", pieceBlackColor);
      document.body.style.setProperty("--cb-chess-piece-bg", pieceWhiteColor);
      document.body.style.setProperty("--cb-chess-piece-fg", pieceBlackColor);
      document.body.style.setProperty("--cb-chess-border-color", boardBorderColor);
      if (chessboardPieceShadow) {
        document.body.style.setProperty("--cb-chess-piece-shadow", "0 .07em .07em rgba(10, 10, 10, 0.3)");
      }
      else {
        document.body.style.setProperty("--cb-chess-piece-shadow", "none");
      }
    }
  }
}
