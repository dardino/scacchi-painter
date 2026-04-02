import { Bitboard, BitboardMap } from "../board/board.types";
import { SquareNames } from "../moves/move.types";

export interface Piece {
  notation: string;
  color: "w" | "b" | "n"; // n for neutral
  position: SquareNames;
}

export type PieceArray = Piece[];
export type PieceMoveGenerator = (bitboards: BitboardMap, color: "w" | "b", lastMove?: string) => Bitboard;
export type PieceMoveGeneratorMap = Map<string, PieceMoveGenerator>;
