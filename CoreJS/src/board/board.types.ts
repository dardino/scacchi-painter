export const Files = [
  "ColA",
  "ColB",
  "ColC",
  "ColD",
  "ColE",
  "ColF",
  "ColG",
  "ColH",
] as const satisfies `Col${"A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"}`[];
export type Files = typeof Files[number];

export const Ranks = [
  "Row1",
  "Row2",
  "Row3",
  "Row4",
  "Row5",
  "Row6",
  "Row7",
  "Row8",
] as const satisfies `Row${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`[];
export type Ranks = typeof Ranks[number];

// the bitboard is a 64-bit number where each bit represents a square on the chessboard
export type Bitboard = bigint;
export type BitboardArray = Bitboard[];

export const BB_WHITE = "#white#";
export const BB_BLACK = "#black#";
export const BB_NEUTRAL = "#neutral#";

export type BitboardMap = Map<string, Bitboard>;
