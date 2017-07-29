using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	[Figurine(PieceFigurine.Pawn)]
	public class Pawn : PieceBase
	{
		
		public override ulong GetCapturesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			var index = BoardSquare.GetSquareIndex(col, row);
			return GetCapturesFromPosition(index, allied, enemies);
		}

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			int index = (int)s;
			int i1 = index + (Color == PieceColors.White ? 7 : -7);
			int i2 = index + (Color == PieceColors.White ? 9 : -9);
			ulong m1 = (i1 <= 0 || i1 > 63 || index == (int)Columns.ColH) ? 0 : (ulong)Math.Pow(2, i1);
			ulong m2 = (i2 <= 0 || i2 > 63 || index == (int)Columns.ColA) ? 0 : (ulong)Math.Pow(2, i2);
			return (m1 | m2) & enemies;
		}

		public override ulong GetMovesFromPosition(Columns col, Rows row)
		{
			return GetMovesFromPosition(col, row, 0, 0);
		}

		public override ulong GetMovesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			var index = BoardSquare.GetSquareIndex(col, row);
			return GetMovesFromPosition(index, allied, enemies);
		}

		public override ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies)
		{
			int index = (int)s;
			int i1 = index + (Color == PieceColors.White ? 8 : -8);
			int i2 = index + (Color == PieceColors.White ? 16 : -16);
			if (i1 <= 0 || i1 > 63) return GetCapturesFromPosition(s, allied, enemies);
			var m1 = (ulong)Math.Pow(2, i1);
			if ((enemies & m1) != 0) return GetCapturesFromPosition(s, allied, enemies);
			ulong m2 = 0;
			ulong fromOrigin = (Color == PieceColors.White) ? (ulong)0x0000000000ff0000 : 0x0000ff0000000000;
			if ((m1 & fromOrigin) > 0) m2 = (ulong)Math.Pow(2, i2);
			var freeMove = (enemies & (m1 | m2)) ^ (m1 | m2);
			return freeMove | GetCapturesFromPosition(s, allied, enemies);
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}
	}
}
