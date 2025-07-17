import type { HalfMoveInfo } from "@dardino-chess/core";
const Rx = /(?:^| )(?<moveN>\d\.)/;
const parts = /^(?<left>\..|[\w*-=[\]>]*[ +#?!]*(?:threat:|zugzwang\.)?)(?<right>.*)$/;
const halfMoveRx = /(?<setplay>\.{3})|(?<piece>\w*)(?<from>[a-h][1-8])(?<type>[-*])(?<to>[a-h][1-8])(?<promotion>=\w+)?(?<extraMoves>\[.*\])?(?:\s?(?:(?<mate>#)|(?<stale>=)|(?<check>\+)|(?<try>\?)|(?<refutes>!)))*(?<threat>\s?threat:)?(?<zugzwang>\s?zugzwang\.)?/;
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

export function parseHalfMove(moveN: number, part: "l" | "r", halfMove?: string): HalfMoveInfo | null {
  if (!halfMove) return null;
  const parsed = halfMoveRx.exec(halfMove);
  if (!parsed?.groups) return null;
  return {
    num: moveN,
    extraMoves: parsed.groups.extraMoves ? [parsed.groups.extraMoves] : [],
    from: parsed.groups.from as HalfMoveInfo["from"],
    to: parsed.groups.to as HalfMoveInfo["to"],
    isCheck: !!parsed.groups.check,
    isCheckMate: !!parsed.groups.mate,
    isPromotion: !!parsed.groups.promotion,
    isStaleMate: !!parsed.groups.stale,
    type: parsed.groups.type as HalfMoveInfo["type"],
    part,
    piece: parsed.groups.piece as HalfMoveInfo["piece"] ?? "P",
    promotedPiece: parsed.groups.promotion?.slice(1) ?? "",
    isTry: !!parsed.groups.try,
    refutes: !!parsed.groups.refutes,
    threat: !!parsed.groups.threat,
    zugzwang: !!parsed.groups.zugzwang,
  }
}

export const parsePopeyeRow = (move: string): [number, [left: HalfMoveInfo | null, right: HalfMoveInfo | null]][] => {
  const splitted = SplitRow(move);
  return splitted.map(item => ([
    item[0],
    [
      parseHalfMove(item[0], "l", item[1]?.left),
      parseHalfMove(item[0], "r", item[1]?.right),
    ] as [left: HalfMoveInfo | null, right: HalfMoveInfo | null],
  ]));
};
