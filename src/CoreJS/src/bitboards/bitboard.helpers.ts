import { WK_BB_SQ } from "../board/board.const";
import { Bitboard, BitboardMap, Files, Ranks, SquareNames } from "../board/board.types";
import { Piece, PieceArray } from "../pieces/piece.types";

/**
 * Counts the number of bits set to 1 in a bigint bitboard.
 * @param num - The bigint representing the bitboard.
 * @returns The count of bits set to 1.
 */
export function countBits(num: bigint): number {
  let count = 0;
  while (num) {
    count += Number(num & BigInt(1));
    num = num >> BigInt(1);
  }
  return count;
}

/**
 * Checks if a given bitboard is empty (i.e., all bits are 0).
 * @param bitboard - The bigint representing the bitboard.
 * @returns True if the bitboard is empty, false otherwise.
 */
export const GetLocationFromIndex = (index: number): { column: Files; traverse: Ranks } => ({
  column: Files[index % 8],
  traverse: Ranks[Math.floor(index / 8)],
});

/**
 * Converts a column and traverse to a single index in the range of 0-63.
 * @param column - The column (e.g., "ColA", "ColB", etc.).
 * @param traverse - The traverse (e.g., "Row1", "Row2", etc.).
 * @returns The index corresponding to the column and traverse.
 * @throws Error if the column or traverse is invalid.
 */
export const GetIndexFromLocation = (column: Files, traverse: Ranks): number => {
  const columnIndex = Files.indexOf(column);
  const traverseIndex = Ranks.indexOf(traverse);
  if (columnIndex === -1 || traverseIndex === -1) {
    throw new Error(`Invalid column or traverse: ${column}, ${traverse}`);
  }
  return columnIndex + traverseIndex * 8;
};

/**
 * Converts a piece's position to its corresponding column and traverse.
 * @param piece - The piece object containing its position.
 * @returns An object with the column and traverse of the piece.
 * @throws Error if the piece position is invalid.
 */
export const GetPieceLocation = (piece: Piece): { column: Files; traverse: Ranks } => {
  const column = `Col${piece.position[0].toUpperCase()}` as Files;
  const traverse = `Row${piece.position[1]}` as Ranks;
  if (!Files.includes(column) || !Ranks.includes(traverse)) {
    throw new Error(`Invalid piece position: ${piece.position}`);
  }
  return { column, traverse };
};

export const GetBitboardFromPosition = (position: string): bigint => {
  const column = `Col${position[0].toUpperCase()}` as Files;
  const traverse = `Row${position[1]}` as Ranks;
  if (!Files.includes(column) || !Ranks.includes(traverse)) {
    throw new Error(`Invalid position: ${position}`);
  }
  const index = GetIndexFromLocation(column, traverse);
  return GetBitboardFromIndex(index);
};

/**
 * Converts an index (0-63) to a bitboard where the bit at that index is set to 1.
 * @param index - The index (0-63) for which to create the bitboard.
 * @returns A bigint representing the bitboard with the specified bit set.
 * @throws Error if the index is out of bounds.
 */
export const GetBitboardFromIndex = (index: number): bigint => {
  if (index < 0 || index >= 64) {
    throw new Error(`Index out of bounds: ${index}. Must be between 0 and 63.`);
  }
  return BigInt(1) << BigInt(index);
};

/**
 * Converts an array of pieces to a map of bitboards, where each key is the piece notation
 * and the value is a bigint representing the bitboard for that piece.
 * @param pieces - An array of Piece objects.
 * @returns A BitboardMap where keys are piece notations and values are their corresponding bitboards.
 */
export const GetBitboardMapFromPieces = (pieces: PieceArray): BitboardMap => {
  const bitboardMap: BitboardMap = new Map();
  for (const piece of pieces) {
    const loc = GetPieceLocation(piece);
    const index = GetIndexFromLocation(loc.column, loc.traverse);
    const bitboard = GetBitboardFromIndex(index);
    if (bitboardMap.has(piece.notation)) {
      bitboardMap.set(piece.notation, bitboardMap.get(piece.notation)! | bitboard);
    }
    else {
      bitboardMap.set(piece.notation, bitboard);
    }
  }
  return bitboardMap;
};

// export function getPieceBitboards(position: Problem): bigint[] {
//   const pieceBitboards: bigint[] = [];

//   // Iterate over each piece type
//   for (const pieceType of position.pieceTypes) {
//     let pieceBitboard: bigint = BigInt(0);

//     // Iterate over each square
//     for (let square = 0; square < 64; square++) {
//       const loc = GetLocationFromIndex(square);
//       // Check if the square contains the current piece type
//       if (position.GetPieceAt(loc.column, loc.traverse)?.ToFairyNotation() === pieceType) {
//         // Set the corresponding bit in the piece bitboard
//         pieceBitboard |= BigInt(1) << BigInt(square);
//       }
//     }

//     // Add the piece bitboard to the array
//     pieceBitboards.push(pieceBitboard);
//   }

//   return pieceBitboards;
// }

// export function getAllPiecesBitboard(position: Problem): bigint {
//   let allPiecesBitboards: bigint = BigInt(0);
//   // Iterate over each square
//   for (let square = 0; square < 64; square++) {
//     const loc = GetLocationFromIndex(square);
//     // Check if the square contains the current piece type
//     if (position.GetPieceAt(loc.column, loc.traverse)) {
//       // Set the corresponding bit in the piece bitboard
//       allPiecesBitboards |= BigInt(1) << BigInt(square);
//     }
//   }
//   return allPiecesBitboards;
// }

/**
 * Left shifts a bitboard by a specified number of bits.
 * This function ensures that the result fits within 64 bits by applying a mask.
 * @param bb
 * @param n
 * @returns
 */
export const bb_leftshift = (bb: bigint, n: number | bigint): bigint =>
  bb << BigInt(n) & 0xFFFFFFFFFFFFFFFFn; // Ensure it fits within 64 bits

export const bb_rightshift = (bb: bigint, n: number | bigint): bigint =>
  bb >> BigInt(n) & 0xFFFFFFFFFFFFFFFFn; // Ensure it fits within 64 bits

export const squareRx = /^[a-h][1-8]$/i;

/**
 * Converts a square name (e.g., "a1", "h8") to its corresponding bitboard.
 * Each square is represented by a bit in a 64-bit number, where the least significant
 * bit corresponds to "a1" and the most significant bit corresponds to "h8".
 * @param square - The square name in the format "a1", "h8", etc.
 * @throws Error if the square name is invalid.
 * @returns A bitboard with the bit corresponding to the square set to 1.
 */
export const getBBfromSquare = (square: SquareNames): Bitboard => {
  if (squareRx.test(square) === false) {
    throw new Error(`Invalid square name: ${square}`);
  }
  return WK_BB_SQ[square];
};
