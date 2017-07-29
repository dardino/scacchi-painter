using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	[Figurine(PieceFigurine.King)]
	public class King : PieceBase
	{
		static ulong movesFromB2 = 0xE0A0E0;
		static int b2Index = (int)BoardSquare.GetSquareIndex(Columns.ColB, Rows.Row2);

		public override ulong GetCapturesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			ulong moves = GetMovesFromPosition(col, row);
			return (moves & enemies);
		}

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			var coords = (BoardSquare)s;
			return GetCapturesFromPosition(coords.Column, coords.Row, allied, enemies);
		}

		public override ulong GetMovesFromPosition(Columns col, Rows row, ulong allied, ulong enemies) {
			ulong moves = GetMovesFromPosition(col, row);
			return (allied & moves) ^ moves;
		}

		public override ulong GetMovesFromPosition(Columns col, Rows row)
		{
			var fromSq = (int)BoardSquare.GetSquareIndex(col, row);
			var c = fromSq - b2Index;
			if (c == 0) return movesFromB2;
			var m2clone = movesFromB2;
			if (c < 0) m2clone = m2clone >> (c * -1);
			if (c > 0) m2clone = m2clone << c;

			if (col == Columns.ColA) m2clone &= 0xFEFEFEFEFEFEFEFE;
			if (col == Columns.ColH) m2clone &= 0x7F7F7F7F7F7F7F7F;

			return m2clone;
		}

		public override ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies)
		{
			var bb = (BoardSquare)s;
			return GetMovesFromPosition(bb.Column, bb.Row, allied, enemies);
		}

		public override bool IsAttackingSquare(Square fromSquare, Square attackingSquare, ulong allied, ulong enemies)
		{
			var moves = GetMovesFromPosition(fromSquare, allied, enemies);
			return ((ulong)Math.Pow(2, (int)attackingSquare) & moves) > 0;
		}
	}
}
