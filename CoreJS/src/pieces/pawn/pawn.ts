import { BB_BLACK, BB_WHITE, Bitboard, getBBfromSquare } from "../../main";
import { SquareNames } from "../../moves/move.types";
import { PieceMoveGenerator } from "../piece.types";

export const BlackPawnNotation = "p"; // Notation for black Pawn
export const WhitePawnNotation = "P"; // Notation for white Pawn

export const StartingWhitePawnBitboard: Bitboard = 0x000000000000FF00n; // White pawns on the second rank
export const StartingBlackPawnBitboard: Bitboard = 0x00FF000000000000n; // Black pawns on the seventh rank
export const AllPawnBitboard: Bitboard = StartingWhitePawnBitboard | StartingBlackPawnBitboard; // Combined bitboard of all pawns
const FILE_A = 0x0101010101010101n;
const FILE_H = 0x8080808080808080n;
const BOARD_MASK = 0xFFFFFFFFFFFFFFFFn;

const getPawnsInStartingPosition = (bitboard: Bitboard, color: "w" | "b"): Bitboard => {
  return color === "w"
    ? StartingWhitePawnBitboard & bitboard
    : StartingBlackPawnBitboard & bitboard;
};

export const PawnMoveGenerator: PieceMoveGenerator = (bbs, color, lastMove) => {
  const pawnsBitboard = bbs.get(color === "w" ? WhitePawnNotation : BlackPawnNotation) || 0n;
  const pawnsInStartingPosition = getPawnsInStartingPosition(pawnsBitboard, color);

  const pawnsMoves = color === "w"
    ? ((pawnsBitboard << 8n) | (pawnsInStartingPosition << 16n)) & BOARD_MASK
    : ((pawnsBitboard >> 8n) | (pawnsInStartingPosition >> 16n)) & BOARD_MASK;

  let enPassantEnemies = 0n;
  if (lastMove) {
    const match = lastMove.match(/^([A-Za-z])-([a-h][1-8])-([a-h][1-8])$/);
    if (match) {
      const [, piece, from, to] = match;
      if (piece.toLowerCase() === "p") {
        const fromRank = from[1];
        const toRank = to[1];
        const toFile = to[0];
        if (color === "w" && fromRank === "7" && toRank === "5") {
          const enPassantSquare = `${toFile}6` as SquareNames;
          enPassantEnemies = getBBfromSquare(enPassantSquare);
        }
        else if (color === "b" && fromRank === "2" && toRank === "4") {
          const enPassantSquare = `${toFile}3` as SquareNames;
          enPassantEnemies = getBBfromSquare(enPassantSquare);
        }
      }
    }
  }

  const enemyBitboard = (bbs.get(color === "w" ? BB_BLACK : BB_WHITE) || 0n) | enPassantEnemies;

  const captureCandidates = color === "w"
    ? (((pawnsBitboard & ~FILE_A) << 7n) | ((pawnsBitboard & ~FILE_H) << 9n)) & BOARD_MASK
    : (((pawnsBitboard & ~FILE_H) >> 7n) | ((pawnsBitboard & ~FILE_A) >> 9n)) & BOARD_MASK;

  const captureMoves = captureCandidates & enemyBitboard;

  return pawnsMoves | captureMoves;
};
