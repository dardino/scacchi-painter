import { BB_BLACK, BB_WHITE, Bitboard, BitboardMap } from '../board/board.types';
import { MoveGeneratorMap } from '../pieces/piece.helpers';

const INF = 1_000_000;

function BIT(i: number) { return 1n << BigInt(i); }

function bitboardToIndexes(bb: Bitboard): number[] {
  const out: number[] = [];
  for (let i = 0; i < 64; i++) if (((bb >> BigInt(i)) & 1n) === 1n) out.push(i);
  return out;
}

function indexToSquare(idx: number): string {
  const file = String.fromCharCode(97 + (idx % 8));
  const rank = Math.floor(idx / 8) + 1;
  return `${file}${rank}`;
}

type Move = { pieceKey: string; from: number; to: number };

function pieceKeysForColor(bbs: BitboardMap, color: 'w' | 'b'): string[] {
  const keys: string[] = [];
  for (const k of bbs.keys()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    if (color === 'w' && k === k.toUpperCase()) keys.push(k);
    if (color === 'b' && k === k.toLowerCase()) keys.push(k);
  }
  return keys;
}

function generatePseudoMoves(bbs: BitboardMap, color: 'w'|'b'): Move[] {
  const moves: Move[] = [];
  const keys = pieceKeysForColor(bbs, color);
  for (const key of keys) {
    const pieceBB: Bitboard = (bbs.get(key) as Bitboard) || 0n;
    const srcIdxs = bitboardToIndexes(pieceBB);
    const generator = MoveGeneratorMap.get(key.toLowerCase());
    if (!generator) continue;
    for (const src of srcIdxs) {
      const temp = new Map(bbs);
      temp.set(key, 1n << BigInt(src));
      const destBB = generator(temp as any, color as 'w'|'b');
      const destIdxs = bitboardToIndexes(destBB as Bitboard);
      for (const d of destIdxs) moves.push({ pieceKey: key, from: src, to: d });
    }
  }
  return moves;
}

function findPieceAt(bbs: BitboardMap, sqIdx: number): string | null {
  for (const [k, v] of bbs.entries()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    if ((v & BIT(sqIdx)) !== 0n) return k;
  }
  return null;
}

function recomputeOccupancies(bbs: BitboardMap) {
  let whiteOcc = 0n;
  let blackOcc = 0n;
  for (const [k, v] of bbs.entries()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    if (k === k.toUpperCase()) whiteOcc |= v as Bitboard;
    else blackOcc |= v as Bitboard;
  }
  bbs.set(BB_WHITE, whiteOcc as unknown as Bitboard);
  bbs.set(BB_BLACK, blackOcc as unknown as Bitboard);
}

function applyMove(bbs: BitboardMap, mv: Move) {
  const pieceKey = mv.pieceKey;
  const oldPieceBB = bbs.get(pieceKey) as Bitboard || 0n;
  const oldCapturedKey = findPieceAt(bbs, mv.to);
  const oldCapturedBB = oldCapturedKey ? (bbs.get(oldCapturedKey) as Bitboard) : undefined;

  const newPieceBB = (oldPieceBB & ~BIT(mv.from)) | BIT(mv.to);
  bbs.set(pieceKey, newPieceBB as Bitboard);
  if (oldCapturedKey) bbs.set(oldCapturedKey!, (oldCapturedBB! & ~BIT(mv.to)) as Bitboard);

  const oldWhite = bbs.get(BB_WHITE) as Bitboard | undefined;
  const oldBlack = bbs.get(BB_BLACK) as Bitboard | undefined;
  recomputeOccupancies(bbs);

  return { pieceKey, oldPieceBB, capturedKey: oldCapturedKey, oldCapturedBB, oldWhite, oldBlack };
}

function undoMove(bbs: BitboardMap, mv: Move, info: any) {
  bbs.set(info.pieceKey, info.oldPieceBB as Bitboard);
  if (info.capturedKey) bbs.set(info.capturedKey, info.oldCapturedBB as Bitboard);
  if (info.oldWhite !== undefined) bbs.set(BB_WHITE, info.oldWhite as Bitboard);
  if (info.oldBlack !== undefined) bbs.set(BB_BLACK, info.oldBlack as Bitboard);
}

