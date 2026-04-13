#!/usr/bin/env node
// Fetch yacpdb JSON pages and create a fixture file with N problems
// Usage: node fetch_yacpdb_sample.mjs [--count=20] [--out=../test/fixtures/yacpdb-sample.json]

import fs from 'fs/promises';
import path from 'path';

const DEFAULT_COUNT = 20;
const URL_BASE = 'https://www.yacpdb.org/json.php?search&query=OFwvOFwvOFwvOFwvOFwvOFwvOFwvOC8vLy8vLy8vIzIvLy8vLy8xLzEvMS8w&page=';

function usageAndExit() {
  console.log('Usage: node fetch_yacpdb_sample.mjs [--count=20] [--out=path]');
  process.exit(1);
}

const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  if (!a.startsWith('--')) return [a, true];
  const [k,v] = a.slice(2).split('=');
  return [k, v ?? true];
}));

const count = parseInt(argv.count || DEFAULT_COUNT, 10) || DEFAULT_COUNT;
const outPath = argv.out || '../test/fixtures/yacpdb-sample.json';

function pieceLetterToFen(letter, isWhite) {
  if (!letter) return isWhite ? 'P' : 'p';
  const map = {
    'K': 'K',
    'Q': 'Q',
    'R': 'R',
    'B': 'B',
    // YACPDB uses 'S' for Knight in many entries
    'S': 'N',
    'N': 'N',
    'P': 'P'
  };
  const u = letter.toUpperCase();
  const fen = map[u] ?? u;
  return isWhite ? fen : fen.toLowerCase();
}

function squareToCoords(square) {
  // square like 'd7'
  if (!/^[a-h][1-8]$/.test(square)) return null;
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square[1], 10);
  return { file, rank };
}

function buildFenFromAlgebraic(algebraic) {
  // algebraic: { white: ['Kd7', 'Rg4', ...], black: [...] }
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));

  function place(list, isWhite) {
    if (!Array.isArray(list)) return;
    for (const token of list) {
      if (typeof token !== 'string') continue;
      // remove annotations like '*' or similar
      const clean = token.replace(/[^A-Za-z0-9]/g, '');
      // try piece + square
      // match letter(s) then square
      const m = clean.match(/^([A-Za-z]?)([a-h][1-8])$/);
      if (!m) {
        // try to recover: sometimes pawns may be given as just square
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

  place(algebraic.white, true);
  place(algebraic.black, false);

  // build fen
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

async function fetchPage(page) {
  const url = URL_BASE + page;
  const res = await fetch(url, { headers: { 'User-Agent': 'scacchi-painter/1.0 (+https://github.com/dardino/scacchi-painter)' } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  // API sometimes returns JSON with extra junk; try to parse JSON blob
  try {
    return JSON.parse(text);
  } catch (err) {
    // try to extract first JSON object in text
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) throw err;
    const jsonText = text.slice(firstBrace);
    return JSON.parse(jsonText);
  }
}

(async () => {
  const collected = [];
  let page = 1;
  const maxPages = 50;

  while (collected.length < count && page <= maxPages) {
    console.log(`fetching page ${page}...`);
    try {
      const data = await fetchPage(page);
      const entries = data.entries || data; // defensive
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

          // default to white to move
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
          // ignore entry
          console.warn('skip entry', err && err.message);
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
