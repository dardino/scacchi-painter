import { BOARD_MASK } from "../../bitboards/bitboard.constants";
import { rookAttacksFrom } from "../../bitboards/sliding.attacks";
import { BB_BLACK, BB_WHITE } from "../../main";
import { PieceMoveGenerator } from "../piece.types";

export const BlackRookNotation = "r";
export const WhiteRookNotation = "R";

// rookAttacksFrom implemented in bitboards/sliding.attacks.ts

export const RookMoveGenerator: PieceMoveGenerator = (bbs, color) => {
  const rooks = bbs.get(color === "w" ? WhiteRookNotation : BlackRookNotation) || 0n;
  if (rooks === 0n) return 0n;

  const occ = (bbs.get(BB_WHITE) || 0n) | (bbs.get(BB_BLACK) || 0n);

  let attacks = 0n;
  let temp = rooks;
  while (temp) {
    const sq = temp & -temp; // lsb
    attacks |= rookAttacksFrom(sq, occ);
    temp &= temp - 1n;
  }

  const sameColor = color === "w" ? (bbs.get(BB_WHITE) || 0n) : (bbs.get(BB_BLACK) || 0n);
  return attacks & (~sameColor) & BOARD_MASK;
};
