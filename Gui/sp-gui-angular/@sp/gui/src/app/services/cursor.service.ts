import { ChessPieceRotation } from "@dardino/chess-board";

export const getPieceIcon = (
  figurine: string,
  cellSize: number,
  rot: ChessPieceRotation | null,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = cellSize;
  canvas.height = cellSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Can not create 2d context!");
  }
  const fsize = Math.floor(cellSize / 1.44);
  const margin = Math.floor((cellSize - fsize) / 2);
  const fontFamily = "ScacchiPainter";
  ctx.font = `${fsize}px ${fontFamily}`;
  ctx.lineWidth = 2;

  if (rot != null) {
    const center = Math.floor(cellSize / 2);
    ctx.translate(center, center);
    ctx.rotate(parseInt(rot) * (Math.PI / 180));
    ctx.translate(-center, -center);
  }

  ctx.translate(margin, margin + fsize);
  ctx.save();

  if (figurine !== "X") {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText("_" + figurine.substring(1), 0, 0);
    ctx.fillText("_" + figurine.substring(1), 0, 0);
    ctx.restore();
  }

  ctx.fillStyle = figurine === "X" ? "#ff3300" : "#333333";
  ctx.strokeStyle = "#ffffff";
  ctx.strokeText(figurine === "X" ? "🗙" : figurine, 0, 0);
  ctx.fillText(figurine === "X" ? "🗙" : figurine, 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/png");
};
