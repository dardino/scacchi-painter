import { BB_BLACK, BB_WHITE, Bitboard, BitboardMap } from '../board/board.types';
import { MoveGeneratorMap } from '../pieces/piece.helpers';
import { TT } from './tt';
import { computeZobristKey } from './zobrist';

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
const PIECE_VALUES: Record<string, number> = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000 };

function evaluate(bbs: BitboardMap): number {
  let score = 0;
  for (const [k, v] of bbs.entries()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    const cnt = bitboardToIndexes(v as Bitboard).length;
    const base = PIECE_VALUES[k.toUpperCase()] || 0;
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

  // heuristics
  const killerMoves: Map<number, string[]> = new Map(); // depth -> [killer1, killer2]
  const history: Map<string, number> = new Map();

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

  function quiescence(position: BitboardMap, alpha: number, beta: number, side: 'w'|'b'): number {
    if (abort) return 0;
    if (timeUp()) { abort = true; return 0; }
    nodes++;
    let stand = evaluate(position) * (side === 'w' ? 1 : -1);
    if (stand >= beta) return stand;
    if (alpha < stand) alpha = stand;
    let caps = generatePseudoMoves(position, side).filter(mv => !!findPieceAt(position, mv.to));
    if (caps.length === 0) return stand;
    // MVV-LVA ordering for captures
    caps.sort((a, b) => {
      const aVictim = findPieceAt(position, a.to);
      const bVictim = findPieceAt(position, b.to);
      const aVal = (aVictim ? PIECE_VALUES[aVictim.toUpperCase()] : 0) - (PIECE_VALUES[a.pieceKey.toUpperCase()] || 0);
      const bVal = (bVictim ? PIECE_VALUES[bVictim.toUpperCase()] : 0) - (PIECE_VALUES[b.pieceKey.toUpperCase()] || 0);
      return bVal - aVal;
    });
    for (const mv of caps) {
      const info = applyMove(position, mv);
      const score = -quiescence(position, -beta, -alpha, side === 'w' ? 'b' : 'w');
      undoMove(position, mv, info);
      if (abort) return 0;
      if (score >= beta) return score;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function scoreMove(position: BitboardMap, mv: Move, depth: number): number {
    let s = 0;
    const mvStr = `${mv.pieceKey}-${indexToSquare(mv.from)}-${indexToSquare(mv.to)}`;
    const captured = findPieceAt(position, mv.to);
    if (captured) {
      const victimVal = PIECE_VALUES[captured.toUpperCase()] || 0;
      const attackerVal = PIECE_VALUES[mv.pieceKey.toUpperCase()] || 0;
      s += 100000 + (victimVal * 100 - attackerVal);
    }
    const killers = killerMoves.get(depth);
    if (killers && killers.includes(mvStr)) s += 5000;
    s += history.get(mvStr) || 0;
    return s;
  }

  function negamax(position: BitboardMap, depth: number, alpha: number, beta: number, side: 'w'|'b'): number {
    if (abort) return 0;
    if (timeUp()) { abort = true; return 0; }
    nodes++;
    const key = computeZobristKey(position, side);
    const ttEntry = TT.probe(key);
    const alphaOrig = alpha;
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'EXACT') return ttEntry.score;
      if (ttEntry.flag === 'LOWER') alpha = Math.max(alpha, ttEntry.score);
      else if (ttEntry.flag === 'UPPER') beta = Math.min(beta, ttEntry.score);
      if (alpha >= beta) return ttEntry.score;
    }
    if (depth === 0) return quiescence(position, alpha, beta, side);

    const moves = legalMoves(position, side);
    if (moves.length === 0) {
      const kingSq = findKingSquare(position, side);
      const inCheck = kingSq !== null ? isSquareAttacked(position, kingSq, side === 'w' ? 'b' : 'w') : false;
      if (inCheck) return -INF + (maxDepth - depth);
      return 0; // stalemate
    }

    // move ordering
    moves.sort((a, b) => scoreMove(position, b, depth) - scoreMove(position, a, depth));

    let best = -INF;
    let bestMoveStr: string | undefined;
    for (const mv of moves) {
      const info = applyMove(position, mv);
      const val = -negamax(position, depth - 1, -beta, -alpha, side === 'w' ? 'b' : 'w');
      undoMove(position, mv, info);
      if (abort) return 0;
      const mvStr = `${mv.pieceKey}-${indexToSquare(mv.from)}-${indexToSquare(mv.to)}`;
      if (val > best) { best = val; bestMoveStr = mvStr; }
      if (val > alpha) alpha = val;
      if (alpha >= beta) {
        // killer & history update for non-captures that cause cutoffs
        if (!findPieceAt(position, mv.to)) {
          const arr = killerMoves.get(depth) || [];
          if (arr[0] !== mvStr) { arr.unshift(mvStr); if (arr.length > 2) arr.length = 2; killerMoves.set(depth, arr); }
          const hist = history.get(mvStr) || 0; history.set(mvStr, hist + depth * depth);
        }
        break;
      }
    }

    // store in TT
    try {
      const flag: 'EXACT' | 'LOWER' | 'UPPER' = best <= alphaOrig ? 'UPPER' : (best >= beta ? 'LOWER' : 'EXACT');
      TT.store(key, { key, depth, score: best, flag, best: bestMoveStr });
    } catch (e) {
      // ignore
    }

    return best;
  }

  let bestLine: string[] = [];
  let bestScore = 0;

  // iterative deepening
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (timeUp()) break;
    const moves = legalMoves(bbs, color);
    moves.sort((a, b) => scoreMove(bbs, b, depth) - scoreMove(bbs, a, depth));
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
