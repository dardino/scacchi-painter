import { BB_BLACK, BB_WHITE, Bitboard, getBBfromSquare } from "../../main";
import { parseMove } from "../../moves/move.helpers";
import { SquareNames } from "../../moves/move.types";
import { PieceMoveGenerator } from "../piece.types";

export const BlackPawnNotation = "p"; // Notation for black Pawn
export const WhitePawnNotation = "P"; // Notation for white Pawn

export const StartingWhitePawnBitboard: Bitboard = 0x000000000000FF00n; // White pawns on the second rank
export const StartingBlackPawnBitboard: Bitboard = 0x00FF000000000000n; // Black pawns on the seventh rank
export const AllPawnBitboard: Bitboard = StartingWhitePawnBitboard | StartingBlackPawnBitboard; // Combined bitboard of all pawns

const getPawnsInStartingPosition = (bitboard: Bitboard, color: "w" | "b"): Bitboard => {
  return color === "w"
    ? StartingWhitePawnBitboard & bitboard
    : StartingBlackPawnBitboard & bitboard;
};

export const PawnMoveGenerator: PieceMoveGenerator = (bbs, color, lastMove) => {
  // This function will generate pawn moves based on the current board state
  // It will use the bitboards to determine valid moves for pawns
  // The logic will depend on the color of the pawns and their positions
  const pawnsBitboard = bbs.get(color === "w" ? WhitePawnNotation : BlackPawnNotation) || 0n;
  // get bitboard of moving pawns depending on color
  const offset = color === "w" ? -8n : 8n; // Offset for pawn movement (up for white, down for black)
  const pawnsInStartingPosition = getPawnsInStartingPosition(pawnsBitboard, color);

  // pawns moves is a bitboard of all pawns up to 2 ranks from the starting position
  const pawnsMoves = 0n
    | pawnsBitboard >> offset // Move pawns one rank forward
    | pawnsInStartingPosition >> (offset * 2n); // Move starting pawns 2 rank forward

  // enemy pieces can be captured diagonally
  const captureOffset = color === "w" ? 7n : -9n;

  // check for en passant captures
  // This logic would depend on the last move made and the current position of the pawns
  let enPassantEnemies = 0n; // Placeholder for en passant capture logic
  if (lastMove) {
    const [piece, from, to] = parseMove(lastMove);
    if (piece.toLowerCase() === "p" // Check if the last move was a pawn move
      && (
        (from[1] === "2" && to[1] === "4" && color === "w") // Check if the last move was a double pawn move for white
        || (from[1] === "7" && to[1] === "5" && color === "b") // Check if the last move was a double pawn move for black
      )
    ) {
      const enPassantSquare: SquareNames = color === "w"
        ? (to[0] + "5") as SquareNames
        : (to[0] + "4" as SquareNames); // Calculate the en passant square based on the last move
      enPassantEnemies = getBBfromSquare(enPassantSquare); // Get the bitboard for the en passant square
    }
  }

  // Get the enemy pieces bitboard adding the en passant capture logic
  // This assumes that the enemy pieces are represented by BB_BLACK for black and BB_WHITE for white
  const enemyBitboard = (bbs.get(color === "w" ? BB_BLACK : BB_WHITE) || 0n) | enPassantEnemies; // Get the enemy pieces bitboard

  const captureMoves = 0n
    | (pawnsBitboard & (enemyBitboard >> captureOffset)) // Capture left diagonal
    | (pawnsBitboard & (enemyBitboard >> (captureOffset + 2n))); // Capture right diagonal

  // Pawn move generator logic
  return pawnsMoves | captureMoves; // Placeholder for the actual bitboard of pawn moves
};
