import { Piece, Problem } from "@sp/dbmanager/src/lib/models";
import { TwinModes, TwinTypesKeys } from "@sp/dbmanager/src/public-api";
import { SolveModes } from "@sp/host-bridge/src/lib/bridge-global";

export const popeyeTwinMapper: Record<
  TwinTypesKeys,
  (...args: string[]) => string
> = {
  Custom: (...args: string[]) => args.join(" ").trim(),
  Diagram: () => `Diagram`,
  MovePiece: (...args: string[]) => `Move ${args.join(" ")}`.trim(),
  RemovePiece: (...args: string[]) => `Remove ${args[0]}`.trim(),
  AddPiece: (...args: string[]) => `Add ${args.join(" ")}`.trim(),
  Substitute: (...args: string[]) =>
    `Substitute ${args[0]} ==> ${args[1]}`.trim(),
  SwapPieces: (...args: string[]) =>
    `Exchange ${args[0]} <-> ${args[1]}`.trim(),
  Rotation90: () => `Rotate 90`,
  Rotation180: () => `Rotate 180`,
  Rotation270: () => `Rotate 270`,
  TraslateNormal: (...args: string[]) =>
    `Shift: ${args[0]} -> ${args[1]}`.trim(),
  TraslateToroidal: (...args: string[]) =>
    `Shift: ${args[0]} -> ${args[1]}`.trim(),
  MirrorHorizontal: () => `Mirror a1<-->a8`,
  MirrorVertical: () => `Mirror a1<-->h1`,
  Stipulation: (...args: string[]) => `Stipulation > ${args.join(" ")}`.trim(),
  ChangeProblemType: (...args: string[]) =>
    `Stipulation > ${args.join(" ")}`.trim(),
  Duplex: () => `Duplex`,
  AfterKey: () => `After Key`,
  SwapColors: () => `PolishType`,
  Condition: (...args: string[]) => `Condition ${args.join(" ")}`.trim(),
  Mirror: (...args: string[]) => `Mirror ${args.join(" ")}`.trim(),
};

const pieceSortByName = (a: Piece, b: Piece): -1 | 0 | 1 => {
  const na = a.ToNotation();
  const nb = b.ToNotation();
  return na < nb ? -1 : na > nb ? 1 : 0;
};

const toPopeyePiece = (a: Piece): string =>
  [
    (a.fairyCode[0] ?? {}).code?.toUpperCase() ||
      a.appearance.toUpperCase().replace("N", "S"),
    a.column[3].toLowerCase(),
    a.traverse[3],
  ].join("");

export function problemToPopeye(problem: Problem, mode: SolveModes): string[] {
  const rows: string[] = [];

  const extraOptions: string[] = [];

  // BeginProblem
  rows.push("BeginProblem");
  // Condition
  if (problem.conditions.filter((f) => f !== "").length > 0) {
    rows.push(`Condition ${problem.conditions.join(" ")}`);
  }
  // Pieces
  rows.push("Pieces");
  (["White", "Black", "Neutral"] as Piece["color"][]).forEach((color) => {
    const withAttr = problem.pieces
      .filter((c) => c.color === color)
      .sort(pieceSortByName)
      .map(toPopeyePiece);
    if (withAttr.length > 0) rows.push(`${color} ${withAttr.join(" ")}`);
  });
  // Stipulation
  let dmoves = Math.floor(problem.stipulation.moves);
  if (dmoves !== problem.stipulation.moves) {
    extraOptions.push("WhiteToPlay");
    dmoves++;
  }
  if (mode === "try") extraOptions.push("PostKeyPlay");
  rows.push(
    `Stipulation ${problem.stipulation.simpleStipulationDesc}${dmoves}`
  );

  // Options
  extraOptions.push(...["NoBoard", "Try", "Set", "Variation"]);
  rows.push(`Option ${extraOptions.join(" ")}`);

  // Twins
  problem.twins.TwinList.forEach((t) => {
    if (t.TwinType === "Diagram") return;
    rows.push(
      `Twin ${
        t.TwinModes === TwinModes.Combined ? "Cont " : ""
      }${popeyeTwinMapper[t.TwinType](t.ValueA, t.ValueB, t.ValueC)}`
    );
  });

  rows.push(`EndProblem`);
  return rows;
}
