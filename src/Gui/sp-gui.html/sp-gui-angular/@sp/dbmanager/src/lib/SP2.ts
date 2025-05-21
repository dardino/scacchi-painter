import {
  Figurine,
} from "canvas-chessboard/modules/es2018/canvasChessBoard";
import { Base64 } from "./base64";
import {
  Columns,
  PieceColors,
  PieceRotation,
  SP2PieceName,
  Traverse,
  XMLProblemTypesKeys,
  XMLStipulationTypes,
  createXmlElement,
  notEmpty,
  notNull,
} from "./helpers";

const invertMap = <K extends string, V extends string>(
  o: Record<K, V>
): Record<V, K> => {
  const keys = Object.keys(o) as K[];
  return keys.reduce(
    (m, k: K) => ({ ...m, [o[k]]: k }),
    {} as Record<V, K>
  );
};

const mapAppearance = {
  Bishop: "b",
  Horse: "n",
  HorseBishop: "a",
  HorseQueen: "e",
  HorseTower: "t",
  King: "k",
  Pawn: "p",
  Queen: "q",
  Rock: "r",
  /* @deprecated */ Rook: "r",
} as const;

const mapAppearanceRe = invertMap(mapAppearance);

const mapColors = {
  Both: "Neutral",
  Neutral: "Neutral",
  White: "White",
  Black: "Black",
} as const;

const mapColorsRe = invertMap(mapColors);

export class SP2 {
  static setRtfSolution(item: Element, rtfSolution: string) {
    const node = createXmlElement("SolutionRtf");
    node.innerHTML = Base64.encode(rtfSolution);
    item.appendChild(node);
  }
  static setHtmlSolution(item: Element, htmlSolution: string) {
    const node = createXmlElement("SolutionHTML");
    node.innerHTML = Base64.encode(htmlSolution);
    item.appendChild(node);
  }
  static setSolution(item: Element, textSolution: string) {
    const node = createXmlElement("Solution");
    node.innerHTML = Base64.encode(textSolution);
    item.appendChild(node);
  }
  static setConditions(item: Element, conditions: string[]) {
    const list = createXmlElement("Conditions");
    conditions.filter(notEmpty).forEach((c) => {
      const cx = createXmlElement("Condition");
      cx.setAttribute("Value", c);
      list.appendChild(cx);
    });
    item.appendChild(list);
  }
  static setTags(item: Element, tags: string[]) {
    const list = createXmlElement("Tags");
    tags.filter(notEmpty).forEach((c) => {
      const cx = createXmlElement("Tag");
      cx.setAttribute("Value", c);
      list.appendChild(cx);
    });
    item.appendChild(list);
  }
  static setTwins(item: Element, twins: Element) {
    item.appendChild(twins);
  }
  //#region PROBLEM
  static setPieces(item: Element, pieces: Element[]) {
    const pieceList = createXmlElement("Pieces");
    pieces.forEach((p) => {
      pieceList.appendChild(p);
    });
    item.appendChild(pieceList);
  }
  static setAuthors(item: Element, authors: Element[]) {
    const auList = createXmlElement("Authors");
    authors.forEach((a) => {
      auList.appendChild(a);
    });
    item.appendChild(auList);
  }
  static setCompleteStipulationDesc(item: Element, csd: string) {
    item.setAttribute("CompleteStipulationDesc", csd);
  }
  static setPrizeDescription(item: Element, prizeDescription: string) {
    item.setAttribute("PrizeDescription", prizeDescription);
  }
  static setPrizeRank(item: Element, prizeRank: number) {
    item.setAttribute("PrizeRank", prizeRank.toFixed(0));
  }
  static setSource(item: Element, source: string) {
    item.setAttribute("Source", source ?? "");
  }
  static setMaximum(item: Element, maximum: boolean) {
    item.setAttribute("Maximum", maximum ? "true" : "false");
  }
  static setSerie(item: Element, serie: boolean) {
    item.setAttribute("Serie", serie ? "true" : "false");
  }
  static setStipulation(item: Element, stipulationType: XMLStipulationTypes) {
    item.setAttribute("Stipulation", stipulationType);
  }
  static setPersonalID(item: Element, personalID: string) {
    item.setAttribute("PersonalID", personalID);
  }
  static setDate(item: Element, date: string) {
    item.setAttribute("Date", date);
  }
  static setMoves(item: Element, moves: number) {
    item.setAttribute("Moves", moves.toFixed(1));
  }
  static setProblemType(item: Element, problemType: XMLProblemTypesKeys) {
    item.setAttribute("ProblemType", problemType);
  }
  //#endregion

