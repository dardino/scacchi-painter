import type { HalfMoveInfo } from "@dardino-chess/core";
import { notEmpty } from "@sp/dbmanager/src/public-api";

export type TreeMove<T> = { id: number; move: T; parentId: number | null; lineAge: string };

function getRealMoveNum(move: HalfMoveInfo | null): number {
  return (move?.num ?? -1) + (move?.part === "r" ? 0.5 : 0);
}

export function getParent(lastTreeNode: TreeMove<HalfMoveInfo> | null, moveNum: number, allTree: TreeMove<HalfMoveInfo>[]) {
  const lastTreeMoveNum = getRealMoveNum(lastTreeNode?.move ?? null);
  if (lastTreeMoveNum < moveNum) return lastTreeNode ?? null;
  while (true) {
    const parent = allTree.find(node => node.id === lastTreeNode!.parentId) ?? null;
    if (parent === null) {
      lastTreeNode = null;
      break;
    }
    if (getRealMoveNum(parent.move) <= moveNum - 0.5) {
      lastTreeNode = parent;
      break;
    }
    lastTreeNode = parent;
    continue;
  }
  return lastTreeNode ?? null;
}

export function buildTreeMoves(rows: HalfMoveInfo[]): TreeMove<HalfMoveInfo>[] {
  const tree: TreeMove<HalfMoveInfo>[] = [];
  let lastTreeNode: TreeMove<HalfMoveInfo> | null = null;
  rows.forEach((move) => {
    const moveNum = move.num + (move.part === "r" ? 0.5 : 0);
    const parent = getParent(lastTreeNode, moveNum, tree);
    // la mossa apre un nuovo ramo nell'albero delle mosse,
    // verifico se si tratta di uno ramo radice o solo devo tornare indietro
    // il nuovo ramo è un ramo radice
    const node: TreeMove<HalfMoveInfo> = {
      id: tree.length,
      move,
      parentId: parent?.id ?? null,
      lineAge: [parent?.lineAge, tree.length].filter(notEmpty).join("|"),
    };
    tree.push(node);
    lastTreeNode = tree[tree.length - 1];
  });
  return tree;
}
