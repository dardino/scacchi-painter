import { Bitboard } from "../board/board.types";

// Files
export const FILE_A: Bitboard = 0x0101010101010101n;
export const FILE_B: Bitboard = 0x0202020202020202n;
export const FILE_C: Bitboard = 0x0404040404040404n;
export const FILE_D: Bitboard = 0x0808080808080808n;
export const FILE_E: Bitboard = 0x1010101010101010n;
export const FILE_F: Bitboard = 0x2020202020202020n;
export const FILE_G: Bitboard = 0x4040404040404040n;
export const FILE_H: Bitboard = 0x8080808080808080n;

// General mask for 64-bit boards
export const BOARD_MASK: Bitboard = 0xFFFFFFFFFFFFFFFFn;

// Starting pawn bitboards
export const StartingWhitePawnBitboard: Bitboard = 0x000000000000FF00n; // White pawns on the second rank
export const StartingBlackPawnBitboard: Bitboard = 0x00FF000000000000n; // Black pawns on the seventh rank
export const AllPawnBitboard: Bitboard = StartingWhitePawnBitboard | StartingBlackPawnBitboard;