  // fairy
  static getFairyCodes(f: Element): { code: string; params: string[] }[] {
    const ft = f.querySelectorAll("FairyType");
    if (ft.length > 0) {
      return Array.from(ft).map((c) => ({
          code: c.getAttribute("code") ?? "",
          params: Array.from(c.querySelectorAll("Param"))
            .map((_el, i, all) => {
              const byIndex = all.find(
                (parm) => parm.getAttribute("id") === i.toFixed(0)
              );
              if (!byIndex) return null;
              return byIndex.getAttribute("value");
            })
            .filter(notNull),
        }));
    } else {
      return [];
    }
  }
  static setFairyCode(
    el: Element,
    fairyCode: { code: string; params: string[] }[]
  ) {
    if (fairyCode == null) return;
    fairyCode.forEach((fc) => {
      const fel = createXmlElement("FairyType");
      fel.setAttribute("code", fc.code); // retrocompatibility
      fc.params.forEach((p, i) => {
        const felParm = createXmlElement("Param");
        felParm.setAttribute("id", i.toFixed(0));
        felParm.setAttribute("value", p);
        fel.appendChild(felParm);
      });
      el.appendChild(fel);
    });
  }

  static getFairyAttribute(f: Element): string {
    return f.getAttribute("FairyAttribute") ?? "";
  }
  static setFairyAttribute(el: Element, fairyAttribute: string) {
    el.setAttribute("FairyAttribute", fairyAttribute);
  }

  // Piece rotation
  static setRotation(el: Element, source: PieceRotation) {
    el.setAttribute("Rotation", source);
  }
  static getRotation(rotation: Element) {
    return PieceRotation[
      Math.max(
        PieceRotation.indexOf(
          (rotation.getAttribute("Rotation") as PieceRotation) ?? "NoRotation"
        ),
        0
      )
    ];
  }
  // Piece traverse
  static setTraverse(el: Element, traverse: Traverse) {
    el.setAttribute("Traverse", traverse);
  }
  static getTraverse(f: Element): Traverse | null {
    return Traverse[
      Math.max(
        Traverse.indexOf((f.getAttribute("Traverse") as Traverse) || "Row1"),
        0
      )
    ];
  }
  // Piece column
  static setColum(el: Element, column: Columns) {
    el.setAttribute("Column", column);
  }
  static getColum(f: Element): Columns | null {
    return Columns[
      Math.max(
        Columns.indexOf((f.getAttribute("Column") as Columns) || "ColA"),
        0
      )
    ]; // double map to coalesce a valid value
  }
  // Piece color
  static setColor(el: Element, color: PieceColors | "") {
    if (color === "") return;
    let tp = mapColorsRe[color];
    if (tp === "Both") tp = "Neutral";
    el.setAttribute("Color", tp);
  }
  static getColor(c: Element): PieceColors {
    return mapColors[
      (c.getAttribute("Color") ?? "White") as keyof typeof mapColors
    ];
  }
  // Piece type
  static getAppearance(f: Element): Figurine | "" {
    const pieceName = f.getAttribute("Type") as SP2PieceName;
    return mapAppearance[pieceName] ?? "";
  }
  static setAppearance(el: Element, f: Figurine | ""): void {
    if (f === "") return;
    let tp = mapAppearanceRe[f];
    if (tp === "Rook") tp = "Rock"; // retrocompatibility
    el.setAttribute("Type", tp);
  }
}
