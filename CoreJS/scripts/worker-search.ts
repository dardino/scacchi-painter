#!/usr/bin/env -S tsx
import { Bitboard } from '../src/board/board.types';
import { search } from '../src/solver/search';

type Move = { pieceKey: string; from: number; to: number };

function BIT(i: number) { return 1n << BigInt(i); }

function bitboardToIndexes(bb: Bitboard): number[] {
  const out: number[] = [];
  for (let i = 0; i < 64; i++) if (((bb >> BigInt(i)) & 1n) === 1n) out.push(i);
  return out;
}

function findPieceAt(obj: Map<string, bigint>, sqIdx: number): string | null {
  for (const [k, v] of obj.entries()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    if ((v & BIT(sqIdx)) !== 0n) return k;
  }
  return null;
}

function recomputeOccupancies(bbs: Map<string, bigint>) {
  let whiteOcc = 0n;
  let blackOcc = 0n;
  for (const [k, v] of bbs.entries()) {
    if (!k) continue;
    if (!/^[A-Za-z]$/.test(k)) continue;
    if (k === k.toUpperCase()) whiteOcc |= v as bigint;
    else blackOcc |= v as bigint;
  }
  bbs.set('#white#', whiteOcc as unknown as bigint);
  bbs.set('#black#', blackOcc as unknown as bigint);
}

function applyMoveToMap(bbs: Map<string, bigint>, mv: Move) {
  const pieceKey = mv.pieceKey;
  const oldPieceBB = bbs.get(pieceKey) as bigint || 0n;
  const oldCapturedKey = findPieceAt(bbs, mv.to);
  const oldCapturedBB = oldCapturedKey ? (bbs.get(oldCapturedKey) as bigint) : undefined;

  const newPieceBB = (oldPieceBB & ~BIT(mv.from)) | BIT(mv.to);
  bbs.set(pieceKey, newPieceBB as bigint);
  if (oldCapturedKey) bbs.set(oldCapturedKey!, (oldCapturedBB! & ~BIT(mv.to)) as bigint);
  recomputeOccupancies(bbs);
  return { pieceKey, oldPieceBB, capturedKey: oldCapturedKey, oldCapturedBB };
}

import readline from 'readline';

// Persistent worker: read newline-delimited JSON requests from stdin and
// respond with newline-delimited JSON responses. Each request must include
// an `id` field so responses can be correlated.

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', async (line) => {
  if (!line || !line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req && req.cmd === 'exit') {
      process.exit(0);
      return;
    }
    const { id, bbs: bbsObj, move, color, maxDepth, timeLimitMs } = req as any;
    const bbs = new Map<string, bigint>();
    for (const k of Object.keys(bbsObj || {})) bbs.set(k, BigInt(bbsObj[k]));

    // apply the root move
    applyMoveToMap(bbs, move as Move);

    const nextSide = color === 'w' ? 'b' : 'w';
    const childDepth = Math.max(0, (maxDepth || 0) - 1);

    const res = await search(bbs, nextSide, childDepth, timeLimitMs || 30000);

    const out = { id, result: res };
    process.stdout.write(JSON.stringify(out) + '\n');
  } catch (e: any) {
    // emit error line; parent should handle parse/processing errors
    try { process.stderr.write(String(e?.message || e) + '\n'); } catch {}
  }
});

process.stdin.on('end', () => process.exit(0));
