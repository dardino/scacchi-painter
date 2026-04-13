import { BOARD_MASK, FILE_A, FILE_H } from "../../bitboards/bitboard.constants";
import { BB_BLACK, BB_WHITE } from "../../main";
import { PieceMoveGenerator } from "../piece.types";

export const BlackKingNotation = "k";
export const WhiteKingNotation = "K";

export const KingMoveGenerator: PieceMoveGenerator = (bbs, color) => {
  const kingBB = bbs.get(color === "w" ? WhiteKingNotation : BlackKingNotation) || 0n;
  if (kingBB === 0n) return 0n;

  const occupied = (bbs.get(BB_WHITE) || 0n) | (bbs.get(BB_BLACK) || 0n);

  // Generate all adjacent squares while avoiding file wrap-around
  const east = (kingBB & ~FILE_H) << 1n;
  const west = (kingBB & ~FILE_A) >> 1n;
  const north = (kingBB << 8n);
  const south = (kingBB >> 8n);
  const northEast = (kingBB & ~FILE_H) << 9n;
  const northWest = (kingBB & ~FILE_A) << 7n;
  const southEast = (kingBB & ~FILE_H) >> 7n;
  const southWest = (kingBB & ~FILE_A) >> 9n;

  const possible = (east | west | north | south | northEast | northWest | southEast | southWest) & BOARD_MASK;

  const sameColor = color === "w" ? (bbs.get(BB_WHITE) || 0n) : (bbs.get(BB_BLACK) || 0n);

  return possible & (~sameColor) & BOARD_MASK;
};

// Named export only; avoid default exports per project conventions
