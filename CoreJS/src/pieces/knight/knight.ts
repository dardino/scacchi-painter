import { BOARD_MASK, FILE_A, FILE_B, FILE_G, FILE_H } from "../../bitboards/bitboard.constants";
import { BB_BLACK, BB_WHITE } from "../../main";
import { PieceMoveGenerator } from "../piece.types";

export const BlackKnightNotation = "n";
export const WhiteKnightNotation = "N";

export const KnightMoveGenerator: PieceMoveGenerator = (bbs, color) => {
  const knights = bbs.get(color === "w" ? WhiteKnightNotation : BlackKnightNotation) || 0n;
  if (knights === 0n) return 0n;

  // masks to avoid wrap-around when shifting
  const notA = ~FILE_A & BOARD_MASK;
  const notAB = ~(FILE_A | FILE_B) & BOARD_MASK;
  const notH = ~FILE_H & BOARD_MASK;
  const notGH = ~(FILE_H | FILE_G) & BOARD_MASK;

  const moves = (
    ((knights & notH) << 17n) |
    ((knights & notA) << 15n) |
    ((knights & notGH) << 10n) |
    ((knights & notAB) << 6n) |
    ((knights & notA) >> 17n) |
    ((knights & notH) >> 15n) |
    ((knights & notAB) >> 10n) |
    ((knights & notGH) >> 6n)
  ) & BOARD_MASK;

  const sameColor = color === "w" ? (bbs.get(BB_WHITE) || 0n) : (bbs.get(BB_BLACK) || 0n);

  return moves & (~sameColor) & BOARD_MASK;
};
