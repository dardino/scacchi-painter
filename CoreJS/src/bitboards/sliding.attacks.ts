import { BOARD_MASK, FILE_A, FILE_H } from "./bitboard.constants";

export const rookAttacksFrom = (start: bigint, occ: bigint): bigint => {
  let attacks = 0n;
  let s = start;

  // north
  while (true) {
    s = (s << 8n) & BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  // south
  s = start;
  while (true) {
    s = (s >> 8n) & BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  // east
  s = start;
  while (true) {
    s = (s & ~FILE_H) << 1n;
    s &= BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  // west
  s = start;
  while (true) {
    s = (s & ~FILE_A) >> 1n;
    s &= BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  return attacks;
};

export const bishopAttacksFrom = (start: bigint, occ: bigint): bigint => {
  let attacks = 0n;
  let s = start;

  // north-east
  while (true) {
    s = (s & ~FILE_H) << 9n;
    s &= BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  // north-west
  s = start;
  while (true) {
    s = (s & ~FILE_A) << 7n;
    s &= BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  // south-east
  s = start;
  while (true) {
    s = (s & ~FILE_H) >> 7n;
    s &= BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  // south-west
  s = start;
  while (true) {
    s = (s & ~FILE_A) >> 9n;
    s &= BOARD_MASK;
    if (s === 0n) break;
    attacks |= s;
    if (s & occ) break;
  }

  return attacks;
};

export const queenAttacksFrom = (start: bigint, occ: bigint): bigint =>
  rookAttacksFrom(start, occ) | bishopAttacksFrom(start, occ);
