import type { HalfMoveInfo } from "@dardino-chess/core";
import { Stipulation } from "@sp/dbmanager/src/lib/models/stipulation";
const Rx = /(?:^| )(?<moveN>\d\.)/;
const parts = /^(?<left>\..|[\w*-=[\]>]*[ +#?!]*(?:threat:|zugzwang\.)?)(?<right>.*)$/;
const halfMoveRx = /(?<setplay>\.{3})|(?<piece>\w*)(?<from>[a-h][1-8])(?<type>[-*])(?<to>[a-h][1-8])(?<promotion>=\w+)?(?<extraMoves>\[.*\])?(?<effects>(?:\s?[#=+?!])*)(?<threat>\s?threat:)?(?<zugzwang>\s?zugzwang\.)?/;

export function SplitRow(row: string) {
  return row.split(Rx).reduce((aggr, item, index, arr) => {
    if (index % 2 === 0 && index > 1) {
      aggr.push([
        parseFloat(arr[index - 1]),
        parts.exec(item)?.groups as { left?: string; right?: string } | undefined,
      ]);
    }
    return aggr;
  }, [] as [number, { left?: string; right?: string } | undefined][]);
}

const whiteShortCastlingMove = "Ke1-g1[Rh1-f1]";
const whiteLongCastlingMove = "Ke1-c1[Ra1-d1]";
const blackShortCastlingMove = "Ke8-g8[Rh8-f8]";
const blackLongCastlingMove = "Ke8-c8[Ra8-d8]";

const moveByCastling: Record<string, (color: "w" | "b") => string> = {
  "0-0": color => color === "w" ? whiteShortCastlingMove : blackShortCastlingMove,
  "0-0-0": color => color === "w" ? whiteLongCastlingMove : blackLongCastlingMove,
};

export function parseHalfMove(moveN: number, moveColor: "w" | "b", part: "l" | "r", halfMove?: string, startMoveN = 1, twin?: string): HalfMoveInfo | null {
  if (!halfMove) return null;
  const parsed = halfMoveRx.exec(halfMove);
  if (!parsed?.groups) {
    // Check if is castling move (0-0 or 0-0-0)
    if (halfMove.startsWith("0-0")) {
      const castlingLenght = halfMove.startsWith("0-0-0") ? "0-0-0" : "0-0";
      const moveToParse = moveByCastling[castlingLenght](moveColor);
      const castlingHalfMove = parseHalfMove(moveN, moveColor, part, moveToParse, startMoveN, twin);
      if (!castlingHalfMove) return null;
      castlingHalfMove.isCastling = true;
      castlingHalfMove.zugzwang = halfMove.includes("zugzwang");
      castlingHalfMove.isCheck = halfMove.includes("+");
      castlingHalfMove.isCheckMate = halfMove.includes("#");
      castlingHalfMove.isStaleMate = halfMove.includes("=");
      castlingHalfMove.isTry = halfMove.includes("?");
      castlingHalfMove.refutes = halfMove.includes("!") && moveN !== startMoveN;
      castlingHalfMove.isKey = halfMove.includes("!") && moveN === startMoveN;
      castlingHalfMove.castlingLength = castlingLenght;
      return castlingHalfMove;
    }
    else {
      return null;
    }
  }

  const effects = parsed.groups.effects?.split("").filter(eff => !!eff) ?? [];

  const halfMoveInfo: HalfMoveInfo = {
    num: moveN,
    extraMoves: parsed.groups.extraMoves ? [parsed.groups.extraMoves] : [],
    from: parsed.groups.from as HalfMoveInfo["from"],
    to: parsed.groups.to as HalfMoveInfo["to"],
    isPromotion: !!parsed.groups.promotion,
    type: parsed.groups.type as HalfMoveInfo["type"],
    part,
    piece: parsed.groups.piece as HalfMoveInfo["piece"] ?? "P",
    promotedPiece: parsed.groups.promotion?.slice(1) ?? "",
    threat: !!parsed.groups.threat,
    zugzwang: !!parsed.groups.zugzwang,
    isCheck: effects.includes("+"),
    isCheckMate: effects.includes("#"),
    isStaleMate: effects.includes("="),
    isTry: effects.includes("?"),
    refutes: effects.includes("!") && moveN !== startMoveN,
    isKey: effects.includes("!") && moveN === startMoveN,
    fromTwin: twin ?? "",
    color: moveColor,
    isCastling: false,
    castlingLength: "",
  };
  return halfMoveInfo;
}

export const parsePopeyeRow = (move: string, stipulation: Stipulation, startMoveN: number, twin: string): [number, [left: HalfMoveInfo | null, right: HalfMoveInfo | null]][] => {
  const splitted = SplitRow(move);
  return splitted.map(item => ([
    item[0],
    [
      parseHalfMove(item[0], stipulation.moveColors[0] === "White" ? "w" : "b", "l", item[1]?.left, startMoveN, twin),
      parseHalfMove(item[0], stipulation.moveColors[1] === "White" ? "w" : "b", "r", item[1]?.right, startMoveN, twin),
    ] as [left: HalfMoveInfo | null, right: HalfMoveInfo | null],
  ]));
};
