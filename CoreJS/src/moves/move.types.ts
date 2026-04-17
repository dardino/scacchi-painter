export type SquareNames = `${MoveCols}${MoveRows}`;
export type MoveCols = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type MoveRows = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type MoveType = "-" | "*";
export type MoveNum = `${number}.` | `${number}...`;

export function SquareNames(...args: SquareNames[]): SquareNames[] {
  return args as SquareNames[];
}

/**
 * Represents a generated move with only the basic information about the piece, 
 * source and destination squares, and move type. 
 * This is used for move generation and does not include additional metadata like checks, promotions, etc.
 */
export interface PseudoMove {
  /** The piece that is moving */
  piece: string;
  /** The square from which the piece is moving */
  from: SquareNames;
  /** The square to which the piece is moving */
  to: SquareNames;
  /** The index of the square from which the piece is moving */
  fromIndex: number;
  /** The index of the square to which the piece is moving */
  toIndex: number;
}

/**
 * Represents a legal move with info about checks and move type. 
 * This is used for move validation and search, and includes additional metadata compared to PseudoMove.
 */
export interface LegalMove extends PseudoMove {
  /** Indicates if the move is a check */
  isCheck: boolean;
  /** The type of move: "-" for a regular move, "*" for a capture */
  type: MoveType;
}

/**
 * Represents information about a single half-move in a chess game.
 */
export interface HalfMoveInfo extends LegalMove {
  /** The number of the move */
  num: number;
  /** Indicates which half of the move: "l" for left half move, "r" for right half move */
  part: "l" | "r";
  /** Indicates if the move is a promotion */
  isPromotion: boolean;
  /** The piece that is promoted */
  promotedPiece: string;
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
  /** Indicates if the move is a threat */
  threat: boolean;
  /** Indicates if the move is a zugzwang */
  zugzwang: boolean;
}
