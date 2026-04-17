import { BitboardToIndexes } from '../bitboards/bitboard.helpers';
import { BitboardMap, VaildBBMapKey } from '../board/board.types';

// Simple deterministic 64-bit RNG for generating Zobrist keys
let _zr_seed = 123456789n;
const MASK64 = (1n << 64n) - 1n;

function nextRand64(): bigint {
  // xorshift64* style (deterministic)
  let x = _zr_seed;
  x ^= (x << 13n) & MASK64;
  x ^= (x >> 7n) & MASK64;
  x ^= (x << 17n) & MASK64;
  _zr_seed = x & MASK64;
  return _zr_seed;
}

const PIECE_KEYS = ['P','N','B','R','Q','K','p','n','b','r','q','k'];

// pieceRandoms[piece][squareIndex]
export const pieceRandoms: Record<string, bigint[]> = {} as any;
for (const p of PIECE_KEYS) {
  const arr: bigint[] = new Array(64);
  for (let i = 0; i < 64; i++) arr[i] = nextRand64();
  pieceRandoms[p] = arr;
}

export const sideRandom = nextRand64();

/**
 * Computes the Zobrist hash key for the given board state represented by the BitboardMap and the side to move.
 * The Zobrist key is a 64-bit integer that uniquely represents the position of pieces on the board and the player to move.
 * It is computed by XORing random values assigned to each piece on each square,
 * as well as a random value for the side to move.
 * @param bbs The BitboardMap representing the current board state, where keys are piece identifiers
 * (e.g., 'P', 'N', 'B', 'R', 'Q', 'K' for white pieces and lowercase for black pieces)
 * and values are bitboards indicating the positions of those pieces on the board.
 * @param sideToMove A string indicating which player's turn it is ('w' for white, 'b' for black).
 * This affects the Zobrist key by XORing a specific random value if it's black's turn.
 * @returns The Zobrist hash key as a bigint.
 */
export function computeZobristKey(bbs: BitboardMap, sideToMove: 'w' | 'b'): bigint {
  let key = 0n;
  for (const [k, v] of bbs.entries()) {
    if (!VaildBBMapKey(k)) continue; // skip occupancy keys
    const arr = pieceRandoms[k];
    if (!arr) continue;
    const bb = v as bigint;
    const idxs = BitboardToIndexes(bb);
    for (const idx of idxs) key ^= arr[idx];
  }
  if (sideToMove === 'b') key ^= sideRandom;
  return key & MASK64;
}

// No default export — use named exports only
