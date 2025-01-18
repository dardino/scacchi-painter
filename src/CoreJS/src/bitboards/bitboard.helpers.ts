import { Columns, Traverse } from "../board/board.types";

export function countBits(num: bigint): number {
  let count = 0;
  while (num) {
    count += Number(num & BigInt(1));
    num = num >> BigInt(1);
  }
  return count;
}

export const GetLocationFromIndex = (index: number): { column: Columns, traverse: Traverse } => ({
  column: Columns[index % 8],
  traverse: Traverse[Math.floor(index / 8)],
});

// export function getPieceBitboards(position: Problem): bigint[] {
//   const pieceBitboards: bigint[] = [];

//   // Iterate over each piece type
//   for (const pieceType of position.pieceTypes) {
//     let pieceBitboard: bigint = BigInt(0);

//     // Iterate over each square
//     for (let square = 0; square < 64; square++) {
//       const loc = GetLocationFromIndex(square);
//       // Check if the square contains the current piece type
//       if (position.GetPieceAt(loc.column, loc.traverse)?.ToFairyNotation() === pieceType) {
//         // Set the corresponding bit in the piece bitboard
//         pieceBitboard |= BigInt(1) << BigInt(square);
//       }
//     }

//     // Add the piece bitboard to the array
//     pieceBitboards.push(pieceBitboard);
//   }

//   return pieceBitboards;
// }

// export function getAllPiecesBitboard(position: Problem): bigint {
//   let allPiecesBitboards: bigint = BigInt(0);
//   // Iterate over each square
//   for (let square = 0; square < 64; square++) {
//     const loc = GetLocationFromIndex(square);
//     // Check if the square contains the current piece type
//     if (position.GetPieceAt(loc.column, loc.traverse)) {
//       // Set the corresponding bit in the piece bitboard
//       allPiecesBitboards |= BigInt(1) << BigInt(square);
//     }
//   }
//   return allPiecesBitboards;
// }

// /**
//  * Calculates the distance between two positions.
//  *
//  * @param pos1 The first position.
//  * @param pos2 The second position.
//  * @returns The number of common bits between the two positions.
//  */
// export function distanceBetweenPositions(pos1: Problem, pos2: Problem): number {
//   const bb1 = getAllPiecesBitboard(pos1);
//   const bb2 = getAllPiecesBitboard(pos2);
//   const commonBits = countBits(bb1 & bb2);
//   return commonBits;
// }

// export function distanceBetweenBitBoard() {

// }
