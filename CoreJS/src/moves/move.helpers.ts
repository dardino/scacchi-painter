import { BitboardToIndexes, IndexToSquare, PieceKeysForColor } from "../bitboards/bitboard.helpers";
import { Bitboard, BitboardMap } from "../board/board.types";
import { MoveGeneratorMap } from "../pieces/piece.helpers";
import { HalfMoveInfo, PseudoMove } from "./move.types";

export const parseMove = (move: string): [left: HalfMoveInfo, right: HalfMoveInfo] => {
  return [
    {} as HalfMoveInfo,
    {} as HalfMoveInfo,
  ];
};

/**
 * Generates pseudo-legal moves for the given bitboard map and color. These moves do not consider checks or pins, but can be used for move ordering and quiescence search. The caller is responsible for filtering out illegal moves and ensuring
 * @param bbs Bitboard map representing the current position
 * @param color Color of the side to move ('w' for white, 'b' for black)
 * @returns Array of pseudo-legal moves
 */
export function GeneratePseudoMoves(bbs: BitboardMap, color: 'w'|'b'): PseudoMove[] {
  const moves: PseudoMove[] = [];
  const keys = PieceKeysForColor(bbs, color);
  for (const key of keys) {
    const pieceBB: Bitboard = (bbs.get(key) as Bitboard) || 0n;
    const srcIdxs = BitboardToIndexes(pieceBB);
    const generator = MoveGeneratorMap.get(key.toLowerCase());
    if (!generator) continue;
    for (const src of srcIdxs) {
      const temp = new Map(bbs);
      temp.set(key, 1n << BigInt(src));
      const destBB = generator(temp, color);
      const destIdxs = BitboardToIndexes(destBB);
      for (const d of destIdxs) moves.push({
        piece: key,
        from: IndexToSquare(src),
        to: IndexToSquare(d),
        fromIndex: src,
        toIndex: d,
      });
    }
  }
  return moves;
}
