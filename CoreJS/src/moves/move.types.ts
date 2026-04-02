export type SquareNames = `${MoveCols}${MoveRows}`;
export type MoveCols = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type MoveRows = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type MoveType = "-" | "*";
export type MoveNum = `${number}.` | `${number}...`;

/**
 * Represents information about a single half-move in a chess game.
 */
export interface HalfMoveInfo {
  /** The number of the move */
  num: number;
  /** Indicates which half of the move: "l" for left half move, "r" for right half move */
  part: "l" | "r";
  /** The square from which the piece is moving */
  from: SquareNames;
  /** The square to which the piece is moving */
  to: SquareNames;
  /** The type of move: "-" for a regular move, "*" for a capture */
  type: MoveType;
  /** Indicates if the move is a promotion */
  isPromotion: boolean;
  /** The piece that is promoted */
  promotedPiece: string;
  /** Indicates if the move is a check */
  isCheck: boolean;
  /** Indicates if the move is a checkmate */
  isCheckMate: boolean;
  /** Indicates if the move is a stalemate */
  isStaleMate: boolean;
  /** Indicates if the move is a try */
  isTry: boolean;
  /** Indicates if the move is a refutation */
  refutes: boolean;
  /** Indicates if the move is a key */
  isKey: boolean;
  /** extra moves for fairies */
  extraMoves: string[];
  /** The piece that is moving */
  piece: string;
  /** Indicates if the move is a threat */
  threat: boolean;
  /** Indicates if the move is a zugzwang */
  zugzwang: boolean;
}
