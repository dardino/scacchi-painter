import { BB_BLACK, BB_WHITE, Bitboard, BitboardMap } from '../board/board.types';
import { BIT, BitboardToIndexes, FindPieceAtIndex, IndexToSquare, LegalMove, PseudoMove, RecomputeOccupancies } from '../main';
import { GeneratePseudoMoves } from '../moves/move.helpers';
import { MoveGeneratorMap } from '../pieces/piece.helpers';
import { TT } from './tt';
import { computeZobristKey } from './zobrist';

const INF = 1_000_000;

interface AfterMoveInfo {
  pieceKey: string;
  oldPieceBB: Bitboard;
  capture: {
    pieceKey: string | null;
    oldPieceBB: Bitboard | null;
  } | null;
  oldWhite: Bitboard | null;
  oldBlack: Bitboard | null;
}

/**
 * Applies a move to the bitboard map, returning info needed to undo it later.
 * @param bbs Bitboard map to modify
 * @param mv Move to apply
 * @returns Info needed to undo the move (original piece bitboard, captured piece info, etc.)
 */
function applyMove(bbs: BitboardMap, mv: PseudoMove): AfterMoveInfo {
  const pieceKey = mv.piece;
  const oldPieceBB = bbs.get(pieceKey) as Bitboard || 0n;
  const capturedKey = FindPieceAtIndex(bbs, mv.toIndex);
  const oldCapturedBB = capturedKey ? (bbs.get(capturedKey) as Bitboard) : null;

  const newPieceBB = (oldPieceBB & ~BIT(mv.fromIndex)) | BIT(mv.toIndex);
  bbs.set(pieceKey, newPieceBB as Bitboard);
  if (capturedKey) bbs.set(capturedKey!, (oldCapturedBB! & ~BIT(mv.toIndex)) as Bitboard);

  const oldWhite: Bitboard | null = bbs.get(BB_WHITE) ?? null;
  const oldBlack: Bitboard | null = bbs.get(BB_BLACK) ?? null;
  RecomputeOccupancies(bbs);
  // Insert here Fairy effects, promotions etc. as needed

  return {
    pieceKey,
    oldPieceBB,
    capture: capturedKey ? { pieceKey: capturedKey, oldPieceBB: oldCapturedBB } : null, 
    oldWhite,
    oldBlack,
  };
}

/**
 * Reverts a move applied to the bitboard map using the info returned by applyMove.
 * @param bbs Bitboard map to modify
 * @param mv Move to undo (used for metadata, but the actual move details are in info)
 * @param info Info returned by applyMove that contains the original piece bitboard, captured piece info, etc.
 */
function undoMove(bbs: BitboardMap, info: AfterMoveInfo) {
  bbs.set(info.pieceKey, info.oldPieceBB as Bitboard);
  if (info.capture) bbs.set(info.capture.pieceKey!, info.capture.oldPieceBB as Bitboard);
  if (info.oldWhite != null) bbs.set(BB_WHITE, info.oldWhite as Bitboard);
  if (info.oldBlack != null) bbs.set(BB_BLACK, info.oldBlack as Bitboard);
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
  const idxs = BitboardToIndexes(bb);
  return idxs.length ? idxs[0] : null;
}

/**
 * Generates legal moves for the given position and side to move. 
 * This function first generates pseudo-legal moves using GeneratePseudoMoves,
 * then filters out illegal moves by applying them to the position and checking for checks.
 * It returns an array of LegalMove objects that include metadata about checks and move types.
 * @param position BitboardMap representing the current position
 * @param side Color of the side to move ('w' for white, 'b' for black)
 * @returns An array of LegalMove objects representing all legal moves for the given position and side.
 */
function legalMoves(position: BitboardMap, side: 'w'|'b'): LegalMove[] {
  const pseudo = GeneratePseudoMoves(position, side);
  const legal: LegalMove[] = [];
  for (const mv of pseudo) {
    const info = applyMove(position, mv);
    const kingSq = findKingSquare(position, side);
    const inCheck = kingSq !== null ? isSquareAttacked(position, kingSq, side === 'w' ? 'b' : 'w') : false;
    undoMove(position, info);
    if (!inCheck) legal.push({
      type: info.capture ? "*" : "-",
      isCheck: inCheck,
      piece: mv.piece,
      from: mv.from,
      to: mv.to,
      fromIndex: mv.fromIndex,
      toIndex: mv.toIndex,
    });
  }
  return legal;
}


export async function search(bbs: BitboardMap, color: 'w'|'b', maxDepth: number, timeLimitMs: number) {
  let nodes = 0;
  const start = Date.now();
  let abort = false;

  function timeUp() { return Date.now() - start > timeLimitMs; }

  // heuristics
  const killerMoves: Map<number, string[]> = new Map(); // depth -> [killer1, killer2]
  const history: Map<string, number> = new Map();

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

    const moves = legalMoves(position, side);
    if (moves.length === 0) {
      const kingSq = findKingSquare(position, side);
      const inCheck = kingSq !== null ? isSquareAttacked(position, kingSq, side === 'w' ? 'b' : 'w') : false;
      if (inCheck) return -INF + (maxDepth - depth);
      return 0; // stalemate
    }

    let best = -INF;
    let bestMoveStr: string | undefined;
    for (const mv of moves) {
      const info = applyMove(position, mv);
      const val = -negamax(position, depth - 1, -beta, -alpha, side === 'w' ? 'b' : 'w');
      undoMove(position, info);
      if (abort) return 0;
      const mvStr = `${mv.piece}-${IndexToSquare(mv.fromIndex)}-${IndexToSquare(mv.toIndex)}`;
      if (val > best) { best = val; bestMoveStr = mvStr; }
      if (val > alpha) alpha = val;
      if (alpha >= beta) {
        // killer & history update for non-captures that cause cutoffs
        if (!FindPieceAtIndex(position, mv.toIndex)) {
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
    let localBestScore = -INF;
    let localBestMove: LegalMove | null = null;
    for (const mv of moves) {
      const info = applyMove(bbs, mv);
      const score = -negamax(bbs, depth - 1, -INF, INF, color === 'w' ? 'b' : 'w');
      undoMove(bbs, info);
      if (abort) break;
      if (score > localBestScore) { localBestScore = score; localBestMove = mv; }
    }
    if (abort) break;
    if (localBestMove) {
      bestLine = [`${localBestMove.piece}${IndexToSquare(localBestMove.fromIndex)}${localBestMove.type}${IndexToSquare(localBestMove.toIndex)}`];
      bestScore = localBestScore;
    }
    if (Math.abs(localBestScore) > INF/2) break; // found mate
  }

  const timeMs = Date.now() - start;
  return { bestLine, nodes, timeMs, score: bestScore, mateIn: Math.abs(bestScore) > INF/2 ? Math.round((INF - Math.abs(bestScore))/2) : null, aborted: abort };
}

// No default export — use named `search` export
