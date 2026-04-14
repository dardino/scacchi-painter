/// <reference types="node" />
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Bitboard } from "./board/board.types";
import { MoveGeneratorMap } from './pieces/piece.helpers';
import { parseFEN } from "./solver/parse";
import { parsePopeye } from "./solver/popeye";
import { search } from "./solver/search";
import { DEFAULT_SOLVER_OPTIONS, ProblemInput, SolverOptions, SolverResult, stipulationToMaxDepth } from "./solver/types";

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

export async function solve(problem: ProblemInput, opts?: SolverOptions): Promise<SolverResult> {
  const start = Date.now();
  const mergedOpts = { ...DEFAULT_SOLVER_OPTIONS, ...(opts || {}) };

  try {
    const popeyeInfo = problem.popeye ? parsePopeye(problem) : {};
    const mergedProblem: ProblemInput = { ...problem };
    if (popeyeInfo.fen && !mergedProblem.fen) mergedProblem.fen = popeyeInfo.fen as string;
    if (popeyeInfo.stipulation && !mergedProblem.stipulation) mergedProblem.stipulation = popeyeInfo.stipulation as string;

    const parsed = parseFEN(mergedProblem);
    const bbs = parsed.bitboards;
    const color = parsed.sideToMove;

    const maxDepthUsed = mergedOpts.maxDepth ?? stipulationToMaxDepth(mergedProblem.stipulation);

    const cpuCount = Math.max(1, os.cpus()?.length || 1);
    const requestedThreads = mergedOpts.threads ?? 1;
    const threads = Math.max(1, Math.min(requestedThreads, cpuCount));
    if (threads > 1) {
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
          if (k === k.toUpperCase()) whiteOcc |= v as unknown as bigint;
          else blackOcc |= v as unknown as bigint;
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
        const legal: Array<{ pieceKey: string; from: number; to: number }> = [];
        for (const mv of moves) {
          const info = applyMoveLocal(bbsMap, mv);
          const kingKey = side === 'w' ? 'K' : 'k';
          const kingBB = bbsMap.get(kingKey) as bigint || 0n;
          const ks = bitboardToIndexes(kingBB as Bitboard);
          const kingSq = ks.length ? ks[0] : null;
          const inCheck = kingSq !== null ? (() => {
            for (const gen of MoveGeneratorMap.values()) {
              const attacks = gen(bbsMap as any, side === 'w' ? 'b' : 'w');
              if ((attacks & (1n << BigInt(kingSq as number))) !== 0n) return true;
            }
            return false;
          })() : false;
          if (info.capturedKey) bbsMap.set(info.capturedKey, info.oldCapturedBB as bigint);
          bbsMap.set(info.pieceKey, info.oldPieceBB as bigint);
          recomputeOccupanciesLocal(bbsMap);
          if (!inCheck) legal.push(mv);
        }
        return legal;
      }

      const rootMoves = generateLegalMovesLocal(bbs as any, color as 'w'|'b');
      if (rootMoves.length === 0) {
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

      const queue = rootMoves.slice();
      const results: Array<any> = [];
      const workers = Math.min(threads, queue.length);

      const workerPath = path.resolve(process.cwd(), 'scripts', 'worker-search.ts');

      const ser: Record<string,string> = {};
      for (const [k, v] of (bbs as Map<string, bigint>).entries()) ser[k] = (v as bigint).toString();

      const cpList: any[] = [];
      type PendingEntry = { resolve: (v:any)=>void; start: number };
      const pending: Map<string, PendingEntry> = new Map();
      let nextReqId = 1;
      const workerStartupTimes: number[] = new Array(workers).fill(0);
      const requestTimes: number[] = [];

      const useCompiled = Boolean(mergedOpts.useCompiledWorkers);
      const compiledPath = path.resolve(process.cwd(), 'dist', 'scripts', 'worker-search.js');
      const canUseCompiled = useCompiled && fs.existsSync(compiledPath);

      for (let i = 0; i < workers; i++) {
        const spawnStart = Date.now();
        const cp = canUseCompiled ? spawn('node', [compiledPath], { stdio: ['pipe', 'pipe', 'inherit'] }) : spawn('pnpm', ['tsx', workerPath], { stdio: ['pipe', 'pipe', 'inherit'] });
        cp.on('spawn', () => { workerStartupTimes[i] = Date.now() - spawnStart; });
        cp.stdout.setEncoding('utf8');
        let buf = '';
        cp.stdout.on('data', (chunk: string) => {
          buf += chunk;
          let idx: number;
          while ((idx = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, idx);
            buf = buf.slice(idx + 1);
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              const entry = pending.get(String(parsed.id));
              if (entry) {
                pending.delete(String(parsed.id));
                const dur = Date.now() - entry.start;
                requestTimes.push(dur);
                entry.resolve(parsed);
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        });
        cpList.push(cp);
      }

      const workerLoops = cpList.map((cp) => (async () => {
        while (queue.length) {
          const mv = queue.shift();
          if (!mv) break;
          const reqId = String(nextReqId++);
          const payload = { id: reqId, bbs: ser, move: mv, color, maxDepth: maxDepthUsed, timeLimitMs: mergedOpts.timeLimitMs };
          const p: Promise<any> = new Promise((resolve) => { pending.set(reqId, { resolve, start: Date.now() }); });
          try {
            cp.stdin.write(JSON.stringify(payload) + '\n');
            const parsed = await p;
            results.push({ mv, r: parsed });
          } catch (err) {
            results.push({ mv, error: (err as any)?.message || String(err) });
          }
        }
        try { cp.stdin.write(JSON.stringify({ cmd: 'exit' }) + '\n'); cp.stdin.end(); } catch (e) {}
      })());

      await Promise.all(workerLoops);

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
      const instrumentation = {
        workerStartupMs: workerStartupTimes,
        requestMs: requestTimes,
        avgRequestMs: requestTimes.length ? Math.round(requestTimes.reduce((a,b)=>a+b,0)/requestTimes.length) : 0,
        usedCompiledWorkers: canUseCompiled,
      };

      const outRes: SolverResult = {
        id: problem.id,
        solved: !!bestLine && bestLine.length > 0,
        depthSearched: maxDepthUsed,
        timeMs,
        nodes: totalNodes,
        bestLine,
        score: Number.isFinite(bestScore) ? bestScore : undefined,
        mateIn: null,
        raw: { parallelResults: results, instrumentation }
      };
      return outRes;
    }

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

// No default export — use named exports only
