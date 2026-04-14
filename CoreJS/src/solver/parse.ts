import { GetBitboardMapFromPieces } from "../bitboards/bitboard.helpers";
import { BB_BLACK, BB_WHITE, BitboardMap } from "../board/board.types";
import { Piece } from "../pieces/piece.types";
import { ProblemInput } from "./types";

type ParseResult = {
  bitboards: BitboardMap;
  sideToMove: "w" | "b";
  enPassant?: string | null;
  castling?: string | null;
};

/**
 * Parse a FEN string into a BitboardMap and metadata.
 * This parser is intentionally minimal: it supports standard FEN fields
 * and produces a bitboard map compatible with the existing move generators.
 */
export function parseFEN(fen: string | ProblemInput): ParseResult {
  const fenStr = typeof fen === "string" ? fen : (fen.fen || "");
  const parts = fenStr.trim().split(/\s+/);
  if (parts.length < 1) throw new Error("Invalid FEN: empty");

  const placement = parts[0];
  const sideToMove = (parts[1] || "w") as "w" | "b";
  const castling = parts[2] || "-";
  const enPassant = parts[3] || "-";

  const ranks = placement.split("/");
  if (ranks.length !== 8) throw new Error("Invalid FEN: expected 8 ranks");

  const pieces: Piece[] = [];
  for (let r = 0; r < 8; r++) {
    const rankStr = ranks[r];
    const rankNo = 8 - r; // FEN starts at rank 8
    let file = 0; // 0..7 corresponds to a..h
    for (const ch of rankStr) {
      if (/[1-8]/.test(ch)) {
        file += Number(ch);
        continue;
      }
      if (file > 7) throw new Error("Invalid FEN: file out of range");
      const fileChar = String.fromCharCode(97 + file); // 'a' + file
      const pos = `${fileChar}${rankNo}` as unknown as string;
      pieces.push({ notation: ch, position: pos } as Piece);
      file += 1;
    }
    if (file !== 8) throw new Error("Invalid FEN: rank length != 8");
  }

  const bbs = GetBitboardMapFromPieces(pieces);

  // compute aggregated occupancy for white and black
  let whiteOcc = 0n;
  let blackOcc = 0n;
  for (const [k, v] of bbs) {
    if (!k || v === undefined) continue;
    if (/^[A-Z]$/.test(k) || /^[A-Z]$/.test(k[0])) {
      // piece notation uppercase -> white
      whiteOcc |= v;
    }
    else {
      // lowercase -> black
      blackOcc |= v;
    }
  }

  bbs.set(BB_WHITE, whiteOcc as unknown as bigint);
  bbs.set(BB_BLACK, blackOcc as unknown as bigint);

  return {
    bitboards: bbs,
    sideToMove,
    enPassant: enPassant === "-" ? null : enPassant,
    castling: castling === "-" ? null : castling,
  };
}

// No default export — `parseFEN` is a named export
