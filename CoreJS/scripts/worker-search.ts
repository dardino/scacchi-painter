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

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    process.stdin.on('data', c => chunks.push(Buffer.from(c)));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const raw = await readStdin();
  if (!raw) { console.error('no input'); process.exit(2); }
  const inp = JSON.parse(raw);
  const { bbs: bbsObj, move, color, maxDepth, timeLimitMs } = inp as { bbs: Record<string,string>, move: Move, color: 'w'|'b', maxDepth: number, timeLimitMs: number };

  const bbs = new Map<string, bigint>();
  for (const k of Object.keys(bbsObj)) bbs.set(k, BigInt(bbsObj[k]));

  // apply the root move
  applyMoveToMap(bbs, move);

  const nextSide = color === 'w' ? 'b' : 'w';
  const childDepth = Math.max(0, (maxDepth || 0) - 1);

  const res = await search(bbs, nextSide, childDepth, timeLimitMs || 30000);

  const moveStr = `${move.pieceKey}-${String.fromCharCode(97 + (move.from % 8))}-${Math.floor(move.from / 8) + 1}-${move.to}`;
  // Output result as JSON to stdout
  const out = { move, result: res };
  console.log(JSON.stringify(out));
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });
