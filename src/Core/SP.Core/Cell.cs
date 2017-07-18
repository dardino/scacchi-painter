using System;
using SP.Core.Pieces;

namespace SP.Core
{
	public class Cell
	{
		private int cellindex;
		public Columns Column => (Columns)(cellindex % 8);
		public Rows Row => (Rows)(Math.Floor(cellindex / 8d));

		private PieceBase piece = null;

		public bool Occupied => piece != null;

		public PieceBase Piece => piece;

		public Cell(int index)
		{
			cellindex = index;

		}
		public void SetPiece(PieceBase piece)
		{
			this.piece = piece;
		}
	}
}