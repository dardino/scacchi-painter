// from popeye:
/**
 * - Twin: Solving/testing of positions obtained by small changes of the
 * 	initial position. The following specifications are supported:
 *     Stipulation ...: The stipulation is changed. See the repective basic
 * 	command.
 *     Condition ...: Cange of fairy conditions. The old conditions are
 * 	subsituted by those put in.
 *     Move <square1> <square2>: Move the piece from square1 to square2. A
 * 	piece accidentally standing on square2 will be removed. Example:
 * 	twin move a3 b4.
 *     Exchange <square1> <square2>: The pieces on <square1> and <square2>
 * 	exchange places. Example: twin exchange a3 b4.
 *     Remove <square>: The piece located on the square specified is removed.
 * 	Example: twin remove e5.
 *     Substitute <piece1> <piece2>: All pieces of type <piece1> are replaced
 * 	by pieces of type <piece2>. Colour and further piece specifications
 * 	(like paralysing etc.) are not affected. Example: twin
 * 	substitute R B.  All rooks are replaced by bishops.
 *     Add <colour> <piecespecs> <type><squarelist>: Add pieces - present pieces
 * 	are replaced.
 * 	Example: twin add black para NHa6 - a black paralysing NightriderHopper is
 * 	added on a6. See the basic command "pieces".
 * 	The "pseudo color" TotalInvisible followed by a positive number can
 * 	be used to indicate twinning by modification of the number of TotalInvisible
 * 	pieces.
 *     Rotate n: Turns the board by n degrees to the left (n=90, 180, 270).
 * 	Example: twin rotate 180.
 *     Mirror a1<-->h1: Mirrors the position on the vertical middle line.
 *     Mirror a1<-->a8: Mirrors the position on the horizontal middle line.
 *     Mirror a1<-->h8: Mirrors the position on the diagonal a8-h1.
 *     Mirror a8<-->h1: Mirrors the position on the diagonal a1-h8.
 * 	So, not the mirror line is given, but square into which a1 (or h1)
 * 	is turned into.
 *     Shift <square1> <square2>: Shift the whole position into the direction
 * 	determined by the two squares entered. Example: twin shift a1 a2 -
 * 	all pieces are moved one square up.
 *     PolishType: All pieces change colour.
 *
 * 	More than one change may be specified, for example twin rem e7
 * 	add white qe8. As you can see the twinning commands can abreviated.
 * 	By default the changes refer to the position initially set.
 * 	Alternatively the changes can be applied to the position solved most
 * 	recently. Just enter "continued" (or "cont") immediately after
 * 	"twin". Example twin cont rem a1.
 *
 * - ZeroPosition: This command can be used alternatively to the command
 * 	"twin". It indicates that the initial position is not for solving.
 * 	The command must be followed by the changes for the first position
 * 	to be solved. Example: zero move b4 d5
 * 			       twin move c5 b5.
 *
 *
 */

import { FairyAttributes, PieceColors, TwinTypesKeys } from "./helpers";
import { SquareLocations } from "./models/locations";

const Squares = Object.keys(SquareLocations) as (keyof typeof SquareLocations)[];

export interface TwinTypeItemParameter {
  type: "string" | "string[]" | "pieceName";
  id: string;
  optional?: boolean;
  description: string;
  values?: string[];
}

export interface TwinTypeItem<K extends TwinTypesKeys> {
  keyword: K;
  title: string;
  parameters: TwinTypeItemParameter[];
  template: string;
}

