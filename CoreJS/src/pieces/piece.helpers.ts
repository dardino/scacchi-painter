import { BishopMoveGenerator } from "./bishop/bishop";
import { KingMoveGenerator } from "./king/king";
import { KnightMoveGenerator } from "./knight/knight";
import { PawnMoveGenerator } from "./pawn/pawn";
import { PieceMoveGenerator, PieceMoveGeneratorMap } from "./piece.types";
import { QueenMoveGenerator } from "./queen/queen";
import { RookMoveGenerator } from "./rook/rook";

export const MoveGeneratorMap: PieceMoveGeneratorMap = new Map<string, PieceMoveGenerator>();

MoveGeneratorMap.set("p", PawnMoveGenerator);
MoveGeneratorMap.set("k", KingMoveGenerator);
MoveGeneratorMap.set("n", KnightMoveGenerator);
MoveGeneratorMap.set("r", RookMoveGenerator);
MoveGeneratorMap.set("b", BishopMoveGenerator);
MoveGeneratorMap.set("q", QueenMoveGenerator);
