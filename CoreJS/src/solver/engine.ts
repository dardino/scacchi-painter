import { spawn } from 'child_process';
import path from 'path';
import { Bitboard } from "../board/board.types";
import { MoveGeneratorMap } from '../pieces/piece.helpers';
import { parseFEN } from "./parse";
import { parsePopeye } from "./popeye";
import { search } from "./search";
import { DEFAULT_SOLVER_OPTIONS, ProblemInput, SolverOptions, SolverResult, stipulationToMaxDepth } from "./types";

function indexToSquare(idx: number): string {
  const file = String.fromCharCode(97 + (idx % 8));
  const rank = Math.floor(idx / 8) + 1;
  return `${file}${rank}`;
}

function bitboardToIndexes(bb: Bitboard): number[] {
  const out: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (((bb >> BigInt(i)) & 1n) === 1n) out.push(i);
  }
  return out;
}

/**
 * Very small reference solver engine: builds pseudo-legal moves for the side to move
 * and returns the first found move as the "best line". This is intentionally
 * minimal and will be expanded with full search and legality checks later.
 */
export async function solve(problem: ProblemInput, opts?: SolverOptions): Promise<SolverResult> {
  const start = Date.now();
  const mergedOpts = { ...DEFAULT_SOLVER_OPTIONS, ...(opts || {}) };

  try {
    // If a Popeye snippet is provided, prefer its FEN/stipulation when missing
    const popeyeInfo = problem.popeye ? parsePopeye(problem) : {};
    const mergedProblem: ProblemInput = { ...problem };
    if (popeyeInfo.fen && !mergedProblem.fen) mergedProblem.fen = popeyeInfo.fen as string;
    if (popeyeInfo.stipulation && !mergedProblem.stipulation) mergedProblem.stipulation = popeyeInfo.stipulation as string;

    const parsed = parseFEN(mergedProblem);
    const bbs = parsed.bitboards;
    const color = parsed.sideToMove;

    const maxDepthUsed = mergedOpts.maxDepth ?? stipulationToMaxDepth(mergedProblem.stipulation);

    // If threads > 1, perform root-splitting by dispatching per-root-move worker tasks.
    const threads = mergedOpts.threads || 1;
    if (threads > 1) {
      // local helpers (small copies to avoid heavy refactor)
      function BIT(i: number) { return 1n << BigInt(i); }
      function bitboardToIndexes(bb: Bitboard): number[] {
        const out: number[] = [];
        for (let i = 0; i < 64; i++) if (((bb >> BigInt(i)) & 1n) === 1n) out.push(i);
        return out;
      }

      function findPieceAtLocal(bbsMap: Map<string, bigint>, sqIdx: number): string | null {
        for (const [k, v] of bbsMap.entries()) {
          if (!k) continue;
          if (!/^[A-Za-z]$/.test(k)) continue;
          if ((v & BIT(sqIdx)) !== 0n) return k;
        }
        return null;
      }

      function recomputeOccupanciesLocal(bbsMap: Map<string, bigint>) {
        let whiteOcc = 0n;
        let blackOcc = 0n;
        for (const [k, v] of bbsMap.entries()) {
          if (!k) continue;
          if (!/^[A-Za-z]$/.test(k)) continue;
          if (k === k.toUpperCase()) whiteOcc |= v as bigint;
          else blackOcc |= v as bigint;
        }
        bbsMap.set('#white#', whiteOcc as unknown as bigint);
        bbsMap.set('#black#', blackOcc as unknown as bigint);
      }

      function applyMoveLocal(bbsMap: Map<string, bigint>, mv: { pieceKey: string; from: number; to: number }) {
        const pieceKey = mv.pieceKey;
        const oldPieceBB = bbsMap.get(pieceKey) as bigint || 0n;
        const oldCapturedKey = findPieceAtLocal(bbsMap, mv.to);
        const oldCapturedBB = oldCapturedKey ? (bbsMap.get(oldCapturedKey) as bigint) : undefined;

        const newPieceBB = (oldPieceBB & ~BIT(mv.from)) | BIT(mv.to);
        bbsMap.set(pieceKey, newPieceBB as bigint);
        if (oldCapturedKey) bbsMap.set(oldCapturedKey!, (oldCapturedBB! & ~BIT(mv.to)) as bigint);
        recomputeOccupanciesLocal(bbsMap);
        return { pieceKey, oldPieceBB, capturedKey: oldCapturedKey, oldCapturedBB };
      }

      function generateLegalMovesLocal(bbsMap: Map<string, bigint>, side: 'w'|'b') {
        const moves: Array<{ pieceKey: string; from: number; to: number }> = [];
        for (const k of bbsMap.keys()) {
          if (!k) continue;
          if (!/^[A-Za-z]$/.test(k)) continue;
          if (side === 'w' && k !== k.toUpperCase()) continue;
          if (side === 'b' && k !== k.toLowerCase()) continue;
          const pieceBB = bbsMap.get(k) as bigint || 0n;
          const srcIdxs = bitboardToIndexes(pieceBB as Bitboard);
          const generator = MoveGeneratorMap.get(k.toLowerCase());
          if (!generator) continue;
          for (const src of srcIdxs) {
            const temp = new Map(bbsMap);
            temp.set(k, 1n << BigInt(src));
            const destBB = generator(temp as any, side as 'w'|'b');
            const destIdxs = bitboardToIndexes(destBB as Bitboard);
            for (const d of destIdxs) moves.push({ pieceKey: k, from: src, to: d });
          }
        }
        // filter legal by making moves and testing king-in-check
        const legal: Array<{ pieceKey: string; from: number; to: number }> = [];
        for (const mv of moves) {
          const info = applyMoveLocal(bbsMap, mv);
          // find king square for side
          const kingKey = side === 'w' ? 'K' : 'k';
          const kingBB = bbsMap.get(kingKey) as bigint || 0n;
          const ks = bitboardToIndexes(kingBB as Bitboard);
          const kingSq = ks.length ? ks[0] : null;
          const inCheck = kingSq !== null ? (() => {
            // isSquareAttacked
            for (const gen of MoveGeneratorMap.values()) {
              const attacks = gen(bbsMap as any, side === 'w' ? 'b' : 'w');
              if ((attacks & (1n << BigInt(kingSq as number))) !== 0n) return true;
            }
            return false;
          })() : false;
          // undo
          if (info.capturedKey) bbsMap.set(info.capturedKey, info.oldCapturedBB as bigint);
          bbsMap.set(info.pieceKey, info.oldPieceBB as bigint);
          recomputeOccupanciesLocal(bbsMap);
          if (!inCheck) legal.push(mv);
        }
        return legal;
      }

      const rootMoves = generateLegalMovesLocal(bbs as any, color as 'w'|'b');
      if (rootMoves.length === 0) {
        // nothing to do — fallback to single-threaded search
        const s = await search(bbs, color as 'w'|'b', maxDepthUsed, mergedOpts.timeLimitMs ?? 30_000);
        const res: SolverResult = {
          id: problem.id,
          solved: !!s.bestLine && s.bestLine.length > 0,
          depthSearched: maxDepthUsed,
          timeMs: s.timeMs,
          nodes: s.nodes,
          bestLine: s.bestLine,
          score: s.score,
          mateIn: s.mateIn,
          raw: { ...s }
        };
        return res;
      }

      // concurrency pool using external worker CLI (scripts/worker-search.ts)
      const queue = rootMoves.slice();
      const results: Array<any> = [];
      const workers = Math.min(threads, queue.length);

      async function runWorkerTask(mv: { pieceKey: string; from: number; to: number }) {
        return new Promise<any>((resolve, reject) => {
          const workerPath = path.resolve(process.cwd(), 'scripts', 'worker-search.ts');
          const cp = spawn('pnpm', ['tsx', workerPath], { stdio: ['pipe', 'pipe', 'inherit'] });
          let out = '';
          cp.stdout.setEncoding('utf8');
          cp.stdout.on('data', c => out += c);
          cp.on('close', code => {
            if (code !== 0) { reject(new Error('worker exited ' + code)); return; }
            try { const parsed = JSON.parse(out); resolve(parsed); } catch (e) { reject(e); }
          });
          // serialize bitboards to strings
          const ser: Record<string,string> = {};
          for (const [k, v] of (bbs as Map<string, bigint>).entries()) ser[k] = (v as bigint).toString();
          const payload = { bbs: ser, move: mv, color, maxDepth: maxDepthUsed, timeLimitMs: mergedOpts.timeLimitMs };
          cp.stdin.write(JSON.stringify(payload));
          cp.stdin.end();
        });
      }

      const workerLoops = new Array(workers).fill(0).map(async () => {
        while (queue.length) {
          const mv = queue.shift()!;
          try {
            const r = await runWorkerTask(mv);
            results.push({ mv, r });
          } catch (err) {
            results.push({ mv, error: (err as any)?.message || String(err) });
          }
        }
      });

      await Promise.all(workerLoops);

      // choose best move from results
      let bestScore = -Infinity;
      let bestEntry: any = undefined;
      let totalNodes = 0;
      for (const e of results) {
        if (e.error) continue;
        const child = e.r.result;
        totalNodes += child.nodes || 0;
        const score = - (child.score || 0);
        if (score > bestScore) { bestScore = score; bestEntry = { mv: e.mv, child }; }
      }

      const timeMs = Date.now() - start;
      const bestLine = bestEntry ? [ `${bestEntry.mv.pieceKey}-${String.fromCharCode(97 + (bestEntry.mv.from % 8))}${Math.floor(bestEntry.mv.from/8)+1}-${indexToSquare(bestEntry.mv.to)}` , ...(bestEntry.child.bestLine || []) ] : [];
      const outRes: SolverResult = {
        id: problem.id,
        solved: !!bestLine && bestLine.length > 0,
        depthSearched: maxDepthUsed,
        timeMs,
        nodes: totalNodes,
        bestLine,
        score: Number.isFinite(bestScore) ? bestScore : undefined,
        mateIn: null,
        raw: { parallelResults: results }
      };
      return outRes;
    }

    // delegate to search implementation (iterative deepening + negamax) when threads <= 1
    const s = await search(bbs, color as 'w'|'b', maxDepthUsed, mergedOpts.timeLimitMs ?? 30_000);
    const res: SolverResult = {
      id: problem.id,
      solved: !!s.bestLine && s.bestLine.length > 0,
      depthSearched: maxDepthUsed,
      timeMs: s.timeMs,
      nodes: s.nodes,
      bestLine: s.bestLine,
      score: s.score,
      mateIn: s.mateIn,
      raw: { ...s }
    };

    return res;
  }
  catch (err: any) {
    return {
      id: problem.id,
      solved: false,
      depthSearched: 0,
      timeMs: Date.now() - start,
      nodes: 0,
      error: err?.message || String(err),
    } as SolverResult;
  }
}

export default { solve };
