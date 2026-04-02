import { PawnMoveGenerator } from "./pawn/pawn";
import { PieceMoveGenerator, PieceMoveGeneratorMap } from "./piece.types";

export const MoveGeneratorMap: PieceMoveGeneratorMap = new Map<string, PieceMoveGenerator>();

MoveGeneratorMap.set("p", PawnMoveGenerator);
