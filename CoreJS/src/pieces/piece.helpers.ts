import { BishopMoveGenerator } from "./bishop/bishop";
import { KingMoveGenerator } from "./king/king";
import { KnightMoveGenerator } from "./knight/knight";
import { PawnMoveGenerator } from "./pawn/pawn";
import { PieceMoveGenerator, PieceMoveGeneratorMap } from "./piece.types";
import { QueenMoveGenerator } from "./queen/queen";
import { RookMoveGenerator } from "./rook/rook";

const PieceKeys = [
  BishopMoveGenerator.pieceW,
  KingMoveGenerator.pieceW,
  KnightMoveGenerator.pieceW,
  PawnMoveGenerator.pieceW,
  QueenMoveGenerator.pieceW,
  RookMoveGenerator.pieceW,
];

export type PieceKeys = typeof PieceKeys[number];
export const MoveGeneratorMap: PieceMoveGeneratorMap = new Map<PieceKeys, PieceMoveGenerator<Uppercase<string>>>();

MoveGeneratorMap.set(PawnMoveGenerator.pieceW, PawnMoveGenerator);
MoveGeneratorMap.set(KingMoveGenerator.pieceW, KingMoveGenerator);
MoveGeneratorMap.set(KnightMoveGenerator.pieceW, KnightMoveGenerator);
MoveGeneratorMap.set(RookMoveGenerator.pieceW, RookMoveGenerator);
MoveGeneratorMap.set(BishopMoveGenerator.pieceW, BishopMoveGenerator);
MoveGeneratorMap.set(QueenMoveGenerator.pieceW, QueenMoveGenerator);
