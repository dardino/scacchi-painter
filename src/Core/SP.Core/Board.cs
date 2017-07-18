using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core
{
	public class Board
	{
		public Cell this[int index]
		{
			get {
				return cells[index];
			}
		}

		private Cell[] cells = new Cell[64];

		public PieceBase GetPiece(Columns col, Rows row) {
			return this[indexFromCoord(col, row)].Piece;
		}

		private static int indexFromCoord(Columns col, Rows row)
		{
			return (int)col + (int)row * 8;
		}

		public Board()
		{
			for (int i = 0; i < 64; i++)
			{
				cells[i] = new Cell(i);
			}
		}

		public void PlacePieceOnBoard(Columns col, Rows row, PieceBase piece)
		{
			cells[indexFromCoord(col, row)].SetPiece(piece);
		}
	}
}
