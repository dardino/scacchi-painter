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

export function bitboardToIndexes(bb: bigint): number[] {
  const out: number[] = [];
  for (let i = 0; i < 64; i++) if (((bb >> BigInt(i)) & 1n) === 1n) out.push(i);
  return out;
}

import { BitboardMap } from '../board/board.types';

export function computeZobristKey(bbs: BitboardMap, sideToMove: 'w' | 'b'): bigint {
  let key = 0n;
  for (const [k, v] of bbs.entries()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue; // skip occupancy keys
    const arr = pieceRandoms[k];
    if (!arr) continue;
    const bb = v as bigint;
    const idxs = bitboardToIndexes(bb);
    for (const idx of idxs) key ^= arr[idx];
  }
  if (sideToMove === 'b') key ^= sideRandom;
  return key & MASK64;
}

export default { computeZobristKey };
