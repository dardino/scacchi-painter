import { BishopAttacks, BishopBits, BishopMasks, BishopOffsets, RookAttacks, RookBits, RookMasks, RookOffsets } from "./attacks.tables";

const DEBRUIJN64 = 0x03f79d71b4cb0a89n;
const DEBRUIJN_INDEX = [
  0,1,48,2,57,49,28,3,61,58,50,42,38,29,17,4,
  62,55,59,36,53,51,43,22,45,39,33,30,24,18,12,5,
  63,47,56,27,60,41,37,16,54,35,52,21,44,32,23,11,
  46,26,40,15,34,20,31,10,25,14,19,9,13,8,7,6
];

const BIT = (i: number) => 1n << BigInt(i);

function bitScanForward(lsb: bigint): number {
  // assumes lsb is power of two
  const idx = Number((lsb * DEBRUIJN64) >> 58n) & 63;
  return DEBRUIJN_INDEX[idx];
}

export const rookAttacksFrom = (start: bigint, occ: bigint): bigint => {
  if (start === 0n) return 0n;
  const sq = bitScanForward(start);
  const mask = RookMasks[sq];
  const bits = RookBits[sq];
  let occSub = occ & mask;
  let idx = 0;
  for (let i = 0; i < bits.length; i++) {
    if ((occSub & BIT(bits[i])) !== 0n) idx |= (1 << i);
  }
  const base = RookOffsets[sq];
  return RookAttacks[base + idx];
};

export const bishopAttacksFrom = (start: bigint, occ: bigint): bigint => {
  if (start === 0n) return 0n;
  const sq = bitScanForward(start);
  const mask = BishopMasks[sq];
  const bits = BishopBits[sq];
  let occSub = occ & mask;
  let idx = 0;
  for (let i = 0; i < bits.length; i++) {
    if ((occSub & BIT(bits[i])) !== 0n) idx |= (1 << i);
  }
  const base = BishopOffsets[sq];
  return BishopAttacks[base + idx];
};

export const queenAttacksFrom = (start: bigint, occ: bigint): bigint =>
  rookAttacksFrom(start, occ) | bishopAttacksFrom(start, occ);
