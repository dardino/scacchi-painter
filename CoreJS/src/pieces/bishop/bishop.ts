import { BOARD_MASK } from "../../bitboards/bitboard.constants";
import { bishopAttacksFrom } from "../../bitboards/sliding.attacks";
import { BB_BLACK, BB_WHITE } from "../../main";
import { PieceMoveGenerator } from "../piece.types";

const BlackBishopNotation = "b";
const WhiteBishopNotation = "B";

// bishopAttacksFrom implemented in bitboards/sliding.attacks.ts

const BishopMoveGenerator: PieceMoveGenerator<"B"> = (bbs, color) => {
  const bishops = bbs.get(color === "w" ? WhiteBishopNotation : BlackBishopNotation) || 0n;
  if (bishops === 0n) return 0n;

  const occ = (bbs.get(BB_WHITE) || 0n) | (bbs.get(BB_BLACK) || 0n);

  let attacks = 0n;
  let temp = bishops;
  while (temp) {
    const sq = temp & -temp;
    attacks |= bishopAttacksFrom(sq, occ);
    temp &= temp - 1n;
  }

  const sameColor = color === "w" ? (bbs.get(BB_WHITE) || 0n) : (bbs.get(BB_BLACK) || 0n);
  return attacks & (~sameColor) & BOARD_MASK;
};

BishopMoveGenerator.pieceW = WhiteBishopNotation;
BishopMoveGenerator.pieceB = BlackBishopNotation;
export { BishopMoveGenerator };
