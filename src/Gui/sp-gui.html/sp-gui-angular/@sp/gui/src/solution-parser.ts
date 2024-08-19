import { SolutionMove } from "@sp/host-bridge/src/lib/bridge-global";
const rxSource = `(?<move_no>\\d?[. ]+)?(?:(?<piece>[A-Z]*)(?<move>[a-z][1-8][-*][a-z][1-8](?:[-*][a-z][1-8])?)(?<extra>\\[[^\\[]*\\]|=[A-Z]+)?(?<notice>[ .!?+#=]+)?(?<cont>threat:)?)` as const;
type RxGroups<T extends string> = T extends `${string}<${infer G}>${infer X}` ? G | RxGroups<X> : never;
const popeyeParserRX = new RegExp(rxSource, "gm");
type MatchGroups = Partial<Record<RxGroups<typeof rxSource>, string>>;

export function parsePopeyeRow(row: string): SolutionMove[] {
  let matches;
  let lastMove = "1";
  const rx = new RegExp(popeyeParserRX.source, "gm");
  console.group("processing row: ", row);
  const returnMoves: SolutionMove[] = [];
  let parentMove: SolutionMove;
  let counter = 0;
  while ((matches = rx.exec(row)) !== null) {
    counter++;
    if (counter >= 50) {
      console.error(new Error("Max match loop reached 50"));
      break;
    }
    const grps = matches.groups as MatchGroups;
    if (matches[0].trim() == "")
      continue;

    console.log("🚀 ~ parsePopeyeRow ~ grps:", grps)
    lastMove = grps.move_no?.trim() ?? (lastMove + "5");
    if (lastMove.includes("..")) lastMove = lastMove.replace(/\.*/g, "") + ".5";
    const solMove: SolutionMove = {
      move: grps.move?.trim() ?? "",
      moveN: parseFloat(lastMove),
      piece: grps.piece?.trim() ?? "",
      notice: grps.notice?.trim() ?? "",
      continuation: grps.cont?.toLocaleLowerCase().includes("threat") === true ? "threat"
            : grps.cont?.toLocaleLowerCase().includes("zugzwang") === true ? "zugzwang" : "",
      extras: parseExtras(grps.extra?.trim())
    };
    console.log(solMove);
    returnMoves.push(solMove);
  }
  console.groupEnd();
  return returnMoves;
}

function parseExtras(extra: string | undefined) {
  if (!!extra) return []
  return [];
}
