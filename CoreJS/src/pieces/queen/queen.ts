import { BOARD_MASK } from "../../bitboards/bitboard.constants";
import { queenAttacksFrom } from "../../bitboards/sliding.attacks";
import { BB_BLACK, BB_WHITE } from "../../main";
import { PieceMoveGenerator } from "../piece.types";

export const BlackQueenNotation = "q";
export const WhiteQueenNotation = "Q";

// rook/bishop attacks implemented in bitboards/sliding.attacks.ts

export const QueenMoveGenerator: PieceMoveGenerator = (bbs, color) => {
  const queens = bbs.get(color === "w" ? WhiteQueenNotation : BlackQueenNotation) || 0n;
  if (queens === 0n) return 0n;

  const occ = (bbs.get(BB_WHITE) || 0n) | (bbs.get(BB_BLACK) || 0n);

  let attacks = 0n;
  let temp = queens;
  while (temp) {
    const sq = temp & -temp;
    attacks |= queenAttacksFrom(sq, occ);
    temp &= temp - 1n;
  }

  const sameColor = color === "w" ? (bbs.get(BB_WHITE) || 0n) : (bbs.get(BB_BLACK) || 0n);
  return attacks & (~sameColor) & BOARD_MASK;
};