export const TwinTypesConfigs: { [key in TwinTypesKeys]: TwinTypeItem<key> } = {
  Stipulation: {
    keyword: `Stipulation`,
    title: "Changes the stipulation. (ex: H#3)",
    parameters: [{ type: "string", id: "stipulation", description: "Write a new stipulation" }],
    template: `stipulation {stipulation}`
  },
  Condition: {
    keyword: `Condition`,
    title: "Change of fairy conditions. The old conditions are subsituted by those put in",
    parameters: [{ type: "string[]", id: "conditions", description: "Select new condition" }],
    template: `condition {conditions}`
  },
  MovePiece: {
    keyword: `MovePiece`,
    title: `Move the piece from {square1} to {square2}.
            A piece accidentally standing on {square2} will be removed.
            Example: twin move a3 b4.`,
    parameters: [
      {
        type: "string",
        id: "square1",
        description: "From square",
        values: Squares
      },
      {
        type: "string",
        id: "square2",
        description: "To square"  ,
        values: Squares
      }
    ],
    template: `move {square1} {square2}`,
  },
  SwapPieces: {
    keyword: `SwapPieces`,
    title: `The pieces on {square1} and {square2}	exchange places.
            Example: twin exchange a3 b4.`,
    parameters: [
      {
        type: "string",
        id: "square1",
        description: "From square",
        values: Squares
      },
      {
        type: "string",
        id: "square2",
        description: "To square"  ,
        values: Squares
      },
    ],
    template: `exchange {square1} {square2}`,
  },
  RemovePiece: {
    keyword: `RemovePiece`,
    title: `The piece located on the square specified is removed.	Example: twin remove e5.`,
    parameters: [
      {
        type: "string",
        id: "square",
        description: "Square",
        values: Squares
      },
    ],
    template: `remove {square}`,
  },
  Substitute: {
    keyword: `Substitute`,
    title: `All pieces of type {piece1} are replaced by pieces of type {piece2}.
            Colour and further piece specifications (like paralysing etc.) are not affected.
            Example: twin	substitute R B. All rooks are replaced by bishops.`,
    parameters: [
      { type: "pieceName", id: "piece1", description: "Piece to substitute" },
      { type: "pieceName", id: "piece2", description: "Piece to substitute with" }
    ],
    template: `substitute {piece1} {piece2}`,
  },
  AddPiece: {
    keyword: `AddPiece`,
    title: `{colour} {piecespecs} {type}{squarelist}: Add pieces - present pieces	are replaced.
            Example: twin add black para NHa6 - a black paralysing NightriderHopper is	added on a6.
            See the basic command "pieces".
            The "pseudo color" TotalInvisible followed by a positive number can be used to
            indicate twinning by modification of the number of TotalInvisible pieces.`,
    parameters: [
      { id: "colour", type: "string", description: "Colour", values: PieceColors.map(col => col) },
      { id: "piecespecs", type: "string", description: "Attributes", values: FairyAttributes.map(arg => arg), optional: true },
      { id: "type", type: "pieceName", description: "Piece" },
      { id: "squarelist", type: "string", description: "Square", values: Squares }
    ],
    template: `add {colour} {piecespecs} {type}{squarelist}`,
  },
  Rotation90: {
    keyword: `Rotation90`,
    title: `n: Turns the board by 90 degrees to the left`,
    parameters: [],
    template: `rotate 90`,
  },
  Rotation180: {
    keyword: `Rotation180`,
    title: `n: Turns the board by 180 degrees to the left`,
    parameters: [],
    template: `rotate 180`,
  },
  Rotation270: {
    keyword: `Rotation270`,
    title: `n: Turns the board by 290 degrees to the left`,
    parameters: [],
    template: `rotate 270`,
  },
  Mirror: {
    keyword: `Mirror`,
    title: `Mirrors the position based on chosen axis.`,
    parameters: [
      { id: "axis", type: "string", description: "Choose mirror axis", values: ["a1<-->h1", "a1<-->a8", "a1<-->h8", "a8<-->h1"]},
    ],
    template: `mirror {axis}`,
  },
  MirrorVertical: {
    keyword: `MirrorVertical`,
    title: `Mirrors the position based on chosen axis.`,
    parameters: [],
    template: `mirror a1<-->h1`,
  },
  MirrorHorizontal: {
    keyword: `MirrorHorizontal`,
    title: `Mirrors the position based on chosen axis.`,
    parameters: [],
    template: `mirror a1<-->h8`,
  },
  TraslateToroidal: {
    keyword: "TraslateToroidal",
    title: "{square1} {square2}: Shift the whole position into the direction determined by the two squares entered.",
    parameters: [
      {
        type: "string",
        id: "square1",
        description: "From square",
        values: Squares
      },
      {
        type: "string",
        id: "square2",
        description: "To square"  ,
        values: Squares
      }
    ],
    template: `translate {square1} {square2}`,
  },
  TraslateNormal: {
    keyword: `TraslateNormal`,
    title: `{square1} {square2}: Shift the whole position into the direction determined by the two squares entered.
            Example: twin shift a1 a2 - all pieces are moved one square up.`,
    parameters: [
      {
        type: "string",
        id: "square1",
        description: "From square",
        values: Squares
      },
      {
        type: "string",
        id: "square2",
        description: "To square"  ,
        values: Squares
      }
    ],
    template: `translate {square1} {square2}`,
  },
  SwapColors: {
    keyword: `SwapColors`,
    title: `All pieces change colour.`,
    parameters: [],
    template: `PolishType`,
  },
  ChangeProblemType: {
    keyword: "ChangeProblemType",
    title: "Changes the stipulation. (ex: H#3)",
    parameters: [{ type: "string", id: "stipulation", description: "Write a new stipulation" }],
    template: `stipulation {stipulation}`
  },
  Custom: {
    keyword: "Custom",
    title: "Custom twin",
    parameters: [
      { type: "string", id: "p1", description: "Custom twin command" },
      { type: "string", id: "p2", description: "Custom args" }
    ],
    template: `{p1} {p2}`
  },
  AfterKey: {
    keyword: "AfterKey",
    title: "After Key",
    parameters: [
      {
        type: "string",
        id: "square1",
        description: "key move from square",
        values: Squares
      },
      {
        type: "string",
        id: "square2",
        description: "key move to square",
        values: Squares
      }
    ],
    template: `move {square1} {square2}`,
  },
  Diagram: {
    keyword: "Diagram",
    parameters: [],
    title: "Diagram",
    template: ``
  },
  Duplex: {
    keyword: "Duplex",
    title: `All pieces change colour.`,
    parameters: [],
    template: `polishtype`,
  }
};


//  - ZeroPosition: This command can be used alternatively to the command
// 	"twin". It indicates that the initial position is not for solving.
// 	The command must be followed by the changes for the first position
// 	to be solved. Example: zero move b4 d5
// 			       twin move c5 b5.
