#!/usr/bin/env -S tsx
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_COUNT = 20;
const URL_BASE = 'https://www.yacpdb.org/json.php?search&query=OFwvOFwvOFwvOFwvOFwvOFwvOFwvOC8vLy8vLy8vIzIvLy8vLy8xLzEvMS8w&page=';

function usageAndExit() {
  console.log('Usage: tsx fetch_yacpdb_sample.ts [--count=20] [--out=path]');
  process.exit(1);
}

const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  if (!a.startsWith('--')) return [a, true];
  const [k,v] = a.slice(2).split('=');
  return [k, v ?? true];
}));

const count = parseInt((argv.count as string) || String(DEFAULT_COUNT), 10) || DEFAULT_COUNT;
const outPath = (argv.out as string) || '../test/fixtures/yacpdb-sample.json';

function pieceLetterToFen(letter: string | undefined, isWhite: boolean) {
  if (!letter) return isWhite ? 'P' : 'p';
  const map: Record<string,string> = {
    'K': 'K',
    'Q': 'Q',
    'R': 'R',
    'B': 'B',
    'S': 'N',
    'N': 'N',
    'P': 'P'
  };
  const u = letter.toUpperCase();
  const fen = map[u] ?? u;
  return isWhite ? fen : fen.toLowerCase();
}

function squareToCoords(square: string) {
  if (!/^[a-h][1-8]$/.test(square)) return null;
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square[1], 10);
  return { file, rank };
}

function buildFenFromAlgebraic(algebraic: any) {
  const board: (string|null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  function place(list: any, isWhite: boolean) {
    if (!Array.isArray(list)) return;
    for (const token of list) {
      if (typeof token !== 'string') continue;
      const clean = token.replace(/[^A-Za-z0-9]/g, '');
      const m = clean.match(/^([A-Za-z]?)([a-h][1-8])$/);
      if (!m) {
        const m2 = clean.match(/^([a-h][1-8])$/);
        if (m2) {
          const sq = m2[1];
          const coords = squareToCoords(sq);
          if (!coords) continue;
          board[coords.rank][coords.file] = isWhite ? 'P' : 'p';
        }
        continue;
      }

      let [, letter, square] = m;
      if (!letter) letter = 'P';
      const coords = squareToCoords(square);
      if (!coords) continue;
      const fenPiece = pieceLetterToFen(letter, isWhite);
      board[coords.rank][coords.file] = fenPiece;
    }
  }

  place(algebraic?.white, true);
  place(algebraic?.black, false);

  const ranks = board.map(row => {
    let acc = '';
    let empty = 0;
    for (const sq of row) {
      if (!sq) {
        empty++;
      } else {
        if (empty > 0) { acc += String(empty); empty = 0; }
        acc += sq;
      }
    }
    if (empty > 0) acc += String(empty);
    return acc;
  });

  return ranks.join('/');
}

async function fetchPage(page: number) {
  const url = URL_BASE + page;
  const res = await fetch(url, { headers: { 'User-Agent': 'scacchi-painter/1.0 (+https://github.com/dardino/scacchi-painter)' } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) throw err;
    const jsonText = text.slice(firstBrace);
    return JSON.parse(jsonText);
  }
}

(async () => {
  const collected: any[] = [];
  let page = 1;
  const maxPages = 50;

  while (collected.length < count && page <= maxPages) {
    console.log(`fetching page ${page}...`);
    try {
      const data = await fetchPage(page);
      const entries = data.entries || data;
      if (!Array.isArray(entries) || entries.length === 0) break;

      for (const entry of entries) {
        try {
          if (collected.length >= count) break;
          const id = entry.id || entry.ID || null;
          const stip = entry.stipulation || entry.stip || entry['stipulation'] || entry['stip'] || entry['stipulation'];
          const algebraic = entry.algebraic || null;
          const solutionText = entry.solution || entry.Solution || entry['solution'] || entry['display_solution'] || entry['display-solution'] || null;
          if (!algebraic || (!Array.isArray(algebraic.white) && !Array.isArray(algebraic.black))) continue;

          const placement = buildFenFromAlgebraic(algebraic);
          if (!placement || placement.split('/').length !== 8) continue;

          const fen = `${placement} w - - 0 1`;
          const popeye = `Stipulation: ${stip ?? '#2'}\nFEN: ${fen}\n`;

          collected.push({
            id,
            stipulation: stip ?? '#2',
            fen,
            popeye,
            title: entry.title || entry.authors || entry.source?.name || null,
            yacpdb_solution: solutionText,
          });
        } catch (err) {
          console.warn('skip entry', (err as any)?.message);
        }
      }

      page++;
    } catch (err) {
      console.error('fetch error', err);
      break;
    }
  }

  const outFull = path.resolve(process.cwd(), outPath);
  await fs.mkdir(path.dirname(outFull), { recursive: true });
  await fs.writeFile(outFull, JSON.stringify({ count: collected.length, problems: collected }, null, 2), 'utf8');
  console.log(`wrote ${collected.length} problems to ${outFull}`);
})();
