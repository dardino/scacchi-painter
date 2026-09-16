export type AvailableThemes = "default" | "custom" | "chesscom" | "wood";

export interface ThemeConfig {
  whiteCellColor: string | null;
  blackCellColor: string | null;
  pieceBlackColor: string | null;
  pieceWhiteColor: string | null;
  boardBorderColor: string | null;
  pieceShadow: boolean | null;
}
