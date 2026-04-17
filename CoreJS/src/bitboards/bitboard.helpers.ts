import { WK_BB_SQ } from "../board/board.const";
import { BB_BLACK, BB_WHITE, Bitboard, BitboardMap, Files, Ranks, VaildBBMapKey } from "../board/board.types";
import { SquareNames } from "../moves/move.types";
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
 * Converts a bitboard to an array of indexes where the bits are set to 1.
 * @param bb - The bigint representing the bitboard.
 * @returns An array of indexes (0-63) where the bits in the bitboard are set to 1.
 */
export function BitboardToIndexes(bb: Bitboard): number[] {
  const out: number[] = [];
  for (let i = 0; i < 64; i++) if (((bb >> BigInt(i)) & 1n) === 1n) out.push(i);
  return out;
}

/**
 * Converts an index (0-63) to a square name (e.g., "a1", "h8").
 * @param idx - The index to convert.
 * @returns The square name corresponding to the index.
 */
export function IndexToSquare(idx: number): SquareNames {
  const file = String.fromCharCode(97 + (idx % 8));
  const rank = Math.floor(idx / 8) + 1;
  return `${file}${rank}` as SquareNames;
}

/**
 * Converts a square name (e.g., "a1", "h8") to its corresponding index (0-63).
 * @param square - The square name to convert.
 * @returns The index corresponding to the square name.
 */
export function SquareToIndex(square: SquareNames): number {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  return rank * 8 + file;
}

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

/**
 * Left shifts a bitboard by a specified number of bits.
 * This function ensures that the result fits within 64 bits by applying a mask.
 * @param bb - The bitboard to shift.
 * @param n - The number of bits to shift.
 * @returns The shifted bitboard.
 */
export const bb_leftshift = (bb: bigint, n: number | bigint): bigint =>
  bb << BigInt(n) & 0xFFFFFFFFFFFFFFFFn; // Ensure it fits within 64 bits

/**
 * Right shifts a bitboard by a specified number of bits.
 * This function ensures that the result fits within 64 bits by applying a mask.
 * @param bb - The bitboard to shift.
 * @param n - The number of bits to shift.
 * @returns The shifted bitboard.
 */
export const bb_rightshift = (bb: bigint, n: number | bigint): bigint =>
  bb >> BigInt(n) & 0xFFFFFFFFFFFFFFFFn; // Ensure it fits within 64 bits

export const squareRx = /^[a-h][1-8]$/i;


/**
 * Returns a bigint with only the bit at index `i` set to 1.
 * @param i - The index of the bit to set (0-63).
 * @returns A bigint with the specified bit set.
 */
export function BIT(i: number) { return 1n << BigInt(i); }

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

/**
 * Returns an array of piece keys (e.g., 'P', 'N', 'B', 'R', 'Q', 'K' for white pieces and lowercase for black pieces) 
 * that are present in the given BitboardMap for the specified color.
 * @param bbs - The BitboardMap containing piece bitboards.
 * @param color - The color of pieces to filter ('w' for white, 'b' for black).
 * @returns An array of piece keys corresponding to the specified color.
 */
export function PieceKeysForColor(bbs: BitboardMap, color: 'w' | 'b'): string[] {
  const keys: string[] = [];
  for (const k of bbs.keys()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    if (color === 'w' && k === k.toUpperCase()) keys.push(k);
    if (color === 'b' && k === k.toLowerCase()) keys.push(k);
  }
  return keys;
}

/**
 * Finds the piece key (e.g., 'P', 'N', 'B', 'R', 'Q', 'K' for white pieces and lowercase for black pieces)
 * at a given square index in the BitboardMap.
 * @param bbs - The BitboardMap containing piece bitboards.
 * @param sqIdx - The index of the square to check (0-63).
 * @returns The piece key at the specified square, or null if no piece is found.
 */
export function FindPieceAtIndex(bbs: BitboardMap, sqIdx: number): string | null {
  const sqBB = BIT(sqIdx);
  for (const [k, v] of bbs.entries()) {
    if (!VaildBBMapKey(k)) continue;
    if ((v & sqBB) !== 0n) return k;
  }
  return null;
}

/**
 * Recomputes the occupancy bitboards for white and black pieces in the given BitboardMap.
 * This function iterates through all piece bitboards in the map and updates the occupancy bitboards
 * for white and black pieces accordingly. It should be called after any move is applied to ensure
 * that the occupancy bitboards remain accurate.
 * @param bbs - The BitboardMap containing piece bitboards and occupancy bitboards (BB_WHITE and BB_BLACK).
 */
export function RecomputeOccupancies(bbs: BitboardMap) {
  let whiteOcc: Bitboard = 0n;
  let blackOcc: Bitboard = 0n;
  for (const [k, v] of bbs.entries()) {
    if (!VaildBBMapKey(k)) continue;
    if (k === k.toUpperCase()) whiteOcc |= v as Bitboard;
    else blackOcc |= v as Bitboard;
  }
  bbs.set(BB_WHITE, whiteOcc);
  bbs.set(BB_BLACK, blackOcc);
}