function isSquareAttacked(bbs: BitboardMap, sqIdx: number, byColor: 'w'|'b') {
  for (const gen of MoveGeneratorMap.values()) {
    const attacks = gen(bbs as any, byColor as 'w'|'b');
    if ((attacks & BIT(sqIdx)) !== 0n) return true;
  }
  return false;
}

function findKingSquare(bbs: BitboardMap, color: 'w'|'b'): number | null {
  const kingKey = color === 'w' ? 'K' : 'k';
  const bb = bbs.get(kingKey) as Bitboard || 0n;
  if (bb === 0n) return null;
  const idxs = bitboardToIndexes(bb);
  return idxs.length ? idxs[0] : null;
}

function evaluate(bbs: BitboardMap): number {
  const values: Record<string, number> = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000 };
  let score = 0;
  for (const [k, v] of bbs.entries()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    const cnt = bitboardToIndexes(v as Bitboard).length;
    const base = values[k.toUpperCase()] || 0;
    if (k === k.toUpperCase()) score += base * cnt;
    else score -= base * cnt;
  }
  return score;
}

export async function search(bbs: BitboardMap, color: 'w'|'b', maxDepth: number, timeLimitMs: number) {
  let nodes = 0;
  const start = Date.now();
  let abort = false;

  function timeUp() { return Date.now() - start > timeLimitMs; }

  function legalMoves(position: BitboardMap, side: 'w'|'b') {
    const pseudo = generatePseudoMoves(position, side);
    const legal: Move[] = [];
    for (const mv of pseudo) {
      const info = applyMove(position, mv);
      const kingSq = findKingSquare(position, side);
      const inCheck = kingSq !== null ? isSquareAttacked(position, kingSq, side === 'w' ? 'b' : 'w') : false;
      undoMove(position, mv, info);
      if (!inCheck) legal.push(mv);
    }
    return legal;
  }

  function negamax(position: BitboardMap, depth: number, alpha: number, beta: number, side: 'w'|'b'): number {
    if (abort) return 0;
    if (timeUp()) { abort = true; return 0; }
    nodes++;
    if (depth === 0) return evaluate(position) * (side === 'w' ? 1 : -1);

    const moves = legalMoves(position, side);
    if (moves.length === 0) {
      const kingSq = findKingSquare(position, side);
      const inCheck = kingSq !== null ? isSquareAttacked(position, kingSq, side === 'w' ? 'b' : 'w') : false;
      if (inCheck) return -INF + (maxDepth - depth);
      return 0; // stalemate
    }

    let best = -INF;
    for (const mv of moves) {
      const info = applyMove(position, mv);
      const val = -negamax(position, depth - 1, -beta, -alpha, side === 'w' ? 'b' : 'w');
      undoMove(position, mv, info);
      if (abort) return 0;
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (alpha >= beta) break;
    }
    return best;
  }

  let bestLine: string[] = [];
  let bestScore = 0;

  // iterative deepening
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (timeUp()) break;
    const moves = legalMoves(bbs, color);
    let localBestScore = -INF;
    let localBestMove: Move | null = null;
    for (const mv of moves) {
      const info = applyMove(bbs, mv);
      const score = -negamax(bbs, depth - 1, -INF, INF, color === 'w' ? 'b' : 'w');
      undoMove(bbs, mv, info);
      if (abort) break;
      if (score > localBestScore) { localBestScore = score; localBestMove = mv; }
    }
    if (abort) break;
    if (localBestMove) {
      bestLine = [`${localBestMove.pieceKey}-${indexToSquare(localBestMove.from)}-${indexToSquare(localBestMove.to)}`];
      bestScore = localBestScore;
    }
    if (Math.abs(localBestScore) > INF/2) break; // found mate
  }

  const timeMs = Date.now() - start;
  return { bestLine, nodes, timeMs, score: bestScore, mateIn: Math.abs(bestScore) > INF/2 ? Math.round((INF - Math.abs(bestScore))/2) : null, aborted: abort };
}

export default { search };
